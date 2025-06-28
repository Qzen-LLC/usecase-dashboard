/*
  Warnings:

  - A unique constraint covering the columns `[useCaseId]` on the table `Approval` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Approval_useCaseId_key" ON "Approval"("useCaseId");
