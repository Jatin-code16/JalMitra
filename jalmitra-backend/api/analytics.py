# api/analytics.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone
from db.connection import get_db
from db import crud
from db.models import Recommendation as RecommendationModel
from ml.recommendation import get_recommendation
from api.deps import get_owned_farm_id

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _naive_utc(dt: datetime) -> datetime:
    utc_dt = _ensure_utc(dt)
    return utc_dt.replace(tzinfo=None)


@router.get("/recommendation")
async def get_irrigation_recommendation(
    farm_id: str = Depends(get_owned_farm_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI irrigation recommendation for a farm.
    Uses latest sensor data + crop profile.
    App shows this on home dashboard.
    """

    # ── Get latest sensor reading ──
    latest = await crud.get_latest_reading(db, farm_id)
    if not latest:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "NO_SENSOR_DATA",
                "message": "Khet ka koi data nahi mila"
            }
        )

    # ── Get farm crop type ──
    from sqlalchemy import select
    from db.models import Farm
    farm_result = await db.execute(
        select(Farm).where(Farm.id == farm_id)
    )
    farm = farm_result.scalar_one_or_none()
    crop_type = farm.crop_type if farm else "wheat"

    # ── Check if pump was used today ──
    history = await crud.get_pump_history(db, farm_id, limit=10)
    now_utc = datetime.now(timezone.utc)
    today = now_utc.date()
    pump_on_today = any(
        log.action == "ON" and _ensure_utc(log.timestamp).date() == today
        for log in history
    )

    # ── Get last irrigation time ──
    last_irrigation = next(
        (log for log in history if log.action == "ON"), None
    )
    hours_since = None
    if last_irrigation:
        last_irrigation_ts = _ensure_utc(last_irrigation.timestamp)
        delta = now_utc - last_irrigation_ts
        hours_since = delta.total_seconds() / 3600

    # ── Run Recommendation Engine ──
    result = get_recommendation(
        soil_moisture=latest.soil_moisture,
        temperature=latest.temperature,
        humidity=latest.humidity,
        crop_type=crop_type,
        pump_on_today=pump_on_today,
        hours_since_last_irrigation=hours_since
    )

    # ── Save recommendation to DB ──
    rec = RecommendationModel(
        farm_id=farm_id,
        recommendation=result["recommendation"],
        reason=result["reason_en"],
        confidence=result["confidence"]
    )
    db.add(rec)

    return {
        "success": True,
        "farm_id": farm_id,
        "crop_type": crop_type,
        "sensor_snapshot": {
            "soil_moisture": latest.soil_moisture,
            "temperature": latest.temperature,
            "humidity": latest.humidity,
            "recorded_at": latest.timestamp.isoformat()
        },
        "recommendation": result["recommendation"],
        "confidence": result["confidence"],
        "reason": result["reason_hi"],
        "alert": result["alert"],
        "next_check_in_hours": result["next_check_hours"],
        "generated_at": now_utc.isoformat()
    }


@router.get("/weekly")
async def get_weekly_summary(
    farm_id: str = Depends(get_owned_farm_id),
    db: AsyncSession = Depends(get_db)
):
    try:
        now = datetime.now(timezone.utc)
        week_start = now - timedelta(days=7)
        last_week_start = now - timedelta(days=14)
        now_db = _naive_utc(now)
        week_start_db = _naive_utc(week_start)

        readings = await crud.get_readings_history(
            db, farm_id, week_start_db, now_db
        )
        pump_logs = await crud.get_pump_history(
            db, farm_id, limit=50
        )

        this_week_logs = [
            log for log in pump_logs
            if _ensure_utc(log.timestamp) >= week_start
            and log.action == "ON"
        ]
        last_week_logs = [
            log for log in pump_logs
            if last_week_start <= _ensure_utc(log.timestamp) < week_start
            and log.action == "ON"
        ]

        total_water = sum(
            log.water_used_liters or 0
            for log in this_week_logs
        )
        last_week_water = sum(
            log.water_used_liters or 0
            for log in last_week_logs
        )

        moist_values = [r.soil_moisture for r in readings if r.soil_moisture is not None]
        temp_values = [r.temperature for r in readings if r.temperature is not None]
        avg_moisture = (sum(moist_values) / len(moist_values)) if moist_values else 0
        avg_temp = (sum(temp_values) / len(temp_values)) if temp_values else 0

        water_change_pct = 0
        if last_week_water > 0:
            water_change_pct = round(
                ((total_water - last_week_water)
                 / last_week_water) * 100
            )

        irrigated_days = len(set(
            _ensure_utc(log.timestamp).date()
            for log in this_week_logs
        ))
        skipped_days = 7 - irrigated_days

        if water_change_pct < -10:
            insight = (
                f"Is hafte aapne pichle hafte se "
                f"{abs(water_change_pct)}% kam paani use kiya. "
                f"Bahut accha! 💧"
            )
        elif water_change_pct > 10:
            insight = (
                f"Is hafte pichle hafte se "
                f"{water_change_pct}% zyada paani laga. "
                f"JalMitra ki salah follow karein. 🌱"
            )
        else:
            insight = (
                f"Is hafte paani ka upyog samanya raha. "
                f"Accha kaam! ✅"
            )

        return {
            "success": True,
            "farm_id": farm_id,
            "week": {
                "from": week_start.date().isoformat(),
                "to": now.date().isoformat()
            },
            "summary": {
                "total_water_used_liters": round(total_water),
                "vs_last_week_percent": water_change_pct,
                "pump_on_count": len(this_week_logs),
                "avg_soil_moisture": round(avg_moisture, 1),
                "avg_temperature": round(avg_temp, 1),
                "days_irrigated": irrigated_days,
                "days_skipped": skipped_days
            },
            "insight": insight,
            "generated_at": now.isoformat()
        }

    except Exception as e:
        print(f"❌ WEEKLY ANALYTICS ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )