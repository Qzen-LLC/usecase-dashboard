-- CreateTable
CREATE TABLE "FinOps" (
    "monthNum" INTEGER NOT NULL,
    "useCaseId" TEXT NOT NULL,
    "devCost" DOUBLE PRECISION NOT NULL,
    "infraCost" DOUBLE PRECISION NOT NULL,
    "apiCost" DOUBLE PRECISION NOT NULL,
    "opCost" DOUBLE PRECISION NOT NULL,
    "cumCost" DOUBLE PRECISION NOT NULL,
    "valueGenerated" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FinOps_pkey" PRIMARY KEY ("monthNum","useCaseId")
);

-- AddForeignKey
ALTER TABLE "FinOps" ADD CONSTRAINT "FinOps_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
