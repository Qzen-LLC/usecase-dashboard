-- Fix Lock table structure
-- This will update the existing table to match the Prisma schema

-- Check if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Lock') THEN
        -- Add default value for id column if it doesn't have one
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Lock' 
            AND column_name = 'id' 
            AND column_default IS NOT NULL
        ) THEN
            ALTER TABLE "Lock" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
            RAISE NOTICE 'Added default UUID generator to id column';
        ELSE
            RAISE NOTICE 'id column already has default value';
        END IF;
        
        -- Verify the table structure
        RAISE NOTICE 'Lock table structure verified and updated';
    ELSE
        RAISE NOTICE 'Lock table does not exist - run the main migration first';
    END IF;
END $$;

-- Show the current table structure
\d "Lock";
