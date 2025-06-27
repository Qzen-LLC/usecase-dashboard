/*
  Warnings:

  - You are about to drop the column `steps` on the `Assess` table. All the data in the column will be lost.
  - Added the required column `stepsData` to the `Assess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Assess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assess" DROP COLUMN "steps",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stepsData" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
