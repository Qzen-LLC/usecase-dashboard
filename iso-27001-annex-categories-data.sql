-- ================================================
-- ISO 27001 ANNEX CATEGORIES DATA INSERTION
-- Inserts the 4 main ISO 27001 annex categories
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 27001 ANNEX CATEGORIES DATA (4 main categories)
-- ================================================

INSERT INTO "Iso27001AnnexCategory" ("id", "categoryId", "title", "description", "orderIndex") VALUES
(gen_random_uuid()::TEXT, 'A.5', 'Organizational controls', 'Establish organizational controls and governance frameworks for information security.', 1),
(gen_random_uuid()::TEXT, 'A.6', 'People controls', 'Implement controls related to human resources and personnel security.', 2),
(gen_random_uuid()::TEXT, 'A.7', 'Physical controls', 'Implement physical and environmental controls to protect information assets.', 3),
(gen_random_uuid()::TEXT, 'A.8', 'Technological controls', 'Implement technical controls and safeguards for information systems.', 4)
ON CONFLICT ("categoryId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";
