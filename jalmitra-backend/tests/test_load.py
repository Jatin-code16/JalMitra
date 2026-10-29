# tests/test_load.py

import asyncio
import httpx
import time

BASE_URL = "http://localhost:8000"

async def simulate_farmer(farmer_id: int):
    """Simulate one farmer using the app"""
    async with httpx.AsyncClient() as client:
        start = time.time()

        # Get sensor data
        r1 = await client.get(
            f"{BASE_URL}/sensors/latest?farm_id=farm001"
        )

        # Get recommendation
        r2 = await client.get(
            f"{BASE_URL}/analytics/recommendation?farm_id=farm001"
        )

        end = time.time()
        elapsed = round((end - start) * 1000)

        print(
            f"Farmer {farmer_id:2d}: "
            f"sensor={r1.status_code} "
            f"rec={r2.status_code} "
            f"time={elapsed}ms"
        )
        return elapsed

async def load_test(num_farmers: int = 20):
    """Simulate multiple farmers hitting API simultaneously"""
    print(f"\n🔥 Load Test: {num_farmers} farmers simultaneously\n")
    start = time.time()

    tasks = [simulate_farmer(i) for i in range(num_farmers)]
    times = await asyncio.gather(*tasks)

    total = time.time() - start
    avg = sum(times) / len(times)
    max_t = max(times)
    min_t = min(times)

    print(f"\n{'='*40}")
    print(f"✅ All {num_farmers} requests completed")
    print(f"   Total time:   {total:.2f}s")
    print(f"   Avg response: {avg:.0f}ms")
    print(f"   Max response: {max_t:.0f}ms")
    print(f"   Min response: {min_t:.0f}ms")

    if avg < 500:
        print(f"   Rating: 🟢 Excellent (avg < 500ms)")
    elif avg < 1000:
        print(f"   Rating: 🟡 Good (avg < 1s)")
    else:
        print(f"   Rating: 🔴 Needs optimization")

if __name__ == "__main__":
    asyncio.run(load_test(20))