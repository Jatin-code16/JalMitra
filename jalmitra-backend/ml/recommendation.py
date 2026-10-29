# ml/recommendation.py

import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# CROP PROFILES
# ─────────────────────────────────────────

CROP_PROFILES = {
    "wheat": {
        "name_hi": "गेहूँ",
        "moisture_min": 40,
        "moisture_ideal_low": 40,
        "moisture_ideal_high": 60,
        "moisture_max": 65,
        "temp_stress_high": 35,   # Above this = heat stress
        "temp_stress_low": 10,    # Below this = cold stress
    },
    "rice": {
        "name_hi": "धान",
        "moisture_min": 60,
        "moisture_ideal_low": 60,
        "moisture_ideal_high": 80,
        "moisture_max": 85,
        "temp_stress_high": 38,
        "temp_stress_low": 15,
    },
    "cotton": {
        "name_hi": "कपास",
        "moisture_min": 35,
        "moisture_ideal_low": 35,
        "moisture_ideal_high": 65,
        "moisture_max": 70,
        "temp_stress_high": 40,
        "temp_stress_low": 12,
    },
    "sugarcane": {
        "name_hi": "गन्ना",
        "moisture_min": 55,
        "moisture_ideal_low": 55,
        "moisture_ideal_high": 75,
        "moisture_max": 80,
        "temp_stress_high": 38,
        "temp_stress_low": 10,
    },
    "maize": {
        "name_hi": "मक्का",
        "moisture_min": 40,
        "moisture_ideal_low": 40,
        "moisture_ideal_high": 65,
        "moisture_max": 70,
        "temp_stress_high": 37,
        "temp_stress_low": 10,
    }
}

# Default to wheat if crop not found
DEFAULT_CROP = "wheat"


# ─────────────────────────────────────────
# DATA CLASS — Structured Input
# ─────────────────────────────────────────

@dataclass
class FarmReading:
    """One snapshot of farm conditions"""
    soil_moisture: float      # percentage 0-100
    temperature: float        # celsius
    humidity: float           # percentage 0-100
    crop_type: str            # wheat, rice, cotton etc.
    pump_on_today: bool = False        # Was pump used today?
    hours_since_last_irrigation: Optional[float] = None


# ─────────────────────────────────────────
# DATA CLASS — Structured Output
# ─────────────────────────────────────────

@dataclass
class Recommendation:
    """The engine's recommendation output"""
    decision: str          # "irrigate" / "skip" / "monitor"
    confidence: float      # 0.0 to 1.0
    reason_hi: str         # Hindi explanation for farmer
    reason_en: str         # English explanation for logs
    next_check_hours: int  # When to check again
    alert: Optional[str] = None  # Any warning message


# ─────────────────────────────────────────
# MAIN ENGINE
# ─────────────────────────────────────────

class IrrigationRecommendationEngine:
    """
    Rule-based irrigation recommendation engine.

    Why rule-based first?
    - Works without training data
    - Explainable to farmers
    - Agronomically validated
    - Easy to upgrade to ML later
    """

    def __init__(self):
        logger.info("🤖 Recommendation Engine initialized")

    def recommend(self, reading: FarmReading) -> Recommendation:
        """
        Main method — takes farm reading, returns recommendation.
        Called every time farmer opens app or requests suggestion.
        """
        # Get crop profile (fallback to wheat)
        crop = CROP_PROFILES.get(
            reading.crop_type.lower(),
            CROP_PROFILES[DEFAULT_CROP]
        )

        moisture = reading.soil_moisture
        temp = reading.temperature
        humidity = reading.humidity
        crop_name = crop["name_hi"]

        logger.info(
            f"🌾 Analyzing: moisture={moisture}%, "
            f"temp={temp}°C, crop={reading.crop_type}"
        )

        # ── RULE 1: Critical Dry — Must Irrigate ──
        if moisture < crop["moisture_min"]:
            deficit = crop["moisture_min"] - moisture
            confidence = min(0.95, 0.7 + (deficit / 100))

            return Recommendation(
                decision="irrigate",
                confidence=round(confidence, 2),
                reason_hi=(
                    f"⚠️ आपके खेत की मिट्टी बहुत सूखी है! "
                    f"नमी {moisture:.1f}% है, जबकि {crop_name} "
                    f"के लिए कम से कम {crop['moisture_min']}% "
                    f"होनी चाहिए। अभी सिंचाई करें।"
                ),
                reason_en=(
                    f"Critical: Moisture {moisture:.1f}% below "
                    f"minimum {crop['moisture_min']}% for "
                    f"{reading.crop_type}"
                ),
                next_check_hours=4,
                alert="CRITICAL_DRY"
            )

        # ── RULE 2: Too Wet — Skip Irrigation ──
        if moisture > crop["moisture_max"]:
            excess = moisture - crop["moisture_max"]
            confidence = min(0.95, 0.7 + (excess / 100))

            return Recommendation(
                decision="skip",
                confidence=round(confidence, 2),
                reason_hi=(
                    f"✅ मिट्टी में पर्याप्त नमी है। "
                    f"नमी {moisture:.1f}% है, जो {crop_name} "
                    f"के लिए थोड़ी ज़्यादा है। "
                    f"अभी सिंचाई की ज़रूरत नहीं।"
                ),
                reason_en=(
                    f"Moisture {moisture:.1f}% above maximum "
                    f"{crop['moisture_max']}% — skip irrigation"
                ),
                next_check_hours=8
            )

        # ── RULE 3: Ideal Range — Skip ──
        if (crop["moisture_ideal_low"] <= moisture
                <= crop["moisture_ideal_high"]):

            # High temperature reduces confidence to skip
            # (evaporation will dry soil faster)
            temp_factor = 0.0
            if temp > crop["temp_stress_high"]:
                temp_factor = 0.15  # Reduce confidence

            confidence = round(0.85 - temp_factor, 2)

            # Warn about heat stress
            alert = None
            heat_warning = ""
            if temp > crop["temp_stress_high"]:
                alert = "HEAT_STRESS"
                heat_warning = (
                    f" तापमान {temp:.0f}°C है जो ज़्यादा है — "
                    f"शाम को दोबारा जाँचें।"
                )

            return Recommendation(
                decision="skip",
                confidence=confidence,
                reason_hi=(
                    f"✅ सब ठीक है! मिट्टी की नमी {moisture:.1f}% है, "
                    f"जो {crop_name} के लिए एकदम सही है।"
                    f"{heat_warning}"
                ),
                reason_en=(
                    f"Moisture {moisture:.1f}% within ideal range "
                    f"{crop['moisture_ideal_low']}-"
                    f"{crop['moisture_ideal_high']}%"
                ),
                next_check_hours=6 if temp > crop["temp_stress_high"]
                                 else 12,
                alert=alert
            )

        # ── RULE 4: Low but Not Critical — Monitor ──
        if (crop["moisture_min"] <= moisture
                < crop["moisture_ideal_low"]):

            # Factor in humidity — high humidity = less evaporation
            # so we can wait longer
            humidity_factor = 1.0
            if humidity > 70:
                humidity_factor = 0.8  # Less urgent

            confidence = round(0.75 * humidity_factor, 2)

            return Recommendation(
                decision="monitor",
                confidence=confidence,
                reason_hi=(
                    f"⚡ मिट्टी थोड़ी सूखने लगी है। "
                    f"नमी {moisture:.1f}% है। "
                    f"अगले कुछ घंटों में सिंचाई की ज़रूरत "
                    f"पड़ सकती है। नज़र रखें।"
                ),
                reason_en=(
                    f"Moisture {moisture:.1f}% approaching minimum — "
                    f"monitor closely"
                ),
                next_check_hours=3
            )

        # ── RULE 5: High but Not Excessive — Monitor ──
        return Recommendation(
            decision="monitor",
            confidence=0.70,
            reason_hi=(
                f"मिट्टी में नमी ठीक है लेकिन थोड़ी "
                f"ज़्यादा है ({moisture:.1f}%)। "
                f"कुछ घंटे रुकें।"
            ),
            reason_en=(
                f"Moisture {moisture:.1f}% slightly above ideal — "
                f"monitor"
            ),
            next_check_hours=6
        )


# ─────────────────────────────────────────
# SINGLETON INSTANCE
# ─────────────────────────────────────────

engine = IrrigationRecommendationEngine()


# ─────────────────────────────────────────
# HELPER FUNCTION — Easy to call from API
# ─────────────────────────────────────────

def get_recommendation(
    soil_moisture: float,
    temperature: float,
    humidity: float,
    crop_type: str,
    pump_on_today: bool = False,
    hours_since_last_irrigation: Optional[float] = None
) -> dict:
    """
    Simple function wrapper — call this from your API routes.
    Returns a clean dictionary ready to send as JSON.
    """
    reading = FarmReading(
        soil_moisture=soil_moisture,
        temperature=temperature,
        humidity=humidity,
        crop_type=crop_type,
        pump_on_today=pump_on_today,
        hours_since_last_irrigation=hours_since_last_irrigation
    )

    result = engine.recommend(reading)

    return {
        "recommendation": result.decision,
        "confidence": result.confidence,
        "reason_hi": result.reason_hi,
        "reason_en": result.reason_en,
        "next_check_hours": result.next_check_hours,
        "alert": result.alert
    }