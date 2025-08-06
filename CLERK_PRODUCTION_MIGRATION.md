# Clerk Production Migration Guide

This guide covers all the changes required when moving from Clerk development to production environment.

## 🔄 Migration Checklist

### 1. Environment Variables

**Before (Development):**
```bash
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_test_...
```

**After (Production):**
```bash
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_live_...
```

### 2. Custom Domain Configuration (qube.qzen.ai)

#### A. DNS Records Setup
Add these **CNAME records** to your DNS provider:

**Record 1: Frontend API**
- **Name:** `clerk.qube`
- **Value:** `frontend-api.clerk.services`
- **Type:** CNAME

**Record 2: Account Portal**
- **Name:** `accounts.qube`
- **Value:** `accounts.clerk.services`
- **Type:** CNAME

#### B. Environment Variables for Custom Domain
```bash
# Custom domain configuration
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.qube.qzen.ai
NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL=accounts.qube.qzen.ai
NEXT_PUBLIC_APP_URL=https://qube.qzen.ai
```

#### C. Verify DNS Configuration
1. Go to Clerk Dashboard → Configure → DNS Configuration
2. Click "Verify configuration" button
3. Wait for DNS propagation (can take up to 24 hours)
4. Status should change from "Unverified" to "Verified"

### 3. Clerk Dashboard Configuration

#### A. Domain Settings
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your project
3. Go to **Settings > Domains**
4. **Remove these development domains:**
   - `localhost:3000`
   - `localhost:3002`
   - `127.0.0.1:3000`
   - `127.0.0.1:3002`
5. **Add your production domains:**
   - `https://qube.qzen.ai` (your custom domain)
   - `https://your-app.run.app` (Cloud Run URL as backup)

#### B. Webhook Configuration
1. Go to **Webhooks** in Clerk Dashboard
2. **Update webhook endpoint URL:**
   - From: `https://localhost:3000/api/webhook/clerk`
   - To: `https://qube.qzen.ai/api/webhook/clerk`
3. **Get new webhook secret** for production
4. **Update environment variable:**
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_production_secret_here
   ```

#### C. Email Templates
1. Go to **Email Templates** in Clerk Dashboard
2. **Update sender email** to your production domain
3. **Customize email templates** for production branding
4. **Test email delivery** with production settings

### 4. Code Changes

#### A. Environment Configuration
Update your environment files:

**`.env.production`:**
```bash
# Clerk Production Keys
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_live_...

# Custom Domain URLs
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.qube.qzen.ai
NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL=accounts.qube.qzen.ai
NEXT_PUBLIC_APP_URL=https://qube.qzen.ai

# Production URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

#### B. Webhook Endpoint
Ensure your webhook endpoint handles production events:

```typescript
// src/app/api/webhook/clerk/route.ts
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // Production webhook verification
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // ... rest of webhook logic
}
```

### 5. Deployment Configuration

#### A. Cloud Build Environment Variables
Update `cloudbuild.yaml`:

```yaml
- '--set-secrets'
- 'DATABASE_URL=database-url:latest,CLERK_SECRET_KEY=clerk-secret-key:latest,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk-publishable-key:latest,UPSTASH_REDIS_REST_URL=upstash-redis-url:latest,UPSTASH_REDIS_REST_TOKEN=upstash-redis-token:latest,REDIS_URL=redis-url:latest,WEBHOOK_SECRET=webhook-secret:latest'
```

#### B. Google Cloud Secret Manager
Create production secrets:

```bash
# Create production secrets
echo -n "sk_live_your_production_secret_key" | gcloud secrets create clerk-secret-key --data-file=-
echo -n "pk_live_your_production_publishable_key" | gcloud secrets create clerk-publishable-key --data-file=-
echo -n "whsec_your_production_webhook_secret" | gcloud secrets create webhook-secret --data-file=-
```

### 6. Testing Production Setup

#### A. Verify Environment Variables
```bash
# Test Clerk API access
curl -X GET "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY"
```

#### B. Test Webhook Endpoint
```bash
# Test webhook endpoint
curl -X POST "https://qube.qzen.ai/api/webhook/clerk" \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{}}'
```

#### C. Test Authentication Flow
1. Visit your production URL: `https://qube.qzen.ai`
2. Test sign-in/sign-up flow
3. Verify redirects work correctly
4. Check user creation in database

### 7. Security Considerations

#### A. HTTPS Enforcement
- Ensure all production URLs use HTTPS
- Update any hardcoded HTTP URLs to HTTPS

#### B. CORS Configuration
- Update CORS settings for production domains
- Remove localhost from allowed origins

#### C. Environment Variable Security
- Never commit production keys to version control
- Use Google Cloud Secret Manager for production secrets
- Rotate keys regularly

### 8. Monitoring & Debugging

#### A. Production Logs
```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=usecase-dashboard" --limit 50

# Stream logs
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=usecase-dashboard"
```

#### B. Clerk Dashboard Monitoring
1. Monitor user sign-ups in Clerk Dashboard
2. Check webhook delivery status
3. Review authentication logs

### 9. Rollback Plan

If issues occur, you can rollback:

#### A. Environment Variables
```bash
# Temporarily revert to test keys
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### B. Domain Settings
- Re-add localhost domains in Clerk Dashboard
- Update webhook URL back to development

### 10. Post-Migration Checklist

- [ ] DNS CNAME records added for custom domain
- [ ] DNS configuration verified in Clerk Dashboard
- [ ] All environment variables updated to production keys
- [ ] Clerk Dashboard domains updated
- [ ] Webhook endpoint URL updated
- [ ] Email templates configured for production
- [ ] Production secrets created in Google Cloud
- [ ] Authentication flow tested in production
- [ ] Webhook events working correctly
- [ ] User creation working in production database
- [ ] All redirects working properly
- [ ] HTTPS enforced throughout
- [ ] Monitoring and logging configured

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid domain" errors
**Solution:** Ensure production domain is added to Clerk Dashboard domains list

### Issue 2: Webhook delivery failures
**Solution:** 
- Verify webhook URL is accessible
- Check webhook secret is correct
- Ensure HTTPS is used for webhook URL

### Issue 3: Authentication redirects not working
**Solution:**
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check Clerk redirect URLs in dashboard
- Ensure all URLs use HTTPS

### Issue 4: User creation not working
**Solution:**
- Check webhook endpoint is receiving events
- Verify database connection in production
- Check webhook secret verification

### Issue 5: DNS verification failing
**Solution:**
- Wait for DNS propagation (up to 24 hours)
- Double-check CNAME records are correct
- Verify DNS provider settings

## 📞 Support

If you encounter issues during migration:
1. Check Clerk documentation: https://clerk.com/docs
2. Review production logs in Google Cloud Console
3. Test with development keys first to isolate issues
4. Contact Clerk support if needed 