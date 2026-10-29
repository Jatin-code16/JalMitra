# api/deps.py

import hmac
import uuid
from typing import Optional
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings
from db.connection import get_db
from db.models import Farm
from services.jwt_service import get_current_user


# ─────────────────────────────────────────
# FARM OWNERSHIP
# ─────────────────────────────────────────

async def ensure_farm_access(
    db: AsyncSession,
    farm_id: str,
    user_id: str
) -> None:
    """
    Raise 404 unless the farm exists and belongs to this farmer.
    Same error for "missing" and "not yours" so farm IDs can't be probed.
    """
    result = await db.execute(
        select(Farm.id).where(
            Farm.id == farm_id,
            Farm.user_id == uuid.UUID(user_id)
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "FARM_NOT_FOUND",
                "message": "Yeh khet aapke account mein nahi mila"
            }
        )


async def get_owned_farm_id(
    farm_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> str:
    """
    Dependency for routes that take ?farm_id= in the query.
    Requires login and checks the farm belongs to the farmer.
    """
    await ensure_farm_access(db, farm_id, current_user["user_id"])
    return farm_id


# ─────────────────────────────────────────
# DEVICE AUTH — ESP32 / simulator
# ─────────────────────────────────────────

async def verify_device_key(
    x_device_key: Optional[str] = Header(None)
) -> None:
    """
    Check X-Device-Key against DEVICE_API_KEY.
    Skipped when DEVICE_API_KEY is not set (local development).
    """
    if not settings.device_api_key:
        return

    if not x_device_key or not hmac.compare_digest(
        x_device_key, settings.device_api_key
    ):
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": "INVALID_DEVICE_KEY",
                "message": "Device authorised nahi hai"
            }
        )
