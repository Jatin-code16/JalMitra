# tests/test_auth.py

import pytest
from services.otp_service import otp_store


@pytest.mark.asyncio
class TestAuth:

    async def test_send_otp_valid_phone(self, client):
        """Valid phone → OTP sent successfully"""
        response = await client.post(
            "/auth/send-otp",
            json={"phone": "9876543210"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "debug_otp" in data
        assert len(data["debug_otp"]) == 6
        print(f"✅ OTP sent: {data['debug_otp']}")

    async def test_send_otp_invalid_phone(self, client):
        """Invalid phone → error returned"""
        response = await client.post(
            "/auth/send-otp",
            json={"phone": "12345"}  # Too short
        )
        assert response.status_code == 422
        print("✅ Invalid phone rejected correctly")

    async def test_verify_otp_correct(self, client):
        """Correct OTP → token returned"""
        # Send OTP first
        send_res = await client.post(
            "/auth/send-otp",
            json={"phone": "9111222333"}
        )
        otp = send_res.json()["debug_otp"]

        # Verify
        response = await client.post(
            "/auth/verify-otp",
            json={
                "phone": "9111222333",
                "otp": otp,
                "name": "Test User"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert len(data["token"]) > 10
        assert data["farmer"]["name"] == "Test User"
        print(f"✅ Login successful: {data['farmer']['name']}")

    async def test_verify_otp_wrong(self, client):
        """Wrong OTP → error with attempts remaining"""
        await client.post(
            "/auth/send-otp",
            json={"phone": "9000000001"}
        )
        response = await client.post(
            "/auth/verify-otp",
            json={"phone": "9000000001", "otp": "000000"}
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"] == "INVALID_OTP"
        print("✅ Wrong OTP rejected correctly")

    async def test_verify_otp_expired(self, client):
        """Expired OTP → error"""
        # Manually expire OTP
        from services.otp_service import otp_store
        otp_store["9000000002"] = {
            "otp": "123456",
            "expires_at": 0,  # Already expired
            "attempts": 0
        }
        response = await client.post(
            "/auth/verify-otp",
            json={"phone": "9000000002", "otp": "123456"}
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"] == "OTP_EXPIRED"
        print("✅ Expired OTP rejected correctly")

    async def test_protected_route_no_token(self, client):
        """No token → 401 Unauthorized"""
        response = await client.get("/auth/profile")
        assert response.status_code == 401
        print("✅ Protected route blocks unauthenticated request")

    async def test_protected_route_with_token(
        self, client, auth_headers
    ):
        """Valid token → profile returned"""
        response = await client.get(
            "/auth/profile",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "farmer" in data
        print(f"✅ Profile returned: {data['farmer']['name']}")