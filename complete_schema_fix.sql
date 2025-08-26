-- Complete Schema Fix Migration
-- This migration addresses all the schema inconsistencies between Prisma and the database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. FIX MISSING UUID DEFAULTS FOR ID FIELDS
-- ============================================================================

-- Fix PromptTemplate.id (already has @default(uuid()) in schema, but ensure DB matches)
ALTER TABLE "PromptTemplate" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Fix PromptTestRun.id
ALTER TABLE "PromptTestRun" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Fix PromptVersion.id
ALTER TABLE "PromptVersion" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Fix PromptDeployment.id
ALTER TABLE "PromptDeployment" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Fix LLMApiConfiguration.id
ALTER TABLE "LLMApiConfiguration" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- ============================================================================
-- 2. ENSURE ALL ID COLUMNS ARE TEXT TYPE (UUIDs are stored as text in Prisma)
-- ============================================================================

ALTER TABLE "PromptTemplate" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "PromptTestRun" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "PromptVersion" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "PromptDeployment" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "LLMApiConfiguration" ALTER COLUMN "id" TYPE TEXT;

-- ============================================================================
-- 3. ADD UUID VALIDATION CONSTRAINTS
-- ============================================================================

-- Add validation constraints to ensure only valid UUIDs are inserted
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

-- ============================================================================
-- 4. FIX UPDATEDAT FIELDS TO AUTO-UPDATE
-- ============================================================================

-- Create a function to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables that need auto-updating updatedAt fields
-- PromptTemplate
DROP TRIGGER IF EXISTS update_prompt_template_updated_at ON "PromptTemplate";
CREATE TRIGGER update_prompt_template_updated_at
    BEFORE UPDATE ON "PromptTemplate"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Assess
DROP TRIGGER IF EXISTS update_assess_updated_at ON "Assess";
CREATE TRIGGER update_assess_updated_at
    BEFORE UPDATE ON "Assess"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- LLMApiConfiguration
DROP TRIGGER IF EXISTS update_llm_api_config_updated_at ON "LLMApiConfiguration";
CREATE TRIGGER update_llm_api_config_updated_at
    BEFORE UPDATE ON "LLMApiConfiguration"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. SAFETY MEASURES - UPDATE ANY NULL IDs TO VALID UUIDs
-- ============================================================================

-- Update any existing NULL IDs to valid UUIDs (safety measure)
UPDATE "PromptTemplate" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "PromptTestRun" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "PromptVersion" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "PromptDeployment" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;
UPDATE "LLMApiConfiguration" SET "id" = uuid_generate_v4() WHERE "id" IS NULL;

-- ============================================================================
-- 6. ENSURE ID COLUMNS ARE NOT NULL
-- ============================================================================

ALTER TABLE "PromptTemplate" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "PromptTestRun" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "PromptVersion" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "PromptDeployment" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "LLMApiConfiguration" ALTER COLUMN "id" SET NOT NULL;

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the changes worked:
/*
SELECT 
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('PromptTemplate', 'PromptTestRun', 'PromptVersion', 'PromptDeployment', 'LLMApiConfiguration')
AND column_name = 'id'
ORDER BY table_name;

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('PromptTemplate', 'Assess', 'LLMApiConfiguration');
*/

-- ============================================================================
-- 8. PERFORMANCE INDEXES (OPTIONAL)
-- ============================================================================

-- Create indexes on ID columns for better performance
CREATE INDEX IF NOT EXISTS "idx_prompt_template_id" ON "PromptTemplate"("id");
CREATE INDEX IF NOT EXISTS "idx_prompt_test_run_id" ON "PromptTestRun"("id");
CREATE INDEX IF NOT EXISTS "idx_prompt_version_id" ON "PromptVersion"("id");
CREATE INDEX IF NOT EXISTS "idx_prompt_deployment_id" ON "PromptDeployment"("id");
CREATE INDEX IF NOT EXISTS "idx_llm_api_configuration_id" ON "LLMApiConfiguration"("id");

-- ============================================================================
-- 9. DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "PromptTemplate" IS 'Updated to use UUID defaults and auto-updating updatedAt';
COMMENT ON TABLE "PromptTestRun" IS 'Updated to use UUID defaults';
COMMENT ON TABLE "PromptVersion" IS 'Updated to use UUID defaults';
COMMENT ON TABLE "PromptDeployment" IS 'Updated to use UUID defaults';
COMMENT ON TABLE "LLMApiConfiguration" IS 'Updated to use UUID defaults and auto-updating updatedAt';
COMMENT ON TABLE "Assess" IS 'Updated to auto-update updatedAt';

-- Migration completed successfully!
-- Your Prisma schema should now be fully consistent with the database.
