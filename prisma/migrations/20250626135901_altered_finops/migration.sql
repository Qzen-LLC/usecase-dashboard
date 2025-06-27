/*
  Warnings:

  - The primary key for the `FinOps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `apiCost` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `cumCost` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `devCost` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `infraCost` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `monthYear` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyProfit` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `opCost` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `totalLifetimeValue` on the `FinOps` table. All the data in the column will be lost.
  - You are about to drop the column `valueGenerated` on the `FinOps` table. All the data in the column will be lost.
  - Added the required column `apiCostBase` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cumOpCost` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cumValue` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `devCostBase` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infraCostBase` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opCostBase` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalInvestment` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueBase` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueGrowthRate` to the `FinOps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinOps" DROP CONSTRAINT "FinOps_pkey",
DROP COLUMN "apiCost",
DROP COLUMN "cumCost",
DROP COLUMN "devCost",
DROP COLUMN "infraCost",
DROP COLUMN "monthYear",
DROP COLUMN "monthlyProfit",
DROP COLUMN "opCost",
DROP COLUMN "totalLifetimeValue",
DROP COLUMN "valueGenerated",
ADD COLUMN     "apiCostBase" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "cumOpCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "cumValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "devCostBase" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "infraCostBase" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "opCostBase" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalInvestment" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "valueBase" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "valueGrowthRate" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "FinOps_pkey" PRIMARY KEY ("useCaseId");
