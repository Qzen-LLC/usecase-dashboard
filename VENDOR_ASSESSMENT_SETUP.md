# Vendor Assessment Setup Guide

## Database Setup with Prisma

The vendor assessment feature has been integrated with your existing database using Prisma. Follow these steps to set up the new tables:

### 1. Create Database Tables

Since you're using Supabase with connection pooling, you'll need to create the tables manually. I've provided a SQL file for this:

**Option A: Use Supabase SQL Editor (Recommended)**
1. Go to your Supabase dashboard: https://app.supabase.com/project/blfsawovozyywndoiicu
2. Navigate to "SQL Editor" 
3. Copy and paste the contents of `vendor_tables.sql`
4. Click "Run" to execute the SQL

**Option B: Try Direct Connection**
```bash
DATABASE_URL="postgresql://postgres.blfsawovozyywndoiicu:qzen_dudes@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" npx prisma db push
```

This will create the following tables in your existing database:
- `Vendor` - stores vendor information
- `AssessmentScore` - stores assessment criteria scores  
- `ApprovalArea` - stores approval workflow status

### 2. Verify Setup

After creating the tables, verify they exist:

```bash
npx prisma studio
```

This will open Prisma Studio where you can see the new tables.

### 3. Database Schema

The following tables were added:

#### Vendor Table
- Basic vendor information (name, category, contact details)
- Overall assessment score
- Current status (In Assessment, Approved, Rejected, On Hold)

#### AssessmentScore Table  
- Individual scores for each assessment category/subcategory
- Comments and notes for each criterion
- Linked to vendors via foreign key

#### ApprovalArea Table
- Approval workflow status for 4 areas: Procurement, Legal, Governance, Compliance
- Tracks approver information and approval dates
- Linked to vendors via foreign key

## Features

### Vendor Management
- Create, read, update, delete vendors
- Track vendor categories and contact information
- Assessment workflow management

### Assessment Criteria
- 12+ comprehensive assessment categories:
  - Strategic Alignment
  - Model and Technology Evaluation  
  - Data Governance & Security
  - Responsible AI & Ethics
  - Integration & Interoperability
  - Licensing, Pricing & SLAs
  - Maturity & Track Record
  - Regulatory & Legal Considerations
  - Operational Excellence & Support
  - Performance Monitoring & Observability
  - Business Continuity & Risk Management
  - Future-Proofing & Scalability

- Score each criterion from 0-5
- Add comments and notes
- Automatic overall score calculation

### Approval Workflow
- Four approval areas: Procurement, Legal, Governance, Compliance
- Track approval status and approver information
- Automatic vendor status updates based on approvals

### Dashboard Analytics
- Vendor statistics by category
- Approval status overview
- Performance metrics and insights

## Usage

1. Navigate to `/dashboard/vendor-assessment` in your application
2. Click "Add Vendor" to create a new vendor assessment
3. Fill in vendor details and assessment criteria
4. Save assessments and track progress through approval workflow
5. View dashboard for analytics and insights

## Integration

The vendor assessment uses your existing database and Prisma setup:
- No additional environment variables needed
- Uses the same DATABASE_URL from your .env file  
- Integrated with your existing database schema
- All vendor data is stored alongside your use case data

## Troubleshooting

### Migration Issues
If you encounter issues with `npx prisma db push`, try:
```bash
npx prisma migrate reset
npx prisma migrate dev --name add-vendor-assessment
```

### Prisma Client Issues
If you see import errors, regenerate the Prisma client:
```bash
npx prisma generate
```

### Database Connection
The vendor assessment uses the same database connection as your existing use case data, so no additional setup is needed.