-- Clean up duplicate locks and fix any data inconsistencies
-- This script will safely remove duplicate locks and ensure data integrity

-- First, let's see what locks exist
SELECT 'Current locks:' as info;
SELECT id, "useCaseId", "userId", type, "isActive", "expiresAt" FROM "Lock" ORDER BY "useCaseId", "userId", type;

-- Check for duplicate locks (same useCaseId, userId, and type)
SELECT 'Duplicate locks found:' as info;
SELECT "useCaseId", "userId", type, COUNT(*) as count
FROM "Lock" 
WHERE "isActive" = true
GROUP BY "useCaseId", "userId", type 
HAVING COUNT(*) > 1;

-- Clean up duplicate locks by keeping only the most recent one
WITH duplicate_locks AS (
  SELECT id,
         "useCaseId",
         "userId", 
         type,
         ROW_NUMBER() OVER (
           PARTITION BY "useCaseId", "userId", type 
           ORDER BY "acquiredAt" DESC
         ) as rn
  FROM "Lock"
  WHERE "isActive" = true
)
DELETE FROM "Lock" 
WHERE id IN (
  SELECT id 
  FROM duplicate_locks 
  WHERE rn > 1
);

-- Mark expired locks as inactive
UPDATE "Lock" 
SET "isActive" = false 
WHERE "expiresAt" < NOW() AND "isActive" = true;

-- Show the cleaned up locks
SELECT 'Locks after cleanup:' as info;
SELECT id, "useCaseId", "userId", type, "isActive", "expiresAt" FROM "Lock" ORDER BY "useCaseId", "userId", type;

-- Verify the unique constraint is working
SELECT 'Verifying unique constraint:' as info;
SELECT "useCaseId", "userId", type, COUNT(*) as count
FROM "Lock" 
WHERE "isActive" = true
GROUP BY "useCaseId", "userId", type 
HAVING COUNT(*) > 1;
