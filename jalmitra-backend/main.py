# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.connection import engine, Base
from config import settings

# Import all routers
from api import sensors, pump, chatbot, auth, analytics

# ─────────────────────────────────────────
# STARTUP / SHUTDOWN
# ─────────────────────────────────────────

# main.py — update the lifespan function only

# main.py — lifespan function

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🌱 JalMitra Backend Starting...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables ready")

    # MQTT — non-fatal if fails
    try:
        from mqtt.client import mqtt_client
        mqtt_client.connect()
        print("✅ MQTT connecting...")
    except Exception as e:
        print(f"⚠️ MQTT skipped: {e}")
        print("   Pump control via MQTT disabled")
        print("   All other features work normally ✅")

    yield

    try:
        mqtt_client.disconnect()
    except:
        pass
    print("👋 JalMitra Backend Shutting Down...")
    
# ─────────────────────────────────────────
# CREATE APP
# ─────────────────────────────────────────

app = FastAPI(
    title="JalMitra API",
    description="Smart Irrigation System — Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Allow app to talk to backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# REGISTER ALL ROUTES
# ─────────────────────────────────────────

app.include_router(auth.router)
app.include_router(sensors.router)
app.include_router(pump.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)

# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "success": True,
        "message": "JalMitra API chal raha hai! 🌱",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "debug": settings.debug
    }