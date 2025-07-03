from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from pathlib import Path

from settings import settings

# Get the absolute path to the backend directory
backend_dir = Path(__file__).parent.parent
database_path = backend_dir / "aftertalk.db"

# Use SQLite as fallback for development if PostgreSQL is not configured
if settings.DATABASE_URL and 'postgresql' in settings.DATABASE_URL:
    # For async PostgreSQL connection using asyncpg
    async_database_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
    async_engine = create_async_engine(
        async_database_url,
        echo=True
    )
    
    # For sync PostgreSQL connection using psycopg2
    sync_database_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+psycopg2://')
    sync_engine = create_engine(sync_database_url, echo=True)
else:
    # Fallback to SQLite for development
    print(f"⚠️  No PostgreSQL DATABASE_URL found, using SQLite for development")
    print(f"📁 Database path: {database_path}")
    
    sqlite_url = f"sqlite+aiosqlite:///{database_path}"
    sqlite_sync_url = f"sqlite:///{database_path}"
    
    async_engine = create_async_engine(
        sqlite_url,
        echo=True
    )
    
    sync_engine = create_engine(sqlite_sync_url, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()