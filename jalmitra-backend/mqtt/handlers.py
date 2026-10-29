# mqtt/handlers.py

import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory pump state tracker
# Format: { "farm001": { "status": "OFF", "updated_at": ... } }
pump_states = {}

def handle_mqtt_message(topic: str, payload: dict):
    """
    Route incoming MQTT messages to correct handler.
    Called automatically when any subscribed message arrives.
    """
    logger.info(f"📨 MQTT message on {topic}: {payload}")

    # Parse farm_id from topic
    # Topic format: jalmitra/{farm_id}/pump/confirmation
    parts = topic.split("/")
    if len(parts) < 3:
        return

    farm_id = parts[1]
    message_type = parts[-1]

    if message_type == "confirmation":
        handle_pump_confirmation(farm_id, payload)
    elif message_type == "status":
        handle_pump_status(farm_id, payload)


def handle_pump_confirmation(farm_id: str, payload: dict):
    """
    ESP32 confirmed pump action.
    Update in-memory state.
    """
    action = payload.get("action")
    success = payload.get("success", False)

    if success:
        pump_states[farm_id] = {
            "status": action,
            "updated_at": datetime.utcnow().isoformat(),
            "confirmed_by": "hardware"
        }
        logger.info(f"✅ Farm {farm_id}: Pump {action} confirmed")
    else:
        logger.error(f"❌ Farm {farm_id}: Pump action failed")


def handle_pump_status(farm_id: str, payload: dict):
    """
    ESP32 sending periodic pump status update.
    """
    status = payload.get("status", "UNKNOWN")
    pump_states[farm_id] = {
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
        "confirmed_by": "hardware"
    }
    logger.info(f"📊 Farm {farm_id}: Pump status = {status}")


def get_pump_state(farm_id: str) -> dict:
    """Get current in-memory pump state for a farm"""
    return pump_states.get(farm_id, {
        "status": "UNKNOWN",
        "updated_at": None,
        "confirmed_by": None
    })


def set_pump_state(farm_id: str, status: str,
                   source: str = "backend"):
    """Manually set pump state (used when sending commands)"""
    pump_states[farm_id] = {
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
        "confirmed_by": source
    }