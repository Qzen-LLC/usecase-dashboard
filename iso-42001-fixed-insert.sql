-- ================================================
-- FIXED ISO 42001 DATA INSERTION WITH EXPLICIT IDs
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 42001 CLAUSES DATA (7 main clauses)
-- ================================================

INSERT INTO "Iso42001Clause" ("id", "clauseId", "title", "description", "orderIndex") VALUES
(gen_random_uuid()::TEXT, '4', 'Context of the Organization', 'Understand the organization''s context and establish the scope of the AI Management System.', 1),
(gen_random_uuid()::TEXT, '5', 'Leadership', 'Establish leadership commitment and organizational structure for AI management.', 2),
(gen_random_uuid()::TEXT, '6', 'Planning', 'Plan actions based on context, stakeholders, risks, and opportunities for AI systems.', 3),
(gen_random_uuid()::TEXT, '7', 'Support', 'Provide necessary resources, competence, awareness, communication, and documentation for the AIMS.', 4),
(gen_random_uuid()::TEXT, '8', 'Operation', 'Implement and control processes for AI system lifecycle management and risk treatment.', 5),
(gen_random_uuid()::TEXT, '9', 'Performance Evaluation', 'Monitor, measure, analyze, evaluate, audit, and review the AIMS performance.', 6),
(gen_random_uuid()::TEXT, '10', 'Improvement', 'Implement nonconformity management and continual improvement processes.', 7)
ON CONFLICT ("clauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";