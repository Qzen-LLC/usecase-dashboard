-- Create vendor status enum
CREATE TYPE "VendorStatus" AS ENUM ('IN_ASSESSMENT', 'APPROVED', 'REJECTED', 'ON_HOLD');

-- Create approval area type enum  
CREATE TYPE "ApprovalAreaType" AS ENUM ('PROCUREMENT', 'LEGAL', 'GOVERNANCE', 'COMPLIANCE');

-- Create approval status enum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create Vendor table
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "website" TEXT,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "assessmentDate" TIMESTAMP(3),
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "VendorStatus" NOT NULL DEFAULT 'IN_ASSESSMENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- Create AssessmentScore table
CREATE TABLE "AssessmentScore" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "score" SMALLINT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY ("id")
);

-- Create ApprovalArea table
CREATE TABLE "ApprovalArea" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "area" "ApprovalAreaType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalArea_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "AssessmentScore_vendorId_category_subcategory_key" ON "AssessmentScore"("vendorId", "category", "subcategory");
CREATE UNIQUE INDEX "ApprovalArea_vendorId_area_key" ON "ApprovalArea"("vendorId", "area");

-- Add foreign key constraints
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalArea" ADD CONSTRAINT "ApprovalArea_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;