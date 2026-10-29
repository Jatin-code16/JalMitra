# api/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, validator
from typing import Optional          # ← ADD THIS LINE
import re
import uuid
from db.connection import get_db
from db.models import User, Farm
from services.otp_service import (
    generate_otp, store_otp,
    verify_otp, send_otp_sms
)
from services.jwt_service import create_access_token, get_current_user
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ─────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone: str
    name: Optional[str] = None   # For new farmers

    @validator("phone")
    def validate_phone(cls, v):
        # Remove spaces and dashes
        phone = re.sub(r'[\s\-]', '', v)
        # Indian phone: 10 digits, starts with 6-9
        if not re.match(r'^[6-9]\d{9}$', phone):
            raise ValueError(
                "Phone number sahi nahi hai. "
                "10 digit ka Indian number dalein."
            )
        return phone


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None 
    language: Optional[str] = "hi" 

    @validator("otp")
    def validate_otp(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP 6 digit ka hona chahiye")
        return v


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None


# Fix missing import
from typing import Optional


# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Step 1 of login.
    Farmer enters phone → OTP sent to their phone.
    """

    # Generate OTP
    otp = generate_otp()

    # Store OTP (with expiry)
    store_otp(request.phone, otp)

    # Send via SMS (prints to terminal in debug mode)
    await send_otp_sms(request.phone, otp)

    # Check if farmer already exists
    result = await db.execute(
        select(User).where(User.phone == request.phone)
    )
    existing_user = result.scalar_one_or_none()
    is_new_farmer = existing_user is None

    response = {
        "success": True,
        "message": "OTP bhej diya gaya hai",
        "is_new_farmer": is_new_farmer,
        "expires_in_seconds": 300,
    }

    # Only expose the OTP in debug mode, for local testing
    if settings.debug:
        response["debug_otp"] = otp

    return response


@router.post("/verify-otp")
async def verify_otp_endpoint(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Step 2 of login.
    Farmer enters OTP → gets JWT token.
    New farmers are created automatically.
    """

    # Verify OTP
    result = verify_otp(request.phone, request.otp)
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": result["error"],
                "message": result["message"]
            }
        )

    # Find or create farmer
    user_result = await db.execute(
        select(User).where(User.phone == request.phone)
    )
    user = user_result.scalar_one_or_none()

    if not user:
        # New farmer — create account automatically
        farmer_name = request.name.strip() \
                      if request.name and request.name.strip() \
                      else "Kisan Bhai"
        
        user = User(
            id=uuid.uuid4(),
            name=farmer_name,
            phone=request.phone,
            language=request.language or "hi"
        )
        db.add(user)
        await db.flush()

        from sqlalchemy import select as sa_select
        farm_check = await db.execute(
            sa_select(Farm).where(Farm.id == "farm001")
        )
        farm001 = farm_check.scalar_one_or_none()

        # The first farmer gets the demo farm "farm001" (the simulator's farm).
        # Everyone after that gets their own farm — never someone else's.
        farm = Farm(
            id="farm001" if not farm001 else f"farm-{uuid.uuid4().hex[:8]}",
            user_id=user.id,
            name="Mera Khet",
            crop_type="wheat",
            area_acres=1.0
        )
        db.add(farm)

        await db.flush()
        is_new_farmer = True
    else:
        is_new_farmer = False

    # Get farmer's farms
    farms_result = await db.execute(
        select(Farm).where(Farm.user_id == user.id)
    )
    farms = farms_result.scalars().all()

    # Create JWT token
    token = create_access_token(
        user_id=str(user.id),
        phone=user.phone
    )

    return {
        "success": True,
        "message": "Login ho gaya! 🎉",
        "is_new_farmer": is_new_farmer,
        "token": token,
        "farmer": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "language": user.language
        },
        "farms": [
            {
                "id": farm.id,
                "name": farm.name,
                "crop_type": farm.crop_type
            }
            for farm in farms
        ]
    }


@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get farmer profile + farms.
    Protected route — needs JWT token.
    """
    user_result = await db.execute(
        select(User).where(
            User.id == uuid.UUID(current_user["user_id"])
        )
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404,
                           detail="Farmer nahi mila")

    farms_result = await db.execute(
        select(Farm).where(Farm.user_id == user.id)
    )
    farms = farms_result.scalars().all()

    return {
        "success": True,
        "farmer": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "language": user.language,
            "joined": user.created_at.isoformat()
        },
        "farms": [
            {
                "id": farm.id,
                "name": farm.name,
                "crop_type": farm.crop_type,
                "area_acres": farm.area_acres
            }
            for farm in farms
        ]
    }


@router.put("/profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update farmer name or language preference"""
    user_result = await db.execute(
        select(User).where(
            User.id == uuid.UUID(current_user["user_id"])
        )
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404,
                           detail="Farmer nahi mila")

    if request.name:
        user.name = request.name
    if request.language:
        user.language = request.language

    return {
        "success": True,
        "message": "Profile update ho gaya ✅",
        "farmer": {
            "name": user.name,
            "language": user.language
        }
    }