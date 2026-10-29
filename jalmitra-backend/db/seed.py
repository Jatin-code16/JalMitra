# db/seed.py
import asyncio
import uuid
from db.connection import AsyncSessionLocal, engine, Base
from db.models import User, Farm

async def seed():
    # Make sure tables exist first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select
        result = await db.execute(
            select(Farm).where(Farm.id == "farm001")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("✅ Seed data already exists. Skipping.")
            return

        # Create test farmer
        farmer = User(
            id=uuid.uuid4(),
            name="Ramu Kumar",
            phone="9876543210",
            language="hi"
        )
        db.add(farmer)
        await db.flush()  # Get farmer.id before using it

        # Create test farm
        farm = Farm(
            id="farm001",           # Fixed ID matches simulator
            user_id=farmer.id,
            name="Ramu ka Khet",
            crop_type="wheat",
            location_lat=22.7196,
            location_lng=75.8577,
            area_acres=2.5
        )
        db.add(farm)
        await db.commit()

        print("🌱 Seed data created successfully!")
        print(f"   👨‍🌾 Farmer: Ramu Kumar (9876543210)")
        print(f"   🌾 Farm: farm001 — Ramu ka Khet (Wheat, 2.5 acres)")

if __name__ == "__main__":
    asyncio.run(seed())