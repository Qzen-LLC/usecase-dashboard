/*
  Warnings:

  - Added the required column `businessFunction` to the `UseCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UseCase" ADD COLUMN     "businessFunction" TEXT NOT NULL;
