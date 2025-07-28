-- AfterTalk Database Initialization Script
-- This script runs when PostgreSQL container starts for the first time

-- Create database if not exists (already handled by POSTGRES_DB env var)
-- The database 'aftertalk' and user 'aftertalk_user' are created automatically

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE aftertalk TO aftertalk_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO aftertalk_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aftertalk_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aftertalk_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aftertalk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aftertalk_user;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'AfterTalk database initialized successfully';
    RAISE NOTICE 'Database: aftertalk';
    RAISE NOTICE 'User: aftertalk_user';
    RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm';
    RAISE NOTICE 'Timezone: UTC';
END $$;