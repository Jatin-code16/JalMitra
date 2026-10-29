# api/pump.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, validator
from datetime import datetime, timedelta
from typing import Optional
from db.connection import get_db
from db import crud
from mqtt.client import mqtt_client, Topics
from mqtt.handlers import get_pump_state, set_pump_state
from api.deps import ensure_farm_access, get_owned_farm_id
from services.jwt_service import get_current_user

router = APIRouter(prefix="/pump", tags=["Pump Control"])


# ─────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────

class PumpControlRequest(BaseModel):
    farm_id: str
    action: str                    # "ON" or "OFF"
    duration_minutes: Optional[int] = 30
    triggered_by: Optional[str] = "farmer"

    @validator("action")
    def validate_action(cls, v):
        if v not in ["ON", "OFF"]:
            raise ValueError("Action sirf ON ya OFF ho sakta hai")
        return v

    @validator("duration_minutes")
    def validate_duration(cls, v):
        if v and (v < 1 or v > 180):
            raise ValueError(
                "Duration 1 se 180 minutes ke beech hona chahiye"
            )
        return v


# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────

@router.get("/status")
async def get_pump_status(
    farm_id: str = Depends(get_owned_farm_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current pump status for a farm.
    App calls this to show pump ON/OFF state.
    """
    # Get latest from DB
    latest_log = await crud.get_latest_pump_action(db, farm_id)

    # Get real-time state from MQTT memory
    mqtt_state = get_pump_state(farm_id)

    # Determine current status
    # Prefer MQTT state (real-time) over DB (historical)
    if mqtt_state["status"] != "UNKNOWN":
        current_status = mqtt_state["status"]
    elif latest_log:
        current_status = latest_log.action
    else:
        current_status = "OFF"  # Default safe state

    # Calculate today's total runtime
    history = await crud.get_pump_history(db, farm_id, limit=50)
    today = datetime.utcnow().date()
    today_runtime = sum(
        log.duration_minutes or 0
        for log in history
        if log.timestamp.date() == today
        and log.action == "ON"
    )

    return {
        "success": True,
        "farm_id": farm_id,
        "pump": {
            "status": current_status,
            "last_action": latest_log.action if latest_log else None,
            "last_action_at": latest_log.timestamp.isoformat()
                              if latest_log else None,
            "last_triggered_by": latest_log.triggered_by
                                  if latest_log else None,
            "total_runtime_today_minutes": today_runtime
        }
    }


@router.post("/control")
async def control_pump(
    request: PumpControlRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send pump ON/OFF command.
    This is the main endpoint — farmer taps Chalu/Band Karo.
    """

    # ── Only the farm's owner can control its pump ──
    await ensure_farm_access(db, request.farm_id, current_user["user_id"])

    # ── Safety Check 1: Don't turn ON if already ON ──
    current_state = get_pump_state(request.farm_id)
    if (request.action == "ON" and
            current_state["status"] == "ON"):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "PUMP_ALREADY_ON",
                "message": "Pump pehle se chalu hai"
            }
        )

    # ── Safety Check 2: Don't turn OFF if already OFF ──
    if (request.action == "OFF" and
            current_state["status"] == "OFF"):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "PUMP_ALREADY_OFF",
                "message": "Pump pehle se band hai"
            }
        )

    # ── Build MQTT Command ──
    command = {
        "action": request.action,
        "duration_minutes": request.duration_minutes,
        "triggered_by": request.triggered_by,
        "timestamp": datetime.utcnow().isoformat(),
        "farm_id": request.farm_id
    }

    # ── Publish to Farm via MQTT ──
    topic = Topics.pump_command(request.farm_id)
    mqtt_sent = mqtt_client.publish(topic, command)

    # ── Update In-Memory State Immediately ──
    set_pump_state(request.farm_id, request.action, "backend")

    # ── Save to Database ──
    await crud.save_pump_log(
        db=db,
        farm_id=request.farm_id,
        action=request.action,
        triggered_by=request.triggered_by,
        duration_minutes=request.duration_minutes
            if request.action == "ON" else None
    )

    # ── Build Response ──
    if request.action == "ON":
        auto_off_time = (
            datetime.utcnow() +
            timedelta(minutes=request.duration_minutes)
        ).isoformat()

        return {
            "success": True,
            "message": "Pump chalu ho raha hai 💧",
            "mqtt_sent": mqtt_sent,
            "pump": {
                "status": "ON",
                "duration_minutes": request.duration_minutes,
                "will_auto_off_at": auto_off_time,
                "triggered_by": request.triggered_by
            }
        }
    else:
        return {
            "success": True,
            "message": "Pump band ho gaya ✅",
            "mqtt_sent": mqtt_sent,
            "pump": {
                "status": "OFF",
                "triggered_by": request.triggered_by
            }
        }


@router.get("/history")
async def get_pump_history(
    farm_id: str = Depends(get_owned_farm_id),
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    Get pump usage history.
    App calls this for the analytics screen.
    """
    logs = await crud.get_pump_history(db, farm_id, limit)

    return {
        "success": True,
        "farm_id": farm_id,
        "history": [
            {
                "action": log.action,
                "triggered_by": log.triggered_by,
                "duration_minutes": log.duration_minutes,
                "water_used_liters": log.water_used_liters,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ],
        "total_records": len(logs)
    }