-- Remove Assess table migration
-- This migration removes the Assess table as it has been replaced by the Q&A model (Answer table)

-- Drop the Assess table (CASCADE will handle foreign key constraints)
DROP TABLE IF EXISTS "Assess" CASCADE;

