#!/usr/bin/env python3
"""
Database migration script to add new user profile fields.
This script adds missing columns to the users table to support enhanced user profiles.
"""

import asyncio
import sqlite3
import os
from pathlib import Path

def get_database_path():
    """Get the database file path"""
    # Get the backend directory path
    backend_dir = Path(__file__).parent
    db_path = backend_dir / "aftertalk.db"
    return str(db_path)

def migrate_users_table():
    """Add missing columns to users table"""
    db_path = get_database_path()
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found at {db_path}")
        return False
    
    print(f"📁 Database path: {db_path}")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"🔍 Current columns in users table: {columns}")
        
        # List of new columns to add
        new_columns = [
            ("surname", "VARCHAR(100)"),
            ("job_title", "VARCHAR(150)"),
            ("company", "VARCHAR(150)"),
            ("timezone", "VARCHAR(50) DEFAULT 'UTC'")
        ]
        
        # Add missing columns
        columns_added = 0
        for column_name, column_definition in new_columns:
            if column_name not in columns:
                try:
                    alter_sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}"
                    print(f"➕ Adding column: {column_name}")
                    cursor.execute(alter_sql)
                    columns_added += 1
                except sqlite3.Error as e:
                    print(f"❌ Error adding column {column_name}: {e}")
            else:
                print(f"✅ Column {column_name} already exists")
        
        # Commit changes
        conn.commit()
        print(f"✅ Migration completed successfully! Added {columns_added} new columns.")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(users)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"🔍 Updated columns in users table: {updated_columns}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def migrate_meetings_table():
    """Add missing name column to meetings table"""
    db_path = get_database_path()
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(meetings)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"🔍 Current columns in meetings table: {columns}")
        
        # Add name column if it doesn't exist
        if "name" not in columns:
            try:
                alter_sql = "ALTER TABLE meetings ADD COLUMN name VARCHAR(255)"
                print("➕ Adding column: name to meetings table")
                cursor.execute(alter_sql)
                print("✅ Added name column to meetings table")
            except sqlite3.Error as e:
                print(f"❌ Error adding name column to meetings: {e}")
        else:
            print("✅ Column name already exists in meetings table")
        
        conn.commit()
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    """Run all migrations"""
    print("🚀 Starting database migration...")
    print("=" * 50)
    
    # Migrate users table
    print("\n📊 Migrating users table...")
    users_success = migrate_users_table()
    
    # Migrate meetings table
    print("\n📊 Migrating meetings table...")
    meetings_success = migrate_meetings_table()
    
    print("\n" + "=" * 50)
    if users_success and meetings_success:
        print("✅ All migrations completed successfully!")
        print("🎉 Your database is now ready for the enhanced user experience features!")
    else:
        print("❌ Some migrations failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 