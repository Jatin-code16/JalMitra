# simulator/farm_simulator.py

import ssl
import sys
import os

# Add parent directory to path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

import requests
import random
import time
import json
from datetime import datetime
import paho.mqtt.client as mqtt  # ← This was missing!

# ─────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FARM_ID = "farm001"
INTERVAL_SECONDS = 7

MOISTURE_RANGE = (25, 75)
TEMP_RANGE = (24, 40)
HUMIDITY_RANGE = (35, 80)

# ─────────────────────────────────────────
# SENSOR SIMULATION
# ─────────────────────────────────────────

moisture = 55.0
temperature = 28.0
humidity = 60.0

def generate_reading():
    global moisture, temperature, humidity

    moisture = max(MOISTURE_RANGE[0],
                   min(MOISTURE_RANGE[1],
                       moisture + random.uniform(-2, 2)))

    temperature = max(TEMP_RANGE[0],
                      min(TEMP_RANGE[1],
                          temperature + random.uniform(-0.5, 1.5)))

    humidity = max(HUMIDITY_RANGE[0],
                   min(HUMIDITY_RANGE[1],
                       humidity + random.uniform(-1, 1)))

    return {
        "farm_id": FARM_ID,
        "soil_moisture": round(moisture, 2),
        "temperature": round(temperature, 2),
        "humidity": round(humidity, 2)
    }


def send_reading(data):
    try:
        response = requests.post(
            f"{BACKEND_URL}/sensors/data",
            json=data,
            headers={"X-Device-Key": settings.device_api_key}
                    if settings.device_api_key else {},
            timeout=5
        )
        if response.status_code == 200:
            print(f"✅ {datetime.now().strftime('%H:%M:%S')} | "
                  f"Moisture: {data['soil_moisture']}% | "
                  f"Temp: {data['temperature']}°C | "
                  f"Humidity: {data['humidity']}%")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend nahi mila. Kya server chalu hai?")


# ─────────────────────────────────────────
# MQTT SIMULATION — Fake ESP32
# ─────────────────────────────────────────

pump_status = "OFF"

# Create MQTT client for simulator
import uuid
try:
    sim_client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id=f"jalmitra-simulator-{uuid.uuid4().hex[:8]}",
        protocol=mqtt.MQTTv5
    )
except AttributeError:
    sim_client = mqtt.Client(
        client_id=f"jalmitra-simulator-{uuid.uuid4().hex[:8]}",
        protocol=mqtt.MQTTv5
    )

def on_command_received(client, userdata, message):
    """Simulate ESP32 receiving pump command"""
    global pump_status

    payload = json.loads(message.payload.decode())
    action = payload.get("action")
    pump_status = action

    print(f"\n🔌 PUMP COMMAND RECEIVED: {action}")
    print(f"   Duration: {payload.get('duration_minutes')} min")
    print(f"   Triggered by: {payload.get('triggered_by')}")

    # Send confirmation back like a real ESP32 would
    confirmation = {
        "farm_id": FARM_ID,
        "action": action,
        "success": True,
        "timestamp": time.time()
    }

    sim_client.publish(
        f"jalmitra/{FARM_ID}/pump/confirmation",
        json.dumps(confirmation)
    )
    print(f"✅ Confirmation sent back to backend\n")


def start_mqtt_listener():
    """Connect to MQTT and listen for pump commands"""
    sim_client.on_message = on_command_received

    try:
        if settings.mqtt_username and settings.mqtt_password:
            sim_client.username_pw_set(
                username=settings.mqtt_username,
                password=settings.mqtt_password
            )

        if settings.mqtt_port == 8883:
            sim_client.tls_set(tls_version=ssl.PROTOCOL_TLS)
            
        sim_client.connect(settings.mqtt_broker, settings.mqtt_port)
        sim_client.subscribe(f"jalmitra/{FARM_ID}/pump/command")
        sim_client.loop_start()
        print(f"📡 Simulator listening for pump commands...")
    except Exception as e:
        print(f"⚠️  MQTT connect nahi hua: {e}")
        print(f"   (Sensor data phir bhi bhejta rahega)")


# ─────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────

if __name__ == "__main__":
    print(f"🌾 JalMitra Farm Simulator Chalu Ho Gaya")
    print(f"📍 Farm ID: {FARM_ID}")
    print(f"🔗 Backend: {BACKEND_URL}")
    print(f"⏱️  Interval: {INTERVAL_SECONDS} seconds")
    print("─" * 50)

    # Start MQTT listener for pump commands
    start_mqtt_listener()

    # Keep sending sensor data forever
    while True:
        data = generate_reading()
        send_reading(data)
        time.sleep(INTERVAL_SECONDS)