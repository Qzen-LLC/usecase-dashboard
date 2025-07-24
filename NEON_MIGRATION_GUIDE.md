# Neon Database Migration Guide
## EU AI Act & ISO 42001 Framework Setup

This guide walks you through migrating your assessment frameworks from Supabase to Neon database.

## Prerequisites

1. ✅ Neon database set up and `DATABASE_URL` configured
2. ✅ Prisma schema includes all framework tables
3. ✅ Application environment variables configured

## Migration Steps

### 1. Database Schema Migration

First, ensure your database schema is up to date:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon database
npx prisma db push

# Alternative: Create and apply migrations
npx prisma migrate dev --name add-assessment-frameworks
```

### 2. Seed Framework Data

We've created comprehensive seed scripts to populate your framework tables:

#### Option A: Basic Framework Setup (Recommended for testing)
```bash
npm run seed-frameworks
```

This seeds:
- 14 EU AI Act Topics
- 19 EU AI Act Subtopics  
- 20 sample EU AI Act Questions
- 13 EU AI Act Control Categories
- 20 sample Control Structures
- 20 sample Subcontrol Structures
- 7 ISO 42001 Clauses
- 10 sample ISO 42001 Subclauses
- 7 ISO 42001 Annex Categories
- 15 sample Annex Items

#### Option B: Complete Framework Data (Production Ready)
```bash
npm run seed-complete-frameworks
```

This includes ALL framework data:
- 65+ EU AI Act Questions
- 76+ EU AI Act Control Structures
- 134+ EU AI Act Subcontrol Structures
- 24 ISO 42001 Subclauses  
- 37 ISO 42001 Annex Items

### 3. Verification

After seeding, verify the data was imported correctly:

```sql
-- Check EU AI Act framework
SELECT COUNT(*) as topic_count FROM "EuAiActTopic";
SELECT COUNT(*) as question_count FROM "EuAiActQuestion";
SELECT COUNT(*) as control_count FROM "EuAiActControlStruct";

-- Check ISO 42001 framework  
SELECT COUNT(*) as clause_count FROM "Iso42001Clause";
SELECT COUNT(*) as subclause_count FROM "Iso42001Subclause";
SELECT COUNT(*) as annex_item_count FROM "Iso42001AnnexItem";
```

Expected counts for complete data:
- EU AI Act Topics: 14
- EU AI Act Questions: 65+
- EU AI Act Controls: 76+
- EU AI Act Subcontrols: 134+
- ISO 42001 Clauses: 7
- ISO 42001 Subclauses: 24
- ISO 42001 Annex Items: 37

### 4. Test Assessment Flows

After migration, test key assessment functionality:

1. **EU AI Act Assessment Creation**
   - Create a new use case
   - Navigate to EU AI Act assessment
   - Verify questions load correctly
   - Test saving answers

2. **ISO 42001 Assessment Creation**  
   - Navigate to ISO 42001 assessment
   - Verify clauses and subclauses load
   - Test implementation tracking

3. **Control Assessments**
   - Test control assignment to assessments
   - Verify subcontrol functionality

## Troubleshooting

### Common Issues

1. **Prisma Client Out of Sync**
   ```bash
   npx prisma generate
   ```

2. **Database Connection Issues**
   - Verify `DATABASE_URL` in `.env`
   - Check Neon dashboard for connection string
   - Ensure database is not hibernated

3. **Foreign Key Constraint Errors**
   - Run seeding scripts in correct order
   - Verify parent records exist before child records

4. **Duplicate Key Errors**
   - Scripts use `upsert` to handle existing data
   - Check unique constraints in schema

### Performance Considerations

1. **Large Dataset Import**
   - Run complete seed during off-peak hours
   - Monitor Neon connection limits
   - Consider batch processing for large datasets

2. **Index Optimization**
   - Prisma schema includes optimized indexes
   - Monitor query performance post-migration

## Rollback Plan

If issues occur:

1. **Backup Current State**
   ```bash
   # Export current data (if needed)
   npx prisma db pull
   ```

2. **Clear Framework Tables**
   ```sql
   -- Clear in dependency order
   DELETE FROM "EuAiActAnswer";
   DELETE FROM "EuAiActSubcontrol";  
   DELETE FROM "EuAiActControl";
   DELETE FROM "EuAiActAssessment";
   DELETE FROM "EuAiActSubcontrolStruct";
   DELETE FROM "EuAiActControlStruct";
   DELETE FROM "EuAiActControlCategory";
   DELETE FROM "EuAiActQuestion";
   DELETE FROM "EuAiActSubtopic";
   DELETE FROM "EuAiActTopic";
   
   DELETE FROM "Iso42001AnnexInstance";
   DELETE FROM "Iso42001SubclauseInstance";
   DELETE FROM "Iso42001Assessment";
   DELETE FROM "Iso42001AnnexItem";
   DELETE FROM "Iso42001AnnexCategory";
   DELETE FROM "Iso42001Subclause";
   DELETE FROM "Iso42001Clause";
   ```

3. **Re-run Migration**
   - Fix issues
   - Re-run seeding scripts

## Post-Migration Testing

Create a comprehensive test checklist:

- [ ] Framework data loaded successfully  
- [ ] Use case creation works
- [ ] EU AI Act assessments function
- [ ] ISO 42001 assessments function
- [ ] Control assignments work
- [ ] Progress tracking accurate
- [ ] Assessment reports generate
- [ ] User permissions respected
- [ ] Performance acceptable

## Support

For migration issues:
1. Check Neon dashboard logs
2. Review Prisma query logs
3. Verify environment configuration
4. Test with minimal dataset first

---

**Next Steps**: After successful migration, consider implementing automated testing for assessment workflows to prevent regression issues.