-- Safe Prisma Migration: Add UUID defaults to missing ID fields
-- This migration is designed to work with Prisma and won't disturb existing data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Update PromptTemplate.id to have UUID default
-- This is the main fix for your current error
ALTER TABLE "PromptTemplate" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- 2. Update other models that are missing UUID defaults
ALTER TABLE "PromptTestRun" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "PromptVersion" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "PromptDeployment" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "LLMApiConfiguration" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- 3. Ensure all ID columns are TEXT type (UUIDs are stored as text in Prisma)
-- This is safe and won't affect existing data
ALTER TABLE "PromptTemplate" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "PromptTestRun" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "PromptVersion" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "PromptDeployment" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "LLMApiConfiguration" ALTER COLUMN "id" TYPE TEXT;

-- 4. Add validation constraints to ensure only valid UUIDs are inserted
-- This prevents invalid data from being inserted
ALTER TABLE "PromptTemplate" 
ADD CONSTRAINT "PromptTemplate_id_uuid_format" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

ALTER TABLE "PromptTestRun" 
ADD CONSTRAINT "PromptTestRun_id_uuid_format" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

ALTER TABLE "PromptVersion" 
ADD CONSTRAINT "PromptVersion_id_uuid_format" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

ALTER TABLE "PromptDeployment" 
ADD CONSTRAINT "PromptDeployment_id_uuid_format" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

ALTER TABLE "LLMApiConfiguration" 
ADD CONSTRAINT "LLMApiConfiguration_id_uuid_format" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 5. Update any existing NULL IDs to valid UUIDs (if any exist)
-- This is a safety measure in case there are any NULL values
UPDATE "PromptTemplate" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "PromptTestRun" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "PromptVersion" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "PromptDeployment" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "LLMApiConfiguration" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;

-- 6. Make ID columns NOT NULL (they should be primary keys anyway)
ALTER TABLE "PromptTemplate" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "PromptTestRun" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "PromptVersion" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "PromptDeployment" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "LLMApiConfiguration" ALTER COLUMN "id" SET NOT NULL;

-- 7. Verification queries (run these to confirm the changes)
-- SELECT 
--   table_name,
--   column_name,
--   data_type,
--   column_default,
--   is_nullable
-- FROM information_schema.columns 
-- WHERE table_name IN ('PromptTemplate', 'PromptTestRun', 'PromptVersion', 'PromptDeployment', 'LLMApiConfiguration')
-- AND column_name = 'id'
-- ORDER BY table_name;
