-- CreateTable
CREATE TABLE "Assess" (
    "useCaseId" TEXT NOT NULL,
    "technicalFeasibility" JSONB NOT NULL,
    "businessFeasibility" JSONB NOT NULL,
    "ethicalImpact" JSONB NOT NULL,
    "riskAssessment" JSONB NOT NULL,
    "dataReadiness" JSONB NOT NULL,
    "budgetPlanning" JSONB NOT NULL,
    "roadmapPosition" JSONB NOT NULL,

    CONSTRAINT "Assess_pkey" PRIMARY KEY ("useCaseId")
);

-- AddForeignKey
ALTER TABLE "Assess" ADD CONSTRAINT "Assess_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
