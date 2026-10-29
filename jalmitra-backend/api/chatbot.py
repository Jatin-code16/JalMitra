# api/chatbot.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid
from db.connection import get_db
from db.models import ChatHistory
from services.chatbot_service import saathi, build_farm_context
from services.jwt_service import get_current_user
from api.deps import ensure_farm_access

router = APIRouter(prefix="/chat", tags=["Chatbot"])


# ─────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    user_id: Optional[str] = None  # Ignored — user comes from the JWT
    farm_id: str
    message: str
    language: Optional[str] = "hi"
    session_id: Optional[str] = None  # Group messages by session


# ─────────────────────────────────────────
# HELPER — Get recent chat history
# ─────────────────────────────────────────

async def get_recent_history(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 6  # Last 3 exchanges (user + assistant)
) -> list:
    """Fetch recent chat history for context"""
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.timestamp.desc())
        .limit(limit)
    )
    messages = result.scalars().all()

    # Reverse to chronological order
    return [
        {
            "role": msg.role,
            "message": msg.message
        }
        for msg in reversed(messages)
    ]


# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────

@router.post("/message")
async def send_message(
    request: ChatMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a text message to JalMitra Saathi.
    Returns Hindi response with full farm context.
    """
    user_id = uuid.UUID(current_user["user_id"])

    # ── Validate input ──
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "EMPTY_MESSAGE",
                "message": "Message khali nahi ho sakta"
            }
        )

    if len(request.message) > 500:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "MESSAGE_TOO_LONG",
                "message": "Message bahut lamba hai (max 500 chars)"
            }
        )

    await ensure_farm_access(db, request.farm_id, current_user["user_id"])

    # ── Build farm context ──
    farm_context = await build_farm_context(
        farm_id=request.farm_id,
        user_id=user_id,
        db=db
    )

    # ── Get recent chat history ──
    history = await get_recent_history(db, user_id)

    # ── Get Saathi's response ──
    reply = await saathi.respond(
        user_message=request.message,
        farm_context=farm_context,
        chat_history=history
    )

    # ── Save both messages to DB ──
    user_msg = ChatHistory(
        user_id=user_id,
        role="user",
        message=request.message,
        input_type="text",
        language=request.language
    )

    assistant_msg = ChatHistory(
        user_id=user_id,
        role="assistant",
        message=reply,
        input_type="text",
        language=request.language
    )

    db.add(user_msg)
    db.add(assistant_msg)
    await db.flush()

    return {
        "success": True,
        "reply": reply,
        "context_used": {
            "soil_moisture": farm_context.get("soil_moisture"),
            "crop_type": farm_context.get("crop_type"),
            "recommendation": farm_context.get("recommendation"),
            "pump_status": farm_context.get("pump_status")
        },
        "message_id": str(assistant_msg.id)
    }


@router.get("/history")
async def get_chat_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get chat history for a user.
    App loads this when opening Saathi screen.
    """
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == uuid.UUID(current_user["user_id"]))
        .order_by(ChatHistory.timestamp.desc())
        .limit(limit)
    )
    messages = result.scalars().all()

    return {
        "success": True,
        "history": [
            {
                "role": msg.role,
                "message": msg.message,
                "input_type": msg.input_type,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in reversed(messages)
        ],
        "total": len(messages)
    }


@router.delete("/history")
async def clear_chat_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all chat history for the logged-in farmer"""
    from sqlalchemy import delete
    await db.execute(
        delete(ChatHistory)
        .where(ChatHistory.user_id == uuid.UUID(current_user["user_id"]))
    )
    return {
        "success": True,
        "message": "Chat history saaf ho gayi ✅"
    }


@router.get("/suggestions", dependencies=[Depends(get_current_user)])
async def get_quick_suggestions(farm_id: str):
    """
    Quick question suggestions shown in app UI.
    Farmer taps these instead of typing.
    """
    return {
        "success": True,
        "suggestions": [
            "Aaj sinchai karni chahiye kya?",
            "Pump kitni der chalana hai?",
            "Mere khet mein kya ho raha hai?",
            "Gehun ke liye kitna pani chahiye?",
            "Aaj mausam kaisa rahega fasal ke liye?",
            "Mitti ki naami sahi hai kya?"
        ]
    }
