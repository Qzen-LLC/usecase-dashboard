# UseCase Dashboard - GCP Cloud Run Deployment Guide

This guide provides comprehensive instructions for deploying the UseCase Dashboard application to Google Cloud Platform using Cloud Run, Neon DB (PostgreSQL), and Upstash Redis.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Upstash Redis Setup](#upstash-redis-setup)
- [Neon Database Configuration](#neon-database-configuration)
- [GCP Project Setup](#gcp-project-setup)
- [Application Configuration](#application-configuration)
- [Manual Deployment](#manual-deployment)
- [CI/CD Pipeline Setup](#cicd-pipeline-setup)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)

## Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Cloud Run     │────▶│  Upstash     │     │    Neon DB      │
│   (Next.js)     │     │   Redis      │     │  (PostgreSQL)   │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                                              │
        └──────────────────────────────────────────────┘
                    │
            ┌───────────────┐
            │ Cloud Storage │
            │  (Uploads)    │
            └───────────────┘
```

## Prerequisites

1. **Google Cloud Account**
   - Create account at [console.cloud.google.com](https://console.cloud.google.com)
   - Enable billing (new accounts get $300 free credits)

2. **Local Development Tools**
   ```bash
   # Install Google Cloud CLI
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   
   # Install Docker Desktop
   # Download from: https://www.docker.com/products/docker-desktop
   ```

3. **External Services**
   - Neon DB account: [neon.tech](https://neon.tech)
   - Upstash account: [upstash.com](https://upstash.com)
   - Clerk account: [clerk.com](https://clerk.com)

## Environment Setup

### 1. Create Environment Files

Create `.env.production` file:

```bash
# Database (Neon)
DATABASE_URL="postgresql://[user]:[password]@[project]-pooler.us-east-1.aws.neon.tech/[database]?sslmode=require&pgbouncer=true"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://[your-instance].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[your-token]"

# For ioredis compatibility (optional)
REDIS_URL="rediss://default:[password]@[your-instance].upstash.io:6379"

# Clerk Authentication
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Webhooks
WEBHOOK_SECRET="whsec_..."

# Application
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"

# GCP Specific
GCP_PROJECT_ID="your-project-id"
GCP_STORAGE_BUCKET="your-bucket-name"
```

## Upstash Redis Setup

### 1. Create Upstash Database

1. Sign up at [console.upstash.com](https://console.upstash.com)
2. Click "Create Database"
3. Configure:
   - **Name**: `usecase-dashboard-prod`
   - **Type**: Regional
   - **Region**: Select closest to your GCP region
   - **Enable**: Eviction, TLS/SSL

### 2. Get Connection Details

From Upstash console, copy:
- REST URL
- REST Token
- Redis URL (for ioredis compatibility)

### 3. Update Redis Configuration

Update `/src/lib/redis.ts`:

```typescript
import Redis from 'ioredis';

// Support both Upstash and local Redis
const getRedisUrl = () => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.NODE_ENV === 'production') {
    // Use Upstash Redis URL format for production
    return process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  }
  return process.env.REDIS_URL || 'redis://localhost:6379';
};

const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

// Add connection error handling
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
```

## Neon Database Configuration

### 1. Database Setup

1. Ensure your Neon database is created
2. Get the **pooled connection string** (includes `-pooler` in hostname)
3. Enable connection pooling in Neon dashboard

### 2. Prisma Configuration

Ensure your `prisma/schema.prisma` uses proper settings:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add for better serverless performance
  directUrl = env("DIRECT_DATABASE_URL")
}
```

### 3. Migration Strategy

For production deployments:

```bash
# Generate Prisma client
npx prisma generate

# Create migration files (development)
npx prisma migrate dev

# Apply migrations in production
npx prisma migrate deploy
```

## GCP Project Setup

### 1. Create GCP Project

```bash
# Set project name
export PROJECT_ID="usecase-dashboard-prod"

# Create project
gcloud projects create $PROJECT_ID --name="UseCase Dashboard"

# Set as active project
gcloud config set project $PROJECT_ID

# Enable billing
gcloud beta billing accounts list
gcloud beta billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2. Enable Required APIs

```bash
# Enable necessary APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
```

### 3. Create Storage Bucket

```bash
# Create bucket for file uploads
export BUCKET_NAME="${PROJECT_ID}-uploads"
gsutil mb -p $PROJECT_ID -c standard -l us-central1 gs://$BUCKET_NAME/

# Set CORS policy
echo '[{"origin": ["*"], "method": ["GET", "POST", "PUT", "DELETE"], "maxAgeSeconds": 3600}]' > cors.json
gsutil cors set cors.json gs://$BUCKET_NAME/
rm cors.json
```

### 4. Setup Artifact Registry

```bash
# Create repository for Docker images
gcloud artifacts repositories create docker-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for UseCase Dashboard"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## Application Configuration

### 1. Update File Upload Logic

Create `/src/lib/gcs-upload.ts` for Google Cloud Storage:

```typescript
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET!);

export async function uploadToGCS(file: Buffer, filename: string, mimetype: string): Promise<string> {
  const uniqueFilename = `${uuidv4()}-${filename}`;
  const blob = bucket.file(`evidence/${uniqueFilename}`);
  
  await blob.save(file, {
    metadata: {
      contentType: mimetype,
    },
  });
  
  // Make file publicly accessible
  await blob.makePublic();
  
  return `https://storage.googleapis.com/${process.env.GCP_STORAGE_BUCKET}/evidence/${uniqueFilename}`;
}
```

### 2. Add Health Check Endpoint

Create `/src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/utils/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    await redis.ping();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

## Manual Deployment

### 1. Build and Push Docker Image

```bash
# Set variables
export PROJECT_ID="your-project-id"
export IMAGE_NAME="usecase-dashboard"
export REGION="us-central1"

# Build image
docker build -t $IMAGE_NAME .

# Tag for Artifact Registry
docker tag $IMAGE_NAME \
  $REGION-docker.pkg.dev/$PROJECT_ID/docker-repo/$IMAGE_NAME:latest

# Push to registry
docker push $REGION-docker.pkg.dev/$PROJECT_ID/docker-repo/$IMAGE_NAME:latest
```

### 2. Deploy to Cloud Run

```bash
# Deploy service
gcloud run deploy usecase-dashboard \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/docker-repo/$IMAGE_NAME:latest \
  --region=$REGION \
  --platform=managed \
  --port=3000 \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=100 \
  --memory=1Gi \
  --cpu=1 \
  --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
  --set-secrets="DATABASE_URL=database-url:latest,CLERK_SECRET_KEY=clerk-secret-key:latest,UPSTASH_REDIS_REST_URL=upstash-redis-url:latest,UPSTASH_REDIS_REST_TOKEN=upstash-redis-token:latest,WEBHOOK_SECRET=webhook-secret:latest"
```

### 3. Configure Secrets

```bash
# Create secrets in Secret Manager
echo -n "your-database-url" | gcloud secrets create database-url --data-file=-
echo -n "your-clerk-key" | gcloud secrets create clerk-secret-key --data-file=-
echo -n "your-upstash-url" | gcloud secrets create upstash-redis-url --data-file=-
echo -n "your-upstash-token" | gcloud secrets create upstash-redis-token --data-file=-
echo -n "your-webhook-secret" | gcloud secrets create webhook-secret --data-file=-
```

## CI/CD Pipeline Setup

### 1. Create Cloud Build Configuration

Create `cloudbuild.yaml`:

```yaml
steps:
  # Install dependencies
  - name: 'gcr.io/cloud-builders/npm'
    args: ['ci']

  # Generate Prisma client
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'prisma', 'generate']

  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/docker-repo/${_SERVICE_NAME}:$COMMIT_SHA'
      - '-t'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/docker-repo/${_SERVICE_NAME}:latest'
      - '.'

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - '--all-tags'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/docker-repo/${_SERVICE_NAME}'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '${_SERVICE_NAME}'
      - '--image'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/docker-repo/${_SERVICE_NAME}:$COMMIT_SHA'
      - '--region'
      - '${_REGION}'
      - '--platform'
      - 'managed'

substitutions:
  _SERVICE_NAME: usecase-dashboard
  _REGION: us-central1

options:
  logging: CLOUD_LOGGING_ONLY
```

### 2. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE: usecase-dashboard
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - id: 'auth'
        uses: 'google-github-actions/auth@v2'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v2'

      - name: 'Configure Docker'
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: 'Build and Push'
        run: |
          docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/docker-repo/${{ env.SERVICE }}:${{ github.sha }} .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/docker-repo/${{ env.SERVICE }}:${{ github.sha }}

      - name: 'Deploy to Cloud Run'
        run: |
          gcloud run deploy ${{ env.SERVICE }} \
            --image ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/docker-repo/${{ env.SERVICE }}:${{ github.sha }} \
            --region ${{ env.REGION }} \
            --platform managed
```

## Production Checklist

### Security
- [ ] All secrets stored in Secret Manager
- [ ] HTTPS enforced on Cloud Run
- [ ] CORS properly configured
- [ ] Environment variables validated
- [ ] Database connection uses SSL
- [ ] Redis connection uses TLS

### Performance
- [ ] Docker image optimized (<500MB)
- [ ] Next.js standalone output enabled
- [ ] Database queries optimized with indexes
- [ ] Redis caching implemented
- [ ] Static assets served from CDN
- [ ] Connection pooling enabled (Neon)

### Monitoring
- [ ] Cloud Logging enabled
- [ ] Error reporting configured
- [ ] Uptime monitoring active
- [ ] Performance metrics tracked
- [ ] Budget alerts configured

### Backup & Recovery
- [ ] Database backups configured (Neon)
- [ ] File upload backups (Cloud Storage)
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

## Monitoring & Maintenance

### 1. Setup Monitoring

```bash
# Create uptime check
gcloud monitoring uptime-checks create https \
  --display-name="UseCase Dashboard Health" \
  --uri="https://your-service-url.run.app/api/health" \
  --check-interval=5m
```

### 2. View Logs

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=usecase-dashboard" --limit 50

# Stream logs
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=usecase-dashboard"
```

### 3. Database Maintenance

- Neon handles automatic backups
- Monitor slow queries in Neon dashboard
- Use `npx prisma studio` for data inspection

### 4. Redis Monitoring

- Check Upstash dashboard for:
  - Command statistics
  - Memory usage
  - Hit/miss ratios
  - Latency metrics

## Troubleshooting

### Common Issues

#### 1. Cold Start Timeouts
**Problem**: Application times out on first request
**Solution**: 
- Increase Cloud Run timeout: `--timeout=300`
- Set minimum instances: `--min-instances=1`
- Optimize Dockerfile for faster starts

#### 2. Database Connection Errors
**Problem**: "too many connections" or timeout errors
**Solution**:
- Ensure using pooled connection string
- Add connection retry logic
- Check Neon connection limits

#### 3. Redis Connection Issues
**Problem**: Redis connection failures
**Solution**:
- Verify Upstash credentials
- Check TLS/SSL settings
- Implement retry logic

#### 4. File Upload Failures
**Problem**: Upload to Cloud Storage fails
**Solution**:
- Check bucket permissions
- Verify service account roles
- Ensure CORS configured

### Debug Commands

```bash
# Check service status
gcloud run services describe usecase-dashboard --region=us-central1

# View recent errors
gcloud logging read "severity=ERROR AND resource.type=cloud_run_revision" --limit 20

# Test health endpoint
curl https://your-service-url.run.app/api/health

# Check environment variables
gcloud run services describe usecase-dashboard --format="value(spec.template.spec.containers[0].env[].name)"
```

## Cost Optimization

### Estimated Monthly Costs

| Service | Free Tier | Typical Usage | Est. Cost |
|---------|-----------|---------------|-----------|
| Cloud Run | 2M requests | 50K requests | $0 |
| Neon DB | 0.5GB | 2GB database | $19 |
| Upstash | 500K commands | 1M commands | $2 |
| Cloud Storage | 5GB | 10GB uploads | $2 |
| **Total** | | | **~$23/mo** |

### Cost Saving Tips

1. **Cloud Run**
   - Set `--min-instances=0` for scale-to-zero
   - Use `--max-instances` to cap costs
   - Enable CPU throttling: `--no-cpu-throttling=false`

2. **Database**
   - Use Neon's scale-to-zero feature
   - Implement query result caching
   - Optimize indexes and queries

3. **Redis**
   - Use Upstash pay-per-request model
   - Implement cache expiration policies
   - Monitor usage in Upstash dashboard

4. **Storage**
   - Set lifecycle rules for old uploads
   - Compress images before storage
   - Use appropriate storage classes

### Monitoring Costs

```bash
# Set up billing alerts
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="UseCase Dashboard Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50,basis=current-spend \
  --threshold-rule=percent=90,basis=current-spend \
  --threshold-rule=percent=100,basis=current-spend
```

## Next Steps

1. **Custom Domain**: Configure custom domain with Cloud Run
2. **CDN Setup**: Add Cloud CDN for static assets
3. **Multi-Region**: Deploy to multiple regions for global users
4. **Advanced Monitoring**: Set up custom dashboards and alerts
5. **Performance Testing**: Run load tests to optimize scaling

---

For additional support, refer to:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Upstash Documentation](https://docs.upstash.com)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)