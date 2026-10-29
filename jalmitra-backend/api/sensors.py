# api/sensors.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime
from db.connection import get_db
from db import crud
from api.deps import get_owned_farm_id, verify_device_key

router = APIRouter(prefix="/sensors", tags=["Sensors"])

# ─────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────

class SensorDataInput(BaseModel):
    farm_id: str
    soil_moisture: float
    temperature: float
    humidity: float

# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────

@router.post("/data", dependencies=[Depends(verify_device_key)])
async def receive_sensor_data(
    data: SensorDataInput,
    db: AsyncSession = Depends(get_db)
):
    """
    Receive sensor data from farm (or simulator).
    ESP32 / simulator calls this every 5 seconds.
    """
    reading = await crud.save_sensor_reading(
        db=db,
        farm_id=data.farm_id,
        soil_moisture=data.soil_moisture,
        temperature=data.temperature,
        humidity=data.humidity
    )
    return {
        "success": True,
        "message": "Data saved",
        "reading_id": str(reading.id)
    }


@router.get("/latest")
async def get_latest_sensor_data(
    farm_id: str = Depends(get_owned_farm_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the most recent sensor reading for a farm.
    App calls this to show live dashboard data.
    """
    reading = await crud.get_latest_reading(db, farm_id)

    if not reading:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "NO_DATA",
                "message": "Is farm ka koi data nahi mila"
            }
        )

    # Calculate how long ago this reading was taken
    reading_ts = reading.timestamp
    if reading_ts.tzinfo is None or reading_ts.tzinfo.utcoffset(reading_ts) is None:
        now = datetime.utcnow()
    else:
        now = datetime.now(reading_ts.tzinfo)
    seconds_ago = int((now - reading_ts).total_seconds())

    return {
        "success": True,
        "farm_id": farm_id,
        "data": {
            "soil_moisture": reading.soil_moisture,
            "temperature": reading.temperature,
            "humidity": reading.humidity,
            "timestamp": reading.timestamp.isoformat()
        },
        "status": {
            "sensor_online": seconds_ago < 30,
            "last_seen_seconds_ago": seconds_ago
        }
    }


@router.get("/history")
async def get_sensor_history(
    farm_id: str = Depends(get_owned_farm_id),
    from_date: str = None,
    to_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get historical sensor readings for a farm.
    App calls this for the analytics screen.
    """
    # Default: last 7 days
    from_dt = datetime.fromisoformat(from_date) \
               if from_date else datetime(2020, 1, 1)
    to_dt = datetime.fromisoformat(to_date) \
             if to_date else datetime.utcnow()

    readings = await crud.get_readings_history(
        db, farm_id, from_dt, to_dt
    )

    return {
        "success": True,
        "farm_id": farm_id,
        "data": [
            {
                "soil_moisture": r.soil_moisture,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "timestamp": r.timestamp.isoformat()
            }
            for r in readings
        ],
        "total_records": len(readings)
    }