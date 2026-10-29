# services/otp_service.py

import random
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# IN-MEMORY OTP STORE
# Format: { "9876543210": { "otp": "847291", "expires_at": 1234567890 } }
# In production: use Redis instead
# ─────────────────────────────────────────

otp_store: dict = {}

OTP_EXPIRE_SECONDS = 300  # 5 minutes
OTP_LENGTH = 6


# ─────────────────────────────────────────
# OTP GENERATION
# ─────────────────────────────────────────

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))


def store_otp(phone: str, otp: str) -> None:
    """Store OTP with expiry time"""
    otp_store[phone] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRE_SECONDS,
        "attempts": 0  # Track wrong attempts
    }
    logger.info(f"📱 OTP stored for {phone}")


def verify_otp(phone: str, otp: str) -> dict:
    """
    Verify OTP for a phone number.
    Returns dict with success status and reason.
    """
    # Check if OTP exists
    if phone not in otp_store:
        return {
            "success": False,
            "error": "OTP_NOT_FOUND",
            "message": "Pehle OTP mangwayen"
        }

    stored = otp_store[phone]

    # Check expiry
    if time.time() > stored["expires_at"]:
        del otp_store[phone]  # Clean up
        return {
            "success": False,
            "error": "OTP_EXPIRED",
            "message": "OTP expire ho gaya. Dobara mangwayen."
        }

    # Check max attempts (prevent brute force)
    if stored["attempts"] >= 3:
        del otp_store[phone]
        return {
            "success": False,
            "error": "TOO_MANY_ATTEMPTS",
            "message": "Bahut galat koshishein. Dobara OTP mangwayen."
        }

    # Check OTP value
    if stored["otp"] != otp:
        otp_store[phone]["attempts"] += 1
        remaining = 3 - stored["attempts"]
        return {
            "success": False,
            "error": "INVALID_OTP",
            "message": f"OTP galat hai. {remaining} koshish bachi hai."
        }

    # Success — clean up used OTP
    del otp_store[phone]
    return {
        "success": True,
        "message": "OTP sahi hai"
    }


# ─────────────────────────────────────────
# SMS SENDING
# ─────────────────────────────────────────

async def send_otp_sms(phone: str, otp: str) -> bool:
    """
    Send OTP via SMS.
    Development: prints to terminal.
    Production: use Fast2SMS or Twilio.
    """
    from config import settings

    # ── Development Mode — Print to Terminal ──
    if settings.debug:
        print(f"\n{'='*40}")
        print(f"📱 OTP for {phone}: {otp}")
        print(f"⏱️  Expires in {OTP_EXPIRE_SECONDS} seconds")
        print(f"{'='*40}\n")
        return True

    # ── Production Mode — Fast2SMS ──
    # Uncomment when you have Fast2SMS API key
    # try:
    #     import httpx
    #     async with httpx.AsyncClient() as client:
    #         response = await client.post(
    #             "https://www.fast2sms.com/dev/bulkV2",
    #             headers={"authorization": settings.fast2sms_key},
    #             json={
    #                 "variables_values": otp,
    #                 "route": "otp",
    #                 "numbers": phone
    #             }
    #         )
    #         return response.json().get("return", False)
    # except Exception as e:
    #     logger.error(f"SMS send failed: {e}")
    #     return False

    return True