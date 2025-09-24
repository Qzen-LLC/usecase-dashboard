-- ================================================
-- ISO 27001 TABLES CREATION
-- Creates all database tables with proper constraints and indexes
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 27001 CLAUSE TABLE
-- ================================================

CREATE TABLE "Iso27001Clause" (
    "id" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "Iso27001Clause_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- ISO 27001 SUBCLAUSE TABLE
-- ================================================

CREATE TABLE "Iso27001Subclause" (
    "id" TEXT NOT NULL,
    "subclauseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "questions" TEXT[],
    "evidenceExamples" TEXT[],
    "orderIndex" INTEGER NOT NULL,
    "clauseId" TEXT NOT NULL,

    CONSTRAINT "Iso27001Subclause_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- ISO 27001 ASSESSMENT TABLE
-- ================================================

CREATE TABLE "Iso27001Assessment" (
    "id" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Iso27001Assessment_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- ISO 27001 SUBCLAUSE INSTANCE TABLE
-- ================================================

CREATE TABLE "Iso27001SubclauseInstance" (
    "id" TEXT NOT NULL,
    "implementation" TEXT,
    "evidenceFiles" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subclauseId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,

    CONSTRAINT "Iso27001SubclauseInstance_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- UNIQUE INDEXES
-- ================================================

-- Iso27001Clause unique indexes
CREATE UNIQUE INDEX "Iso27001Clause_clauseId_key" ON "Iso27001Clause"("clauseId");
CREATE UNIQUE INDEX "Iso27001Clause_pkey" ON "Iso27001Clause"("id");

-- Iso27001Subclause unique indexes
CREATE UNIQUE INDEX "Iso27001Subclause_subclauseId_key" ON "Iso27001Subclause"("subclauseId");
CREATE UNIQUE INDEX "Iso27001Subclause_pkey" ON "Iso27001Subclause"("id");

-- Iso27001Assessment unique indexes
CREATE UNIQUE INDEX "Iso27001Assessment_useCaseId_key" ON "Iso27001Assessment"("useCaseId");
CREATE UNIQUE INDEX "Iso27001Assessment_pkey" ON "Iso27001Assessment"("id");

-- Iso27001SubclauseInstance unique indexes
CREATE UNIQUE INDEX "Iso27001SubclauseInstance_subclauseId_assessmentId_key" ON "Iso27001SubclauseInstance"("subclauseId", "assessmentId");
CREATE UNIQUE INDEX "Iso27001SubclauseInstance_pkey" ON "Iso27001SubclauseInstance"("id");

-- ================================================
-- PERFORMANCE INDEXES
-- ================================================

-- Iso27001Clause performance indexes
CREATE INDEX "Iso27001Clause_orderIndex_idx" ON "Iso27001Clause"("orderIndex");

-- Iso27001Subclause performance indexes
CREATE INDEX "Iso27001Subclause_clauseId_orderIndex_idx" ON "Iso27001Subclause"("clauseId", "orderIndex");

-- Iso27001Assessment performance indexes
CREATE INDEX "Iso27001Assessment_status_idx" ON "Iso27001Assessment"("status");

-- Iso27001SubclauseInstance performance indexes
CREATE INDEX "Iso27001SubclauseInstance_assessmentId_idx" ON "Iso27001SubclauseInstance"("assessmentId");

-- ================================================
-- FOREIGN KEY CONSTRAINTS
-- ================================================

-- Iso27001Subclause foreign key to Iso27001Clause
ALTER TABLE "Iso27001Subclause" ADD CONSTRAINT "Iso27001Subclause_clauseId_fkey" 
    FOREIGN KEY ("clauseId") REFERENCES "Iso27001Clause"("clauseId") 
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- Iso27001Assessment foreign key to UseCase
ALTER TABLE "Iso27001Assessment" ADD CONSTRAINT "Iso27001Assessment_useCaseId_fkey" 
    FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") 
    ON UPDATE CASCADE ON DELETE CASCADE;

-- Iso27001SubclauseInstance foreign key to Iso27001Subclause
ALTER TABLE "Iso27001SubclauseInstance" ADD CONSTRAINT "Iso27001SubclauseInstance_subclauseId_fkey" 
    FOREIGN KEY ("subclauseId") REFERENCES "Iso27001Subclause"("subclauseId") 
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- Iso27001SubclauseInstance foreign key to Iso27001Assessment
ALTER TABLE "Iso27001SubclauseInstance" ADD CONSTRAINT "Iso27001SubclauseInstance_assessmentId_fkey" 
    FOREIGN KEY ("assessmentId") REFERENCES "Iso27001Assessment"("id") 
    ON UPDATE CASCADE ON DELETE CASCADE;
