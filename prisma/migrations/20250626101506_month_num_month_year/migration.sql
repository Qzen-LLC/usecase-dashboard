/*
  Warnings:

  - The primary key for the `FinOps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `monthNum` on the `FinOps` table. All the data in the column will be lost.
  - Added the required column `monthYear` to the `FinOps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinOps" DROP CONSTRAINT "FinOps_pkey",
DROP COLUMN "monthNum",
ADD COLUMN     "monthYear" TEXT NOT NULL,
ADD CONSTRAINT "FinOps_pkey" PRIMARY KEY ("monthYear", "useCaseId");
