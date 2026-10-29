# tests/test_chatbot.py

import pytest


@pytest.mark.asyncio
class TestChatbot:

    async def test_chat_message_returns_reply(
        self, auth_client, test_farmer
    ):
        """Chatbot returns a non-empty Hindi reply"""
        response = await auth_client.post(
            "/chat/message",
            json={
                "user_id": test_farmer["farmer"]["id"],
                "farm_id": test_farmer["farm_id"],
                "message": "aaj sinchai karni chahiye kya?",
                "language": "hi"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert len(data["reply"]) > 10
        assert "message_id" in data
        assert data["message_id"] != "None"
        print(f"✅ Chatbot replied: {data['reply'][:60]}...")

    async def test_chat_saves_to_history(
        self, auth_client, test_farmer
    ):
        """Messages saved to chat history"""
        user_id = test_farmer["farmer"]["id"]

        # Send message
        await auth_client.post("/chat/message", json={
            "user_id": user_id,
            "farm_id": test_farmer["farm_id"],
            "message": "pump chalu karna chahiye?",
            "language": "hi"
        })

        # Check history
        response = await auth_client.get(
            f"/chat/history?user_id={user_id}&limit=5"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 2  # user + assistant
        roles = [msg["role"] for msg in data["history"]]
        assert "user" in roles
        assert "assistant" in roles
        print(f"✅ Chat history: {data['total']} messages saved")

    async def test_chat_empty_message_rejected(
        self, auth_client, test_farmer
    ):
        """Empty message → 400 error"""
        response = await auth_client.post(
            "/chat/message",
            json={
                "user_id": test_farmer["farmer"]["id"],
                "farm_id": test_farmer["farm_id"],
                "message": "",
                "language": "hi"
            }
        )
        assert response.status_code == 400
        print("✅ Empty message rejected correctly")

    async def test_chat_suggestions_returned(
        self, auth_client, test_farmer
    ):
        """Quick suggestions API works"""
        response = await auth_client.get(
            f"/chat/suggestions?farm_id={test_farmer['farm_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert len(data["suggestions"]) > 0
        print(f"✅ {len(data['suggestions'])} suggestions returned")

    async def test_chat_context_uses_farm_data(
        self, auth_client, test_farmer
    ):
        """Reply references actual farm data"""
        # Post specific sensor data
        await auth_client.post("/sensors/data", json={
            "farm_id": test_farmer["farm_id"],
            "soil_moisture": 28.0,  # Very dry
            "temperature": 35.0,
            "humidity": 45.0
        })

        response = await auth_client.post("/chat/message", json={
            "user_id": test_farmer["farmer"]["id"],
            "farm_id": test_farmer["farm_id"],
            "message": "khet ki sthiti kya hai?",
            "language": "hi"
        })
        data = response.json()
        assert data["context_used"]["soil_moisture"] == 28.0
        print(f"✅ Context used moisture: "
              f"{data['context_used']['soil_moisture']}%")