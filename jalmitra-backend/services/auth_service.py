# services/auth_service.py

from datetime import datetime, timedelta
from typing import Optional
import uuid
from jose import JWTError, jwt
from config import settings
import logging

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────
# JWT TOKEN OPERATIONS
# ─────────────────────────────────────────

def create_access_token(user_id: str, phone: str) -> str:
    """
    Create a JWT access token for a logged-in farmer.
    Token contains user_id and phone — no sensitive data.
    """
    payload = {
        "user_id": user_id,
        "phone": phone,
        "exp": datetime.utcnow() + timedelta(
            minutes=settings.jwt_expire_minutes
        ),
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4())  # Unique token ID
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm="HS256"
    )

    logger.info(f"🔑 Token created for user {user_id}")
    return token


def verify_token(token: str) -> Optional[dict]:
    """
    Verify and decode a JWT token.
    Returns payload dict if valid, None if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"]
        )
        return payload
    except JWTError as e:
        logger.warning(f"⚠️ Invalid token: {e}")
        return None


# ─────────────────────────────────────────
# FASTAPI DEPENDENCY — Protect Routes
# ─────────────────────────────────────────

from fastapi import Depends, HTTPException, Header

async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    FastAPI dependency — protects any route.
    Add to any endpoint to require login.

    Usage:
        @router.get("/protected")
        async def protected(user = Depends(get_current_user)):
            return {"user": user}
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": "NOT_LOGGED_IN",
                "message": "Pehle login karein"
            }
        )

    # Check format: "Bearer <token>"
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": "INVALID_TOKEN_FORMAT",
                "message": "Token format galat hai"
            }
        )

    token = parts[1]
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": "INVALID_TOKEN",
                "message": "Token galat ya expire ho gaya"
            }
        )

    return payload