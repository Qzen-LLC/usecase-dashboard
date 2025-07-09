-- ================================================
-- SUPABASE SQL SETUP FOR EU AI ACT & ISO 42001 FRAMEWORKS
-- ================================================

-- Add relationships to existing UseCase table
ALTER TABLE "UseCase" 
ADD COLUMN IF NOT EXISTS "euAiActAssessments" TEXT[],
ADD COLUMN IF NOT EXISTS "iso42001Assessments" TEXT[];

-- ================================================
-- EU AI ACT FRAMEWORK TABLES
-- ================================================

-- EU AI ACT Topics (14 main topics)
CREATE TABLE IF NOT EXISTS "EuAiActTopic" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "topicId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "EuAiActTopic_orderIndex_idx" ON "EuAiActTopic"("orderIndex");

-- EU AI ACT Subtopics (19 subtopics within topics)
CREATE TABLE IF NOT EXISTS "EuAiActSubtopic" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "subtopicId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "topicId" TEXT NOT NULL REFERENCES "EuAiActTopic"("topicId")
);

CREATE INDEX IF NOT EXISTS "EuAiActSubtopic_topicId_orderIndex_idx" ON "EuAiActSubtopic"("topicId", "orderIndex");

-- EU AI ACT Questions (65+ questions with metadata)
CREATE TABLE IF NOT EXISTS "EuAiActQuestion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "questionId" TEXT UNIQUE NOT NULL,
  "question" TEXT NOT NULL,
  "priority" TEXT NOT NULL, -- High, Medium, Low
  "answerType" TEXT NOT NULL, -- Long text, Short text, etc.
  "orderIndex" INTEGER NOT NULL,
  "subtopicId" TEXT NOT NULL REFERENCES "EuAiActSubtopic"("subtopicId")
);

CREATE INDEX IF NOT EXISTS "EuAiActQuestion_subtopicId_orderIndex_idx" ON "EuAiActQuestion"("subtopicId", "orderIndex");

-- EU AI ACT Assessments (per use case)
CREATE TABLE IF NOT EXISTS "EuAiActAssessment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "useCaseId" TEXT UNIQUE NOT NULL REFERENCES "UseCase"("id"),
  "status" TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, reviewed
  "progress" DOUBLE PRECISION NOT NULL DEFAULT 0, -- 0-100
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "EuAiActAssessment_status_idx" ON "EuAiActAssessment"("status");

-- EU AI ACT Answers (user answers with evidence files)
CREATE TABLE IF NOT EXISTS "EuAiActAnswer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "answer" TEXT,
  "evidenceFiles" TEXT[], -- Array of file paths/URLs
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, completed, reviewed
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "questionId" TEXT NOT NULL REFERENCES "EuAiActQuestion"("questionId"),
  "assessmentId" TEXT NOT NULL REFERENCES "EuAiActAssessment"("id"),
  UNIQUE("questionId", "assessmentId")
);

CREATE INDEX IF NOT EXISTS "EuAiActAnswer_assessmentId_idx" ON "EuAiActAnswer"("assessmentId");

-- EU AI ACT Control Categories (13 control categories)
CREATE TABLE IF NOT EXISTS "EuAiActControlCategory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "categoryId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "EuAiActControlCategory_orderIndex_idx" ON "EuAiActControlCategory"("orderIndex");

-- EU AI ACT Control Structures (76+ controls)
CREATE TABLE IF NOT EXISTS "EuAiActControlStruct" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "controlId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "categoryId" TEXT NOT NULL REFERENCES "EuAiActControlCategory"("categoryId")
);

CREATE INDEX IF NOT EXISTS "EuAiActControlStruct_categoryId_orderIndex_idx" ON "EuAiActControlStruct"("categoryId", "orderIndex");

-- EU AI ACT Subcontrol Structures (134+ subcontrols)
CREATE TABLE IF NOT EXISTS "EuAiActSubcontrolStruct" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "subcontrolId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "controlId" TEXT NOT NULL REFERENCES "EuAiActControlStruct"("controlId")
);

CREATE INDEX IF NOT EXISTS "EuAiActSubcontrolStruct_controlId_orderIndex_idx" ON "EuAiActSubcontrolStruct"("controlId", "orderIndex");

-- EU AI ACT Control Instances (per assessment)
CREATE TABLE IF NOT EXISTS "EuAiActControl" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, implemented, reviewed
  "notes" TEXT,
  "evidenceFiles" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "controlId" TEXT NOT NULL REFERENCES "EuAiActControlStruct"("controlId"),
  "assessmentId" TEXT NOT NULL REFERENCES "EuAiActAssessment"("id"),
  UNIQUE("controlId", "assessmentId")
);

CREATE INDEX IF NOT EXISTS "EuAiActControl_assessmentId_idx" ON "EuAiActControl"("assessmentId");

-- EU AI ACT Subcontrol Instances (per control)
CREATE TABLE IF NOT EXISTS "EuAiActSubcontrol" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, implemented, reviewed
  "notes" TEXT,
  "evidenceFiles" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "subcontrolId" TEXT NOT NULL REFERENCES "EuAiActSubcontrolStruct"("subcontrolId"),
  "controlId" TEXT NOT NULL REFERENCES "EuAiActControl"("id"),
  UNIQUE("subcontrolId", "controlId")
);

CREATE INDEX IF NOT EXISTS "EuAiActSubcontrol_controlId_idx" ON "EuAiActSubcontrol"("controlId");

-- ================================================
-- ISO 42001 FRAMEWORK TABLES
-- ================================================

-- ISO 42001 Clauses (7 main clauses)
CREATE TABLE IF NOT EXISTS "Iso42001Clause" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "clauseId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "Iso42001Clause_orderIndex_idx" ON "Iso42001Clause"("orderIndex");

-- ISO 42001 Subclauses (24 subclauses)
CREATE TABLE IF NOT EXISTS "Iso42001Subclause" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "subclauseId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "questions" TEXT[],
  "evidenceExamples" TEXT[],
  "orderIndex" INTEGER NOT NULL,
  "clauseId" TEXT NOT NULL REFERENCES "Iso42001Clause"("clauseId")
);

CREATE INDEX IF NOT EXISTS "Iso42001Subclause_clauseId_orderIndex_idx" ON "Iso42001Subclause"("clauseId", "orderIndex");

-- ISO 42001 Assessments (per use case)
CREATE TABLE IF NOT EXISTS "Iso42001Assessment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "useCaseId" TEXT UNIQUE NOT NULL REFERENCES "UseCase"("id"),
  "status" TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, reviewed
  "progress" DOUBLE PRECISION NOT NULL DEFAULT 0, -- 0-100
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Iso42001Assessment_status_idx" ON "Iso42001Assessment"("status");

-- ISO 42001 Subclause Instances (user implementations)
CREATE TABLE IF NOT EXISTS "Iso42001SubclauseInstance" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "implementation" TEXT,
  "evidenceFiles" TEXT[],
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, implemented, reviewed
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "subclauseId" TEXT NOT NULL REFERENCES "Iso42001Subclause"("subclauseId"),
  "assessmentId" TEXT NOT NULL REFERENCES "Iso42001Assessment"("id"),
  UNIQUE("subclauseId", "assessmentId")
);

CREATE INDEX IF NOT EXISTS "Iso42001SubclauseInstance_assessmentId_idx" ON "Iso42001SubclauseInstance"("assessmentId");

-- ISO 42001 Annex Categories (7 annex categories)
CREATE TABLE IF NOT EXISTS "Iso42001AnnexCategory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "categoryId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "Iso42001AnnexCategory_orderIndex_idx" ON "Iso42001AnnexCategory"("orderIndex");

-- ISO 42001 Annex Items (37 annex items)
CREATE TABLE IF NOT EXISTS "Iso42001AnnexItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "itemId" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "guidance" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "categoryId" TEXT NOT NULL REFERENCES "Iso42001AnnexCategory"("categoryId")
);

CREATE INDEX IF NOT EXISTS "Iso42001AnnexItem_categoryId_orderIndex_idx" ON "Iso42001AnnexItem"("categoryId", "orderIndex");

-- ISO 42001 Annex Instances (user implementations)
CREATE TABLE IF NOT EXISTS "Iso42001AnnexInstance" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "implementation" TEXT,
  "evidenceFiles" TEXT[],
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, implemented, reviewed
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "itemId" TEXT NOT NULL REFERENCES "Iso42001AnnexItem"("itemId"),
  "assessmentId" TEXT NOT NULL REFERENCES "Iso42001Assessment"("id"),
  UNIQUE("itemId", "assessmentId")
);

CREATE INDEX IF NOT EXISTS "Iso42001AnnexInstance_assessmentId_idx" ON "Iso42001AnnexInstance"("assessmentId");