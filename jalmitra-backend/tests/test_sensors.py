# tests/test_sensors.py

import pytest


@pytest.mark.asyncio
class TestSensors:

    async def test_post_sensor_data(self, auth_client, test_farmer):
        """Simulator can post sensor data"""
        response = await auth_client.post(
            "/sensors/data",
            json={
                "farm_id": test_farmer["farm_id"],
                "soil_moisture": 55.5,
                "temperature": 28.3,
                "humidity": 62.1
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "reading_id" in data
        print(f"✅ Sensor data saved: ID {data['reading_id'][:8]}...")

    async def test_get_latest_sensor_data(
        self, auth_client, test_farmer
    ):
        """Latest reading returned correctly"""
        # Post data first
        await auth_client.post("/sensors/data", json={
            "farm_id": test_farmer["farm_id"],
            "soil_moisture": 48.2,
            "temperature": 31.5,
            "humidity": 58.0
        })

        # Get latest
        response = await auth_client.get(
            f"/sensors/latest?farm_id={test_farmer['farm_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["data"]["soil_moisture"] == 48.2
        assert data["data"]["temperature"] == 31.5
        assert data["status"]["sensor_online"] == True
        print(f"✅ Latest reading: {data['data']['soil_moisture']}% moisture")

    async def test_sensor_data_no_farm(self, auth_client):
        """Non-existent farm → 404"""
        response = await auth_client.get(
            "/sensors/latest?farm_id=nonexistent_farm"
        )
        assert response.status_code == 404
        print("✅ Missing farm returns 404 correctly")

    async def test_sensor_history(self, auth_client, test_farmer):
        """History returns multiple readings"""
        # Post 3 readings
        for moisture in [40.0, 45.0, 50.0]:
            await auth_client.post("/sensors/data", json={
                "farm_id": test_farmer["farm_id"],
                "soil_moisture": moisture,
                "temperature": 30.0,
                "humidity": 60.0
            })

        response = await auth_client.get(
            f"/sensors/history?farm_id={test_farmer['farm_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["total_records"] >= 3
        print(f"✅ History returned {data['total_records']} records")

    async def test_sensor_data_validation(self, auth_client, test_farmer):
        """Missing fields → validation error"""
        response = await auth_client.post(
            "/sensors/data",
            json={
                "farm_id": test_farmer["farm_id"],
                # Missing moisture, temp, humidity
            }
        )
        assert response.status_code == 422
        print("✅ Missing fields rejected correctly")