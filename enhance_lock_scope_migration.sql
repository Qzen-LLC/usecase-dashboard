-- Safe migration to add scoped locks without data loss
-- Target: Postgres

-- 1) Create enum type LockScope if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LockScope') THEN
    CREATE TYPE "LockScope" AS ENUM ('ASSESS', 'EDIT');
  END IF;
END$$ LANGUAGE plpgsql;

-- 2) Add column scope (nullable first), if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Lock' AND column_name = 'scope'
  ) THEN
    ALTER TABLE "Lock" ADD COLUMN "scope" "LockScope";
  END IF;
END$$ LANGUAGE plpgsql;

-- 3) Backfill existing rows with default value 'ASSESS'
UPDATE "Lock"
SET "scope" = 'ASSESS'
WHERE "scope" IS NULL;

-- 4) Set default and not-null on the new column
ALTER TABLE "Lock" ALTER COLUMN "scope" SET DEFAULT 'ASSESS';
ALTER TABLE "Lock" ALTER COLUMN "scope" SET NOT NULL;

-- 5) Update unique index to include scope
-- Drop old unique index if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'Lock_useCaseId_userId_type_key'
  ) THEN
    DROP INDEX "Lock_useCaseId_userId_type_key";
  END IF;
END$$ LANGUAGE plpgsql;

-- Create new unique index including scope, if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'Lock_useCaseId_userId_type_scope_key'
  ) THEN
    CREATE UNIQUE INDEX "Lock_useCaseId_userId_type_scope_key" ON "Lock"("useCaseId", "userId", "type", "scope");
  END IF;
END$$ LANGUAGE plpgsql;

-- 6) Optional: add an index on scope for faster queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'Lock_scope_idx'
  ) THEN
    CREATE INDEX "Lock_scope_idx" ON "Lock"("scope");
  END IF;
END$$ LANGUAGE plpgsql;

-- Migration complete

-- 7) Change UseCase.businessFunction from text[] to text without data loss
--    We will create a new column, backfill by joining array with ', ', then swap
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'UseCase' AND column_name = 'businessFunction'
      AND udt_name = '_text' -- text[] type
  ) THEN
    -- Add new column if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'UseCase' AND column_name = 'businessFunction_new'
    ) THEN
      ALTER TABLE "UseCase" ADD COLUMN "businessFunction_new" text;
    END IF;

    -- Backfill by joining array elements with ', '
    UPDATE "UseCase"
    SET "businessFunction_new" = CASE
      WHEN "businessFunction" IS NULL THEN NULL
      ELSE array_to_string("businessFunction", ', ')
    END
    WHERE "businessFunction_new" IS NULL;

    -- Drop indexes referencing old column if needed (optional; existing indexes on text[] won't block rename)

    -- Swap columns
    ALTER TABLE "UseCase" DROP COLUMN "businessFunction";
    ALTER TABLE "UseCase" RENAME COLUMN "businessFunction_new" TO "businessFunction";

  END IF;
END$$ LANGUAGE plpgsql;

-- Optionally re-add index on the new text column (outside DO to avoid nesting)
CREATE INDEX IF NOT EXISTS "UseCase_businessFunction_idx" ON "UseCase" USING gin (to_tsvector('simple', coalesce("businessFunction", '')));

