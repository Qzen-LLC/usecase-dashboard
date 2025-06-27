/*
  Warnings:

  - You are about to drop the column `budgetPlanning` on the `Assess` table. All the data in the column will be lost.
  - You are about to drop the column `businessFeasibility` on the `Assess` table. All the data in the column will be lost.
  - You are about to drop the column `dataReadiness` on the `Assess` table. All the data in the column will be lost.
  - You are about to drop the column `ethicalImpact` on the `Assess` table. All the data in the column will be lost.
  - You are about to drop the column `riskAssessment` on the `Assess` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapPosition` on the `Assess` table. All the data in the column will be lost.
  - You are about to drop the column `technicalFeasibility` on the `Assess` table. All the data in the column will be lost.
  - Added the required column `steps` to the `Assess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assess" DROP COLUMN "budgetPlanning",
DROP COLUMN "businessFeasibility",
DROP COLUMN "dataReadiness",
DROP COLUMN "ethicalImpact",
DROP COLUMN "riskAssessment",
DROP COLUMN "roadmapPosition",
DROP COLUMN "technicalFeasibility",
ADD COLUMN     "steps" JSONB NOT NULL;
