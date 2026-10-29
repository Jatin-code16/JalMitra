# mqtt/client.py

import os
import paho.mqtt.client as mqtt
import json
import logging
import uuid
from config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# MQTT TOPIC DEFINITIONS
# ─────────────────────────────────────────

class Topics:
    """All MQTT topics in one place"""
    
    @staticmethod
    def sensor_data(farm_id: str):
        return f"jalmitra/{farm_id}/sensors/data"
    
    @staticmethod
    def pump_command(farm_id: str):
        return f"jalmitra/{farm_id}/pump/command"
    
    @staticmethod
    def pump_status(farm_id: str):
        return f"jalmitra/{farm_id}/pump/status"
    
    @staticmethod
    def pump_confirmation(farm_id: str):
        return f"jalmitra/{farm_id}/pump/confirmation"


# ─────────────────────────────────────────
# MQTT CLIENT SETUP
# ─────────────────────────────────────────

class MQTTClient:
    def __init__(self):
        # Automatically handle the callback API version based on Paho version
        try:
            self.client = mqtt.Client(
                mqtt.CallbackAPIVersion.VERSION2,
                client_id=f"jalmitra-backend-{uuid.uuid4().hex[:8]}",
                protocol=mqtt.MQTTv5
            )
        except AttributeError:
            self.client = mqtt.Client(
                client_id=f"jalmitra-backend-{uuid.uuid4().hex[:8]}",
                protocol=mqtt.MQTTv5
            )
        self.connected = False
        self._setup_callbacks()

    def _setup_callbacks(self):
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message

    def _on_connect(self, client, userdata, flags,
                    reason_code, properties):
        if reason_code == 0:
            self.connected = True
            logger.info("✅ MQTT Broker se connected!")
            
            # Subscribe to all farm confirmations
            client.subscribe("jalmitra/+/pump/confirmation")
            client.subscribe("jalmitra/+/pump/status")
            logger.info("📡 Pump topics subscribe kar liye")
        else:
            logger.error(f"❌ MQTT connection fail: {reason_code}")

    def _on_disconnect(self, client, userdata, disconnect_flags, reason_code, properties):
        self.connected = False
        logger.warning(f"⚠️ MQTT se disconnect ho gaya (Reason code: {reason_code})")

    def _on_message(self, client, userdata, message):
        """Handle incoming MQTT messages"""
        from mqtt.handlers import handle_mqtt_message
        try:
            payload = json.loads(message.payload.decode())
            handle_mqtt_message(message.topic, payload)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON on topic: {message.topic}")

    def connect(self):
        try:
            # Only set credentials if provided
            if settings.mqtt_username and settings.mqtt_password:
                self.client.username_pw_set(
                    username=settings.mqtt_username,
                    password=settings.mqtt_password
                )

            # Only use TLS for cloud brokers
            if settings.mqtt_port == 8883:
                import ssl
                self.client.tls_set(tls_version=ssl.PROTOCOL_TLS)

            self.client.connect(
                settings.mqtt_broker,
                settings.mqtt_port,
                keepalive=60
            )
            self.client.loop_start()
            logger.info(
                f"🔌 MQTT connecting to "
                f"{settings.mqtt_broker}:{settings.mqtt_port}"
            )
        except Exception as e:
            logger.error(f"❌ MQTT connect error: {e}")
            # Don't crash server if MQTT fails
            logger.warning("⚠️ Running without MQTT — pump commands disabled")

    def publish(self, topic: str, payload: dict, qos: int = 1):
        """Publish a message to a topic"""
        if not self.connected:
            logger.warning("⚠️ MQTT connected nahi hai")
            return False
        
        message = json.dumps(payload)
        result = self.client.publish(topic, message, qos=qos)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"📤 Published to {topic}: {payload}")
            return True
        else:
            logger.error(f"❌ Publish failed: {result.rc}")
            return False

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()


# Single instance — used across the entire app
mqtt_client = MQTTClient()