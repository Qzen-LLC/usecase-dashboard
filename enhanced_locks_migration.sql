-- Enhanced Safe Migration: Add Locks Table
-- This migration is safe to run and will not cause any data loss
-- It only adds new structures and doesn't modify existing data

-- Set client encoding and timezone
SET client_encoding = 'UTF8';
SET timezone = 'UTC';

-- Function to safely create enum type
CREATE OR REPLACE FUNCTION create_lock_type_enum()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LockType') THEN
        CREATE TYPE "LockType" AS ENUM ('SHARED', 'EXCLUSIVE');
        RAISE NOTICE 'LockType enum created successfully';
    ELSE
        RAISE NOTICE 'LockType enum already exists';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_lock_type_enum();

-- Drop the function after use
DROP FUNCTION create_lock_type_enum();

-- Create the Lock table with better error handling
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Lock') THEN
        CREATE TABLE "Lock" (
            "id" TEXT NOT NULL,
            "useCaseId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "type" "LockType" NOT NULL,
            "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "expiresAt" TIMESTAMP(3) NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            CONSTRAINT "Lock_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'Lock table created successfully';
    ELSE
        RAISE NOTICE 'Lock table already exists';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Lock table: %', SQLERRM;
        RAISE;
END $$;

-- Function to safely create indexes
CREATE OR REPLACE FUNCTION create_lock_indexes()
RETURNS void AS $$
BEGIN
    -- Create unique index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Lock_useCaseId_userId_type_key') THEN
        CREATE UNIQUE INDEX "Lock_useCaseId_userId_type_key" ON "Lock"("useCaseId", "userId", "type");
        RAISE NOTICE 'Unique index Lock_useCaseId_userId_type_key created';
    ELSE
        RAISE NOTICE 'Unique index Lock_useCaseId_userId_type_key already exists';
    END IF;

    -- Create other indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Lock_useCaseId_idx') THEN
        CREATE INDEX "Lock_useCaseId_idx" ON "Lock"("useCaseId");
        RAISE NOTICE 'Index Lock_useCaseId_idx created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Lock_userId_idx') THEN
        CREATE INDEX "Lock_userId_idx" ON "Lock"("userId");
        RAISE NOTICE 'Index Lock_userId_idx created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Lock_type_idx') THEN
        CREATE INDEX "Lock_type_idx" ON "Lock"("type");
        RAISE NOTICE 'Index Lock_type_idx created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Lock_isActive_idx') THEN
        CREATE INDEX "Lock_isActive_idx" ON "Lock"("isActive");
        RAISE NOTICE 'Index Lock_isActive_idx created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Lock_expiresAt_idx') THEN
        CREATE INDEX "Lock_expiresAt_idx" ON "Lock"("expiresAt");
        RAISE NOTICE 'Index Lock_expiresAt_idx created';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_lock_indexes();

-- Drop the function after use
DROP FUNCTION create_lock_indexes();

-- Function to safely add foreign key constraints
CREATE OR REPLACE FUNCTION add_lock_foreign_keys()
RETURNS void AS $$
BEGIN
    -- Add foreign key for useCaseId
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Lock_useCaseId_fkey'
    ) THEN
        ALTER TABLE "Lock" ADD CONSTRAINT "Lock_useCaseId_fkey" 
        FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Foreign key Lock_useCaseId_fkey added';
    ELSE
        RAISE NOTICE 'Foreign key Lock_useCaseId_fkey already exists';
    END IF;

    -- Add foreign key for userId
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Lock_userId_fkey'
    ) THEN
        ALTER TABLE "Lock" ADD CONSTRAINT "Lock_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Foreign key Lock_userId_fkey added';
    ELSE
        RAISE NOTICE 'Foreign key Lock_userId_fkey already exists';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding foreign keys: %', SQLERRM;
        RAISE;
END $$;

-- Execute the function
SELECT add_lock_foreign_keys();

-- Drop the function after use
DROP FUNCTION add_lock_foreign_keys();

-- Verify the migration was successful
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    constraint_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name = 'Lock' AND table_schema = 'public';
    
    -- Check indexes
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE tablename = 'Lock';
    
    -- Check constraints
    SELECT COUNT(*) INTO constraint_count 
    FROM information_schema.table_constraints 
    WHERE table_name = 'Lock';
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Table exists: %', CASE WHEN table_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Constraints created: %', constraint_count;
    
    IF table_count > 0 THEN
        RAISE NOTICE 'Migration completed successfully!';
    ELSE
        RAISE NOTICE 'Migration failed - table not created';
    END IF;
END $$;

-- Show final table structure
\d "Lock";
