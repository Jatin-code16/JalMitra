# db/crud.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from db.models import SensorReading, PumpLog, Farm, User
from datetime import datetime, timezone

# ─────────────────────────────────────────
# SENSOR OPERATIONS
# ─────────────────────────────────────────

async def save_sensor_reading(db: AsyncSession, farm_id: str,
                               soil_moisture: float,
                               temperature: float,
                               humidity: float):
    """Save one sensor reading to database"""
    reading = SensorReading(
        farm_id=farm_id,
        soil_moisture=soil_moisture,
        temperature=temperature,
        humidity=humidity
    )
    db.add(reading)
    await db.flush()  # Save without committing yet
    return reading


async def get_latest_reading(db: AsyncSession, farm_id: str):
    """Get the most recent sensor reading for a farm"""
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.farm_id == farm_id)
        .order_by(desc(SensorReading.timestamp))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_readings_history(db: AsyncSession,
                                farm_id: str,
                                from_date: datetime,
                                to_date: datetime):
    """Get sensor readings within a date range"""
    if from_date.tzinfo is not None:
        from_date = from_date.astimezone(timezone.utc).replace(tzinfo=None)
    if to_date.tzinfo is not None:
        to_date = to_date.astimezone(timezone.utc).replace(tzinfo=None)
    result = await db.execute(
        select(SensorReading)
        .where(
            SensorReading.farm_id == farm_id,
            SensorReading.timestamp >= from_date,
            SensorReading.timestamp <= to_date
        )
        .order_by(desc(SensorReading.timestamp))
    )
    return result.scalars().all()

# ─────────────────────────────────────────
# PUMP OPERATIONS
# ─────────────────────────────────────────

async def save_pump_log(db: AsyncSession, farm_id: str,
                         action: str, triggered_by: str,
                         duration_minutes: int = None):
    """Log a pump action"""
    # Estimate water used (rough: 50 liters/minute for typical pump)
    water = (duration_minutes * 50) if duration_minutes else None

    log = PumpLog(
        farm_id=farm_id,
        action=action,
        triggered_by=triggered_by,
        duration_minutes=duration_minutes,
        water_used_liters=water
    )
    db.add(log)
    await db.flush()
    return log


async def get_pump_history(db: AsyncSession,
                            farm_id: str, limit: int = 10):
    """Get last N pump actions for a farm"""
    result = await db.execute(
        select(PumpLog)
        .where(PumpLog.farm_id == farm_id)
        .order_by(desc(PumpLog.timestamp))
        .limit(limit)
    )
    return result.scalars().all()


async def get_latest_pump_action(db: AsyncSession,
                                  farm_id: str):
    """Get the most recent pump action"""
    result = await db.execute(
        select(PumpLog)
        .where(PumpLog.farm_id == farm_id)
        .order_by(desc(PumpLog.timestamp))
        .limit(1)
    )
    return result.scalar_one_or_none()