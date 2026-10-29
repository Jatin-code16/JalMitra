# tests/test_access.py

import pytest


@pytest.mark.asyncio
class TestAccess:

    async def test_farm_routes_need_token(self, client, test_farmer):
        """No token → 401 on farm data routes"""
        farm_id = test_farmer["farm_id"]
        for url in [
            f"/sensors/latest?farm_id={farm_id}",
            f"/pump/status?farm_id={farm_id}",
            f"/analytics/weekly?farm_id={farm_id}",
            "/chat/history",
        ]:
            response = await client.get(url)
            assert response.status_code == 401, url
        print("✅ Farm routes block unauthenticated requests")

    async def test_pump_control_needs_token(self, client, test_farmer):
        """No token → pump can't be switched"""
        response = await client.post("/pump/control", json={
            "farm_id": test_farmer["farm_id"],
            "action": "ON",
            "duration_minutes": 10
        })
        assert response.status_code == 401
        print("✅ Pump control blocks unauthenticated requests")

    async def test_other_farmer_cannot_reach_farm(
        self, client, test_farmer, other_farmer
    ):
        """Another farmer's token → 404 on this farm"""
        headers = {"Authorization": f"Bearer {other_farmer['token']}"}
        farm_id = test_farmer["farm_id"]

        status = await client.get(
            f"/pump/status?farm_id={farm_id}", headers=headers
        )
        assert status.status_code == 404
        assert status.json()["detail"]["error"] == "FARM_NOT_FOUND"

        control = await client.post("/pump/control", headers=headers, json={
            "farm_id": farm_id,
            "action": "OFF"
        })
        assert control.status_code == 404
        print("✅ Farmers can't reach each other's farms")

    async def test_new_farmer_gets_own_farm(
        self, auth_client, test_farmer, other_farmer
    ):
        """Signing up doesn't take over an existing farmer's farm"""
        response = await auth_client.get("/auth/profile")
        farm_ids = [f["id"] for f in response.json()["farms"]]
        assert test_farmer["farm_id"] in farm_ids
        print("✅ Existing farm stays with its owner")

    async def test_device_key_enforced_when_set(
        self, client, test_farmer, monkeypatch
    ):
        """DEVICE_API_KEY set → sensor posts need X-Device-Key"""
        from config import settings
        monkeypatch.setattr(settings, "device_api_key", "secret-key")
        reading = {
            "farm_id": test_farmer["farm_id"],
            "soil_moisture": 50.0,
            "temperature": 30.0,
            "humidity": 60.0
        }

        missing = await client.post("/sensors/data", json=reading)
        assert missing.status_code == 401

        wrong = await client.post(
            "/sensors/data", json=reading,
            headers={"X-Device-Key": "nope"}
        )
        assert wrong.status_code == 401

        ok = await client.post(
            "/sensors/data", json=reading,
            headers={"X-Device-Key": "secret-key"}
        )
        assert ok.status_code == 200
        print("✅ Device key enforced")
