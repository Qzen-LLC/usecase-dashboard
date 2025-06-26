/*
  Warnings:

  - Added the required column `ROI` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyProfit` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netValue` to the `FinOps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLifetimeValue` to the `FinOps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinOps" ADD COLUMN     "ROI" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "monthlyProfit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "netValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalLifetimeValue" DOUBLE PRECISION NOT NULL;
