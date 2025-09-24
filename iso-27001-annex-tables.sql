-- ================================================
-- ISO 27001 ANNEX TABLES CREATION
-- Creates all database tables for ISO 27001 Annex structure
-- ================================================

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ISO 27001 ANNEX CATEGORY TABLE
-- ================================================

CREATE TABLE "Iso27001AnnexCategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "Iso27001AnnexCategory_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- ISO 27001 ANNEX ITEM TABLE
-- ================================================

CREATE TABLE "Iso27001AnnexItem" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Iso27001AnnexItem_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- ISO 27001 ANNEX INSTANCE TABLE
-- ================================================

CREATE TABLE "Iso27001AnnexInstance" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "evidenceFiles" TEXT[],
    "implementation" TEXT,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Iso27001AnnexInstance_pkey" PRIMARY KEY ("id")
);

-- ================================================
-- UNIQUE INDEXES
-- ================================================

-- Iso27001AnnexCategory unique indexes
CREATE UNIQUE INDEX "Iso27001AnnexCategory_categoryId_key" ON "Iso27001AnnexCategory"("categoryId");
CREATE UNIQUE INDEX "Iso27001AnnexCategory_pkey" ON "Iso27001AnnexCategory"("id");

-- Iso27001AnnexItem unique indexes
CREATE UNIQUE INDEX "Iso27001AnnexItem_itemId_key" ON "Iso27001AnnexItem"("itemId");
CREATE UNIQUE INDEX "Iso27001AnnexItem_pkey" ON "Iso27001AnnexItem"("id");

-- Iso27001AnnexInstance unique indexes
CREATE UNIQUE INDEX "Iso27001AnnexInstance_assessmentId_itemId_key" ON "Iso27001AnnexInstance"("assessmentId", "itemId");
CREATE UNIQUE INDEX "Iso27001AnnexInstance_pkey" ON "Iso27001AnnexInstance"("id");

-- ================================================
-- PERFORMANCE INDEXES
-- ================================================

-- Iso27001AnnexCategory performance indexes
CREATE INDEX "Iso27001AnnexCategory_orderIndex_idx" ON "Iso27001AnnexCategory"("orderIndex");

-- Iso27001AnnexItem performance indexes
CREATE INDEX "Iso27001AnnexItem_categoryId_orderIndex_idx" ON "Iso27001AnnexItem"("categoryId", "orderIndex");

-- Iso27001AnnexInstance performance indexes
CREATE INDEX "Iso27001AnnexInstance_assessmentId_idx" ON "Iso27001AnnexInstance"("assessmentId");

-- ================================================
-- FOREIGN KEY CONSTRAINTS
-- ================================================

-- Iso27001AnnexItem foreign key to Iso27001AnnexCategory
ALTER TABLE "Iso27001AnnexItem" ADD CONSTRAINT "Iso27001AnnexItem_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "Iso27001AnnexCategory"("categoryId") 
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- Iso27001AnnexInstance foreign key to Iso27001AnnexItem
ALTER TABLE "Iso27001AnnexInstance" ADD CONSTRAINT "Iso27001AnnexInstance_itemId_fkey" 
    FOREIGN KEY ("itemId") REFERENCES "Iso27001AnnexItem"("itemId") 
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- Iso27001AnnexInstance foreign key to Iso27001Assessment
ALTER TABLE "Iso27001AnnexInstance" ADD CONSTRAINT "Iso27001AnnexInstance_assessmentId_fkey" 
    FOREIGN KEY ("assessmentId") REFERENCES "Iso27001Assessment"("id") 
    ON UPDATE CASCADE ON DELETE CASCADE;
