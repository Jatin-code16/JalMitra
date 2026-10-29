# tests/test_recommendation.py

import pytest
from ml.recommendation import get_recommendation


@pytest.mark.asyncio
class TestRecommendationEngine:

    def test_dry_soil_recommends_irrigate(self):
        """Soil below 40% → irrigate recommended"""
        result = get_recommendation(
            soil_moisture=25.0,
            temperature=30.0,
            humidity=55.0,
            crop_type="wheat"
        )
        assert result["recommendation"] == "irrigate"
        assert result["confidence"] > 0.7
        assert result["alert"] == "CRITICAL_DRY"
        print(f"✅ Dry soil: {result['recommendation']} "
              f"({result['confidence']*100:.0f}% confidence)")

    def test_ideal_soil_recommends_skip(self):
        """Soil 40-60% → skip recommended"""
        result = get_recommendation(
            soil_moisture=50.0,
            temperature=28.0,
            humidity=60.0,
            crop_type="wheat"
        )
        assert result["recommendation"] == "skip"
        assert result["confidence"] > 0.7
        print(f"✅ Ideal soil: {result['recommendation']} "
              f"({result['confidence']*100:.0f}% confidence)")

    def test_wet_soil_recommends_skip(self):
        """Soil above 65% → skip recommended"""
        result = get_recommendation(
            soil_moisture=75.0,
            temperature=28.0,
            humidity=65.0,
            crop_type="wheat"
        )
        assert result["recommendation"] == "skip"
        print(f"✅ Wet soil: {result['recommendation']}")

    def test_borderline_recommends_monitor(self):
        """Soil 35-40% → monitor recommended"""
        result = get_recommendation(
            soil_moisture=37.0,
            temperature=28.0,
            humidity=60.0,
            crop_type="wheat"
        )
        assert result["recommendation"] == "monitor"
        print(f"✅ Borderline soil: {result['recommendation']}")

    def test_high_temp_triggers_alert(self):
        """Temperature above 35°C → heat stress alert"""
        result = get_recommendation(
            soil_moisture=50.0,
            temperature=38.0,  # Above stress threshold
            humidity=55.0,
            crop_type="wheat"
        )
        assert result["alert"] == "HEAT_STRESS"
        print(f"✅ Heat stress detected at 38°C")

    def test_different_crops(self):
        """Same moisture → different recommendations per crop"""
        moisture = 55.0  # OK for wheat, low for rice

        wheat_result = get_recommendation(
            soil_moisture=moisture,
            temperature=28.0,
            humidity=60.0,
            crop_type="wheat"
        )

        rice_result = get_recommendation(
            soil_moisture=moisture,
            temperature=28.0,
            humidity=60.0,
            crop_type="rice"
        )

        # 55% is ideal for wheat but low for rice (needs 60-80%)
        assert wheat_result["recommendation"] == "skip"
        assert rice_result["recommendation"] in ["monitor", "irrigate"]
        print(f"✅ Wheat at 55%: {wheat_result['recommendation']}")
        print(f"✅ Rice at 55%: {rice_result['recommendation']}")

    def test_hindi_reason_generated(self):
        """Hindi reason always present"""
        result = get_recommendation(
            soil_moisture=30.0,
            temperature=28.0,
            humidity=60.0,
            crop_type="wheat"
        )
        assert "reason_hi" in result
        assert len(result["reason_hi"]) > 10
        # Check it contains Hindi characters
        hindi_chars = any(
            '\u0900' <= c <= '\u097F'
            for c in result["reason_hi"]
        )
        assert hindi_chars
        print(f"✅ Hindi reason: {result['reason_hi'][:50]}...")

    @pytest.mark.asyncio
    async def test_recommendation_api_endpoint(
        self, auth_client, test_farmer
    ):
        """API endpoint returns recommendation"""
        # Post sensor data first
        await auth_client.post("/sensors/data", json={
            "farm_id": test_farmer["farm_id"],
            "soil_moisture": 35.0,
            "temperature": 29.0,
            "humidity": 58.0
        })

        response = await auth_client.get(
            f"/analytics/recommendation"
            f"?farm_id={test_farmer['farm_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["recommendation"] in ["irrigate", "skip", "monitor"]
        assert 0 <= data["confidence"] <= 1
        print(f"✅ Recommendation API: {data['recommendation']} "
              f"({data['confidence']*100:.0f}% confidence)")