# db/models.py

import uuid
from datetime import datetime
from sqlalchemy import (Column, String, Float, Integer,
                        Boolean, Text, ForeignKey, DateTime)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db.connection import Base

# Helper to generate UUIDs automatically
def generate_uuid():
    return str(uuid.uuid4())

# ─────────────────────────────────────────
# TABLE 1: Users (Farmers)
# ─────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    language = Column(String, default="hi")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farms = relationship("Farm", back_populates="owner")
    chat_history = relationship("ChatHistory",
                                back_populates="user")

# ─────────────────────────────────────────
# TABLE 2: Farms
# ─────────────────────────────────────────
class Farm(Base):
    __tablename__ = "farms"

    id = Column(String, primary_key=True,
                default=generate_uuid)
    user_id = Column(UUID(as_uuid=True),
                     ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    crop_type = Column(String, default="wheat")
    location_lat = Column(Float)
    location_lng = Column(Float)
    area_acres = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="farms")
    sensor_readings = relationship("SensorReading",
                                   back_populates="farm")
    pump_logs = relationship("PumpLog", back_populates="farm")
    recommendations = relationship("Recommendation",
                                   back_populates="farm")

# ─────────────────────────────────────────
# TABLE 3: Sensor Readings
# ─────────────────────────────────────────
class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4)
    farm_id = Column(String, ForeignKey("farms.id"),
                     nullable=False)
    soil_moisture = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow,
                       index=True)

    farm = relationship("Farm",
                        back_populates="sensor_readings")

# ─────────────────────────────────────────
# TABLE 4: Pump Logs
# ─────────────────────────────────────────
class PumpLog(Base):
    __tablename__ = "pump_logs"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4)
    farm_id = Column(String, ForeignKey("farms.id"),
                     nullable=False)
    action = Column(String, nullable=False)      # ON / OFF
    triggered_by = Column(String, default="farmer")
    duration_minutes = Column(Integer)
    water_used_liters = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="pump_logs")

# ─────────────────────────────────────────
# TABLE 5: Chat History
# ─────────────────────────────────────────
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True),
                     ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)   # user / assistant
    message = Column(Text, nullable=False)
    input_type = Column(String, default="text") # text / voice
    language = Column(String, default="hi")
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_history")

# ─────────────────────────────────────────
# TABLE 6: Recommendations
# ─────────────────────────────────────────
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4)
    farm_id = Column(String, ForeignKey("farms.id"),
                     nullable=False)
    recommendation = Column(String, nullable=False)
    reason = Column(Text)
    confidence = Column(Float)
    acted_upon = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm",
                        back_populates="recommendations")