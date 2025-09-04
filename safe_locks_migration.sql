-- Safe Migration: Add Locks Table
-- This migration is safe to run and will not cause any data loss
-- It only adds new structures and doesn't modify existing data

-- Check if the enum type already exists before creating it
DO $$ BEGIN
    CREATE TYPE "LockType" AS ENUM ('SHARED', 'EXCLUSIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check if the Lock table already exists before creating it
CREATE TABLE IF NOT EXISTS "Lock" (
    "id" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LockType" NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Lock_pkey" PRIMARY KEY ("id")
);

-- Add indexes only if they don't exist
-- Use IF NOT EXISTS pattern for PostgreSQL compatibility
DO $$ BEGIN
    CREATE UNIQUE INDEX "Lock_useCaseId_userId_type_key" ON "Lock"("useCaseId", "userId", "type");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Lock_useCaseId_idx" ON "Lock"("useCaseId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Lock_userId_idx" ON "Lock"("userId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Lock_type_idx" ON "Lock"("type");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Lock_isActive_idx" ON "Lock"("isActive");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX "Lock_expiresAt_idx" ON "Lock"("expiresAt");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints only if they don't exist
DO $$ BEGIN
    ALTER TABLE "Lock" ADD CONSTRAINT "Lock_useCaseId_fkey" 
    FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Lock" ADD CONSTRAINT "Lock_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify the migration was successful
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as lock_table_count,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'Lock') as table_exists
FROM "Lock";

-- Show table structure for verification
\d "Lock";
