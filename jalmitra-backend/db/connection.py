# db/connection.py — add SSL connect args

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings
import ssl

# ── Build SSL context for Supabase ──
def get_engine():
    db_url = settings.database_url

    # Check if production (Supabase) or local
    if 'supabase.co' in db_url or 'ssl=require' in db_url:
        # Production — SSL required
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        connect_args = { 
            "ssl": ssl_ctx,
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0
        }
    else:
        # Local PostgreSQL — no SSL
        connect_args = {}

    return create_async_engine(
        db_url,
        echo=settings.debug,
        pool_size=5,
        max_overflow=10,
        connect_args=connect_args
    )

engine = get_engine()

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()