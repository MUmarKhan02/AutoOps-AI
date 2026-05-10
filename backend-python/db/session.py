from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings

# asyncpg driver required — swap postgresql:// → postgresql+asyncpg://
_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(_url, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
