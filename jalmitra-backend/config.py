from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    app_name: str = "JalMitra"
    debug: bool = True

    # Database
    database_url: str

    # MQTT
    mqtt_broker: str = "localhost"
    mqtt_port: int = 1883
    mqtt_username: str = ""
    mqtt_password: str = ""

    # Shared key the field device / simulator sends as X-Device-Key
    # when posting sensor data. Empty = no check (local development).
    device_api_key: str = ""

    # JWT Auth
    jwt_secret: str
    jwt_expire_minutes: int = 10080  # 7 days

    # Gemini
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()