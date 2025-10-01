-- ================================================
-- ISO 27001 CLAUSES DATA INSERTION
-- Inserts the 7 main ISO 27001 clauses (4-10)
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 27001 CLAUSES DATA (7 main clauses)
-- ================================================

INSERT INTO "Iso27001Clause" ("id", "clauseId", "title", "description", "orderIndex") VALUES
(gen_random_uuid()::TEXT, '4', 'Context of the Organization', 'Understand the organization''s context and establish the scope of the Information Security Management System.', 1),
(gen_random_uuid()::TEXT, '5', 'Leadership', 'Establish leadership commitment and organizational structure for information security management.', 2),
(gen_random_uuid()::TEXT, '6', 'Planning', 'Plan actions based on context, stakeholders, risks, and opportunities for information security.', 3),
(gen_random_uuid()::TEXT, '7', 'Support', 'Provide necessary resources, competence, awareness, communication, and documentation for the ISMS.', 4),
(gen_random_uuid()::TEXT, '8', 'Operation', 'Implement and control processes for information security management and risk treatment.', 5),
(gen_random_uuid()::TEXT, '9', 'Performance Evaluation', 'Monitor, measure, analyze, evaluate, audit, and review the ISMS performance.', 6),
(gen_random_uuid()::TEXT, '10', 'Improvement', 'Implement nonconformity management and continual improvement processes.', 7)
ON CONFLICT ("clauseId") DO UPDATE SET
"title" = EXCLUDED."title",
"description" = EXCLUDED."description",
"orderIndex" = EXCLUDED."orderIndex";
