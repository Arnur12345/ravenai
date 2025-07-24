#!/usr/bin/env python3
"""
Database migration script for Polar subscription integration
Run this after updating your models to add subscription support
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from database import Base
from settings import settings

async def migrate_database():
    """Add subscription fields to existing database"""
    
    # Create async engine
    if settings.DATABASE_URL and 'postgresql' in settings.DATABASE_URL:
        async_database_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
    else:
        # Fallback to SQLite
        backend_dir = Path(__file__).parent
        database_path = backend_dir / "aftertalk.db"
        async_database_url = f"sqlite+aiosqlite:///{database_path}"
    
    engine = create_async_engine(async_database_url, echo=True)
    
    try:
        async with engine.begin() as conn:
            print("🔄 Starting database migration for subscription features...")
            
            # Check if we're using PostgreSQL or SQLite
            is_postgres = 'postgresql' in async_database_url
            
            if is_postgres:
                # PostgreSQL migration
                await migrate_postgresql(conn)
            else:
                # SQLite migration
                await migrate_sqlite(conn)
                
            print("✅ Database migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await engine.dispose()

async def migrate_postgresql(conn):
    """PostgreSQL specific migration"""
    
    # Add subscription fields to users table
    subscription_fields = [
        "ADD COLUMN IF NOT EXISTS polar_customer_id VARCHAR UNIQUE",
        "ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'free'",
        "ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free'",
        "ADD COLUMN IF NOT EXISTS current_subscription_id VARCHAR",
        "ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE",
        "ADD COLUMN IF NOT EXISTS monthly_transcription_minutes INTEGER DEFAULT 0",
        "ADD COLUMN IF NOT EXISTS monthly_meetings_count INTEGER DEFAULT 0",
        "ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMP WITH TIME ZONE"
    ]
    
    for field in subscription_fields:
        try:
            await conn.execute(text(f"ALTER TABLE users {field}"))
            print(f"  ✓ Added: {field}")
        except Exception as e:
            print(f"  ⚠️  Field may already exist: {field} ({e})")
    
    # Create subscriptions table
    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id VARCHAR NOT NULL REFERENCES users(id),
            polar_subscription_id VARCHAR UNIQUE NOT NULL,
            polar_customer_id VARCHAR NOT NULL,
            status VARCHAR NOT NULL,
            tier VARCHAR NOT NULL,
            product_id VARCHAR NOT NULL,
            price_id VARCHAR NOT NULL,
            current_period_start TIMESTAMP WITH TIME ZONE,
            current_period_end TIMESTAMP WITH TIME ZONE,
            cancel_at_period_end BOOLEAN DEFAULT FALSE,
            canceled_at TIMESTAMP WITH TIME ZONE,
            subscription_metadata TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """))
    print("  ✓ Created subscriptions table")
    
    # Create webhook_events table
    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS webhook_events (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            polar_event_id VARCHAR UNIQUE NOT NULL,
            event_type VARCHAR NOT NULL,
            processed BOOLEAN DEFAULT FALSE,
            processing_attempts INTEGER DEFAULT 0,
            payload TEXT NOT NULL,
            last_error TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE
        )
    """))
    print("  ✓ Created webhook_events table")

async def migrate_sqlite(conn):
    """SQLite specific migration"""
    
    # For SQLite, we need to check if columns exist first
    result = await conn.execute(text("PRAGMA table_info(users)"))
    existing_columns = {row[1] for row in result.fetchall()}
    
    subscription_columns = [
        ("polar_customer_id", "TEXT UNIQUE"),
        ("subscription_status", "TEXT DEFAULT 'free'"),
        ("subscription_tier", "TEXT DEFAULT 'free'"),
        ("current_subscription_id", "TEXT"),
        ("subscription_ends_at", "DATETIME"),
        ("monthly_transcription_minutes", "INTEGER DEFAULT 0"),
        ("monthly_meetings_count", "INTEGER DEFAULT 0"),
        ("usage_reset_date", "DATETIME")
    ]
    
    for column_name, column_type in subscription_columns:
        if column_name not in existing_columns:
            try:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))
                print(f"  ✓ Added: {column_name}")
            except Exception as e:
                print(f"  ⚠️  Failed to add {column_name}: {e}")
        else:
            print(f"  ➤ Column {column_name} already exists")
    
    # Create subscriptions table
    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            polar_subscription_id TEXT UNIQUE NOT NULL,
            polar_customer_id TEXT NOT NULL,
            status TEXT NOT NULL,
            tier TEXT NOT NULL,
            product_id TEXT NOT NULL,
            price_id TEXT NOT NULL,
            current_period_start DATETIME,
            current_period_end DATETIME,
            cancel_at_period_end BOOLEAN DEFAULT FALSE,
            canceled_at DATETIME,
            subscription_metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """))
    print("  ✓ Created subscriptions table")
    
    # Create webhook_events table
    await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS webhook_events (
            id TEXT PRIMARY KEY,
            polar_event_id TEXT UNIQUE NOT NULL,
            event_type TEXT NOT NULL,
            processed BOOLEAN DEFAULT FALSE,
            processing_attempts INTEGER DEFAULT 0,
            payload TEXT NOT NULL,
            last_error TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed_at DATETIME
        )
    """))
    print("  ✓ Created webhook_events table")

if __name__ == "__main__":
    print("🚀 Running Polar subscription database migration...")
    asyncio.run(migrate_database())
    print("\n📋 Next steps:")
    print("1. Set up your Polar account at https://polar.sh/signup")
    print("2. Create your organization and products")
    print("3. Configure environment variables with your Polar credentials")
    print("4. Update POLAR_*_PRICE_ID variables with your product price IDs")
    print("5. Restart your backend service")
    print("\n🔗 Webhook URL for Polar: https://yourdomain.com/api/subscription/webhooks/polar")