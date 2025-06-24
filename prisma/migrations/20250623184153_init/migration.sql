-- CreateTable
CREATE TABLE "UseCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "proposedAISolution" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "desiredState" TEXT NOT NULL,
    "primaryStakeholders" TEXT[],
    "secondaryStakeholders" TEXT[],
    "successCriteria" TEXT[],
    "problemValidation" TEXT NOT NULL,
    "solutionHypothesis" TEXT NOT NULL,
    "keyAssumptions" TEXT[],
    "initialROI" TEXT NOT NULL,
    "confidenceLevel" INTEGER NOT NULL,
    "operationalImpactScore" INTEGER NOT NULL,
    "productivityImpactScore" INTEGER NOT NULL,
    "revenueImpactScore" INTEGER NOT NULL,
    "implementationComplexity" INTEGER NOT NULL,
    "estimatedTimeline" TEXT NOT NULL,
    "requiredResources" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UseCase_pkey" PRIMARY KEY ("id")
);
