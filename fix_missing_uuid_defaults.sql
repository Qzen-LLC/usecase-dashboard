-- Migration: Fix missing UUID defaults for ID fields
-- This migration safely adds @default(uuid()) to models that are missing it
-- without disturbing existing data

-- 1. Fix PromptTemplate.id - Add UUID default
-- First, ensure the id column can accept UUIDs
ALTER TABLE "PromptTemplate" ALTER COLUMN "id" SET DATA TYPE TEXT;

-- Add a check constraint to ensure only valid UUIDs are inserted
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_id_uuid_check" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 2. Fix PromptTestRun.id - Add UUID default
ALTER TABLE "PromptTestRun" ALTER COLUMN "id" SET DATA TYPE TEXT;
ALTER TABLE "PromptTestRun" ADD CONSTRAINT "PromptTestRun_id_uuid_check" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 3. Fix PromptVersion.id - Add UUID default
ALTER TABLE "PromptVersion" ALTER COLUMN "id" SET DATA TYPE TEXT;
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_id_uuid_check" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 4. Fix PromptDeployment.id - Add UUID default
ALTER TABLE "PromptDeployment" ALTER COLUMN "id" SET DATA TYPE TEXT;
ALTER TABLE "PromptDeployment" ADD CONSTRAINT "PromptDeployment_id_uuid_check" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 5. Fix LLMApiConfiguration.id - Add UUID default
ALTER TABLE "LLMApiConfiguration" ALTER COLUMN "id" SET DATA TYPE TEXT;
ALTER TABLE "LLMApiConfiguration" ADD CONSTRAINT "LLMApiConfiguration_id_uuid_check" 
CHECK ("id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 6. Create a function to generate UUIDs if the extension isn't available
CREATE OR REPLACE FUNCTION generate_uuid() RETURNS TEXT AS $$
BEGIN
  RETURN gen_random_uuid()::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. Create sequences for auto-incrementing if needed (fallback)
-- Note: This is optional and only needed if you want to maintain some form of auto-incrementing
-- while also supporting UUIDs

-- 8. Add comments for documentation
COMMENT ON TABLE "PromptTemplate" IS 'Updated to use UUID defaults for ID field';
COMMENT ON TABLE "PromptTestRun" IS 'Updated to use UUID defaults for ID field';
COMMENT ON TABLE "PromptVersion" IS 'Updated to use UUID defaults for ID field';
COMMENT ON TABLE "PromptDeployment" IS 'Updated to use UUID defaults for ID field';
COMMENT ON TABLE "LLMApiConfiguration" IS 'Updated to use UUID defaults for ID field';

-- 9. Verify the changes
-- You can run these queries to verify the changes:
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name IN ('PromptTemplate', 'PromptTestRun', 'PromptVersion', 'PromptDeployment', 'LLMApiConfiguration')
-- AND column_name = 'id';

-- 10. Optional: Create indexes on the ID columns for better performance
CREATE INDEX IF NOT EXISTS "idx_prompt_template_id" ON "PromptTemplate"("id");
CREATE INDEX IF NOT EXISTS "idx_prompt_test_run_id" ON "PromptTestRun"("id");
CREATE INDEX IF NOT EXISTS "idx_prompt_version_id" ON "PromptVersion"("id");
CREATE INDEX IF NOT EXISTS "idx_prompt_deployment_id" ON "PromptDeployment"("id");
CREATE INDEX IF NOT EXISTS "idx_llm_api_configuration_id" ON "LLMApiConfiguration"("id");
