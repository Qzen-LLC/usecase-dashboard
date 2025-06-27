-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,
    "governanceName" TEXT,
    "governanceStatus" TEXT,
    "governanceComment" TEXT,
    "riskName" TEXT,
    "riskStatus" TEXT,
    "riskComment" TEXT,
    "legalName" TEXT,
    "legalStatus" TEXT,
    "legalComment" TEXT,
    "businessFunction" TEXT,
    "businessName" TEXT,
    "businessStatus" TEXT,
    "businessComment" TEXT,
    "finalQualification" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
