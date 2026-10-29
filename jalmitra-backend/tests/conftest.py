# tests/conftest.py

import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from main import app
from db.connection import get_db, Base

# ── Test Database (in-memory SQLite) ──
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ── Override DB dependency ──
async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def setup_db():
    """Create all tables before tests"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="session")
async def client(setup_db):
    """HTTP client for testing APIs"""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture(scope="session")
async def test_farmer(client):
    """Create test farmer and return auth token"""
    # Send OTP
    await client.post("/auth/send-otp", json={"phone": "9999999999"})

    # Get OTP from store (debug mode returns it)
    from services.otp_service import otp_store
    otp = otp_store.get("9999999999", {}).get("otp", "123456")

    # Verify OTP
    response = await client.post("/auth/verify-otp", json={
        "phone": "9999999999",
        "otp": otp,
        "name": "Test Farmer"
    })

    data = response.json()
    return {
        "token": data["token"],
        "farmer": data["farmer"],
        "farm_id": data["farms"][0]["id"] if data["farms"] else "farm001"
    }


@pytest.fixture(scope="session")
async def auth_client(setup_db, test_farmer):
    """HTTP client that sends the test farmer's token on every request"""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        headers={"Authorization": f"Bearer {test_farmer['token']}"}
    ) as ac:
        yield ac


@pytest.fixture(scope="session")
async def other_farmer(client):
    """A second farmer, used to check farmers can't reach each other's farms"""
    send = await client.post("/auth/send-otp", json={"phone": "8888888888"})
    verify = await client.post("/auth/verify-otp", json={
        "phone": "8888888888",
        "otp": send.json()["debug_otp"],
        "name": "Other Farmer"
    })
    return {"token": verify.json()["token"]}


@pytest.fixture
def auth_headers(test_farmer):
    """Auth headers for protected routes"""
    return {
        "Authorization": f"Bearer {test_farmer['token']}"
    }