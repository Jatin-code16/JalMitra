# services/chatbot_service.py

import google.generativeai as genai
import logging
from datetime import datetime
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


# ─────────────────────────────────────────
# SYSTEM PROMPT — JalMitra Saathi's Identity
# ─────────────────────────────────────────

def build_system_prompt(farm_context: dict) -> str:

    farmer_name = farm_context.get("farmer_name", "Kisan Bhai")
    crop_type = farm_context.get("crop_type", "wheat")
    soil_moisture = farm_context.get("soil_moisture", "N/A")
    temperature = farm_context.get("temperature", "N/A")
    humidity = farm_context.get("humidity", "N/A")
    recommendation = farm_context.get("recommendation", "monitor")
    reason = farm_context.get("reason", "")
    pump_status = farm_context.get("pump_status", "OFF")
    area_acres = farm_context.get("area_acres", "N/A")

    # Map recommendation to Hindi
    rec_hindi = {
        "irrigate": "✅ ABHI SINCHAI KARO",
        "skip": "❌ SINCHAI MAT KARO",
        "monitor": "👀 THODI DER BAAD DEKHO"
    }.get(recommendation, recommendation)

    return f"""
Tu JalMitra Saathi hai — ek smart irrigation assistant.

IMPORTANT: Tu HAMESHA neeche diya gaya LIVE DATA use karega 
jawab dene ke liye. Kabhi generic advice mat dena.

═══════════════════════════════
ABHI KA LIVE FARM DATA:
═══════════════════════════════
Kisan: {farmer_name}
Fasal: {crop_type}
Mitti ki Naami: {soil_moisture}%
Taapman: {temperature}°C
Naami (Humidity): {humidity}%
Pump: {pump_status}
Khet: {area_acres} acres

AI RECOMMENDATION (ABHI KA):
{rec_hindi}
Karan: {reason}
═══════════════════════════════

RULES (TODNA BILKUL MANA HAI):
1. Sirf Hindi ya Hinglish mein baat kar
2. Jawab MAXIMUM 2 sentences — STRICT LIMIT
3. Hamesha upar diya LIVE DATA use kar
4. Seedha batao — haan ya nahi pehle, phir karan
5. Ek emoji se khatam karo — kuch aur nahi
6. Kisan ko "{farmer_name}" bulao
7. KABHI incomplete sentence mat chodo
8. Lists, bullets, bold text — BILKUL NAHI
9. Sirf ek paragraph, seedha jawab

FORMAT TEMPLATE (HAMESHA YAHI FORMAT USE KAR):
"[Farmer name], [seedha jawab 1 line]. [reason ya advice 1 line]. [emoji]"

SAHI JAWAB KA EXAMPLE:
"Ramu Kumar, abhi sinchai ki zarurat nahi hai 
kyunki mitti mein {soil_moisture}% naami hai. 
Shaam ko dobara check karo. 🌱"

GALAT JAWAB (KABHI MAT KARO):
- Bullet points
- Numbered lists  
- **Bold text**
- 3 se zyada lines
- Adha vakya
"""


# ─────────────────────────────────────────
# CHAT HISTORY FORMATTER
# ─────────────────────────────────────────

def format_chat_history(history: list) -> list:
    """
    Convert DB chat history to Gemini format.
    Gemini needs: [{"role": "user/model", "parts": ["text"]}]
    """
    formatted = []
    for msg in history:
        role = "model" if msg["role"] == "assistant" else "user"
        formatted.append({
            "role": role,
            "parts": [msg["message"]]
        })
    return formatted


# ─────────────────────────────────────────
# MAIN CHATBOT CLASS
# ─────────────────────────────────────────

class JalMitraSaathi:

    def __init__(self):
        # Don't set model here — we build it fresh
        # each time with dynamic system instruction
        self.model_name = settings.gemini_model
        self.generation_config = {
            "temperature": 0.5,
            "max_output_tokens": 500,
            "top_p": 0.8,
        }
        self.thinking_config = {
            "thinking_budget": 0
        }
        logger.info("🤖 JalMitra Saathi initialized")

    async def respond(
        self,
        user_message: str,
        farm_context: dict,
        chat_history: Optional[list] = None
    ) -> str:
        try:
            import asyncio

            # ── Build system instruction with live farm data ──
            system_instruction = build_system_prompt(farm_context)

            # ── Create model WITH system instruction ──
            # This is the correct way for Gemini 2.5
            model = genai.GenerativeModel(
                model_name=settings.gemini_model,
                generation_config=self.generation_config,
                system_instruction=system_instruction  # ← KEY FIX
            )

            # ── Format history ──
            history = format_chat_history(chat_history or [])

            def _call_gemini():
                chat = model.start_chat(history=history)
                response = chat.send_message(user_message)
                return response.text.strip()

            loop = asyncio.get_event_loop()
            reply = await loop.run_in_executor(None, _call_gemini)

            logger.info(f"💬 Saathi replied: {reply[:80]}...")
            return reply

        except Exception as e:
            logger.error(f"❌ Chatbot error: {e}")
            print(f"❌ FULL ERROR: {e}")
            return (
                "Maafi chahta hoon, abhi kuch technical "
                "dikkat aa rahi hai. Thodi der baad try "
                "karein. 🙏"
            )

# ─────────────────────────────────────────
# CONTEXT BUILDER — Fetch Farm Data
# ─────────────────────────────────────────

async def build_farm_context(
    farm_id: str,
    user_id: str,
    db
) -> dict:
    """
    Fetch all relevant farm data to give Gemini
    full context about the farmer's situation.
    """
    from db import crud
    from db.models import Farm, User
    from sqlalchemy import select
    from mqtt.handlers import get_pump_state
    from ml.recommendation import get_recommendation

    context = {}

    try:
        # Get farmer info
        user_result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        context["farmer_name"] = user.name if user else "Kisan Bhai"

        # Get farm info
        farm_result = await db.execute(
            select(Farm).where(Farm.id == farm_id)
        )
        farm = farm_result.scalar_one_or_none()
        if farm:
            context["crop_type"] = farm.crop_type or "wheat"
            context["area_acres"] = farm.area_acres or "N/A"

        # Get latest sensor reading
        latest = await crud.get_latest_reading(db, farm_id)
        if latest:
            context["soil_moisture"] = round(
                latest.soil_moisture, 1
            )
            context["temperature"] = round(latest.temperature, 1)
            context["humidity"] = round(latest.humidity, 1)
            context["last_updated"] = latest.timestamp.strftime(
                "%d %B %Y, %I:%M %p"
            )

        # Get pump status
        pump_state = get_pump_state(farm_id)
        if pump_state.get("status") == "UNKNOWN":
            # Fallback to last DB log
            last_pump = await crud.get_latest_pump_action(
                db, farm_id
            )
            if last_pump:
                context["pump_status"] = last_pump.action
            else:
                context["pump_status"] = "OFF"  # Safe default
        else:
            context["pump_status"] = pump_state.get("status", "OFF")

        # Get current recommendation
        if latest and farm:
            rec = get_recommendation(
                soil_moisture=latest.soil_moisture,
                temperature=latest.temperature,
                humidity=latest.humidity,
                crop_type=farm.crop_type or "wheat"
            )
            context["recommendation"] = rec["recommendation"]
            context["reason"] = rec["reason_en"]

    except Exception as e:
        logger.error(f"❌ Context build error: {e}")
        print(f"❌ FULL CHATBOT ERROR: {e}")
    return context


# Singleton instance
saathi = JalMitraSaathi()