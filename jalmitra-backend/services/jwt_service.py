# services/jwt_service.py

from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

ALGORITHM = "HS256"


# ─────────────────────────────────────────
# TOKEN CREATION
# ─────────────────────────────────────────

def create_access_token(user_id: str, phone: str) -> str:
    """
    Create a JWT token for a logged-in farmer.
    Token contains user_id and phone — no sensitive data.
    """
    expire = datetime.utcnow() + timedelta(
        minutes=settings.jwt_expire_minutes
    )

    payload = {
        "sub": user_id,        # Subject (user ID)
        "phone": phone,        # Farmer's phone
        "exp": expire,         # Expiry time
        "iat": datetime.utcnow()  # Issued at
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=ALGORITHM
    )

    logger.info(f"🔑 Token created for user {user_id}")
    return token


# ─────────────────────────────────────────
# TOKEN VERIFICATION
# ─────────────────────────────────────────

def verify_token(token: str) -> Optional[dict]:
    """
    Verify a JWT token.
    Returns payload dict if valid, None if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"⚠️ Invalid token: {e}")
        return None


# ─────────────────────────────────────────
# FASTAPI DEPENDENCY — Protect Routes
# ─────────────────────────────────────────

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    FastAPI dependency — use this to protect any route.
    Add as parameter to any endpoint that needs auth.

    Usage:
        @router.get("/protected")
        async def protected_route(
            current_user: dict = Depends(get_current_user)
        ):
            return {"user": current_user}
    """
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": "INVALID_TOKEN",
                "message": "Login karein pehle"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {
        "user_id": payload["sub"],
        "phone": payload["phone"]
    }