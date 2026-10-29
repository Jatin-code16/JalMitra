# tests/test_pump.py

import pytest


@pytest.mark.asyncio
class TestPump:

    async def test_get_pump_status(self, auth_client, test_farmer):
        """Pump status returns correctly"""
        response = await auth_client.get(
            f"/pump/status?farm_id={test_farmer['farm_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "pump" in data
        assert data["pump"]["status"] in ["ON", "OFF", "UNKNOWN"]
        print(f"✅ Pump status: {data['pump']['status']}")

    async def test_turn_pump_on(self, auth_client, test_farmer):
        """Pump turns ON correctly"""
        # First make sure pump is OFF
        from mqtt.handlers import set_pump_state
        set_pump_state(test_farmer["farm_id"], "OFF")

        response = await auth_client.post(
            "/pump/control",
            json={
                "farm_id": test_farmer["farm_id"],
                "action": "ON",
                "duration_minutes": 30,
                "triggered_by": "farmer"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["pump"]["status"] == "ON"
        assert "will_auto_off_at" in data["pump"]
        print(f"✅ Pump turned ON — auto-off at {data['pump']['will_auto_off_at']}")

    async def test_pump_already_on_error(self, auth_client, test_farmer):
        """Turning ON already-ON pump → error"""
        from mqtt.handlers import set_pump_state
        set_pump_state(test_farmer["farm_id"], "ON")

        response = await auth_client.post(
            "/pump/control",
            json={
                "farm_id": test_farmer["farm_id"],
                "action": "ON",
                "duration_minutes": 30,
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"] == "PUMP_ALREADY_ON"
        print("✅ Double ON correctly rejected")

    async def test_turn_pump_off(self, auth_client, test_farmer):
        """Pump turns OFF correctly"""
        from mqtt.handlers import set_pump_state
        set_pump_state(test_farmer["farm_id"], "ON")

        response = await auth_client.post(
            "/pump/control",
            json={
                "farm_id": test_farmer["farm_id"],
                "action": "OFF",
                "triggered_by": "farmer"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["pump"]["status"] == "OFF"
        print("✅ Pump turned OFF correctly")

    async def test_pump_invalid_duration(self, auth_client, test_farmer):
        """Duration > 180 min → validation error"""
        from mqtt.handlers import set_pump_state
        set_pump_state(test_farmer["farm_id"], "OFF")

        response = await auth_client.post(
            "/pump/control",
            json={
                "farm_id": test_farmer["farm_id"],
                "action": "ON",
                "duration_minutes": 999  # Too long
            }
        )
        assert response.status_code == 422
        print("✅ Invalid duration rejected correctly")

    async def test_pump_history(self, auth_client, test_farmer):
        """Pump history returns logs"""
        response = await auth_client.get(
            f"/pump/history?farm_id={test_farmer['farm_id']}&limit=5"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "history" in data
        print(f"✅ Pump history: {len(data['history'])} records")