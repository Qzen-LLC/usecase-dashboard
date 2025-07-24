# 🔧 Clerk Authentication Debug & Fix

## Current Issues
- Sign-in page is blank
- Clerk not authenticating users  
- Running on port 3002 instead of default 3000
- `userId: undefined` in all requests

## Debug Steps

### 1. Check Clerk Configuration
```bash
# Check your environment variables
grep CLERK .env
```

Expected output:
```
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 2. Verify Clerk Domain Settings
1. Go to https://dashboard.clerk.com
2. Navigate to your project
3. Go to **Settings > Domains**
4. Ensure these domains are whitelisted:
   - `localhost:3000`
   - `localhost:3002`
   - `127.0.0.1:3000`
   - `127.0.0.1:3002`

### 3. Test Clerk Keys
```bash
# Quick test if keys are valid
curl -X GET "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY"
```

### 4. Check Console Errors
Open browser dev tools (F12) and look for:
- Network errors in Network tab
- JavaScript errors in Console tab
- Any Clerk-related error messages

### 5. Alternative Solutions

#### Option A: Use Standard Port
```bash
# Stop current server
# Start on default port
npm run dev
# Should start on localhost:3000
```

#### Option B: Update Clerk Domain
Add `localhost:3002` to your Clerk dashboard domains.

#### Option C: Force Port 3000
```bash
npm run dev -- --port 3000
```

#### Option D: Temporary Bypass for Testing
Modify middleware temporarily to test governance:

```typescript
// In src/middleware.ts, temporarily add:
export default clerkMiddleware((auth, req) => {
  // TEMPORARY: Mock user for testing
  const userId = auth.userId || 'mock-user-12345';
  
  // ... rest of middleware
});
```

### 6. Create Test User Directly
If Clerk isn't working, create a test API to bypass auth:

```bash
# Add this to package.json scripts:
"test-auth-bypass": "BYPASS_AUTH=true npm run dev"
```

## Expected Working Flow

1. Navigate to `http://localhost:3000` (or 3002)
2. See landing page with Sign In button
3. Click Sign In → Redirects to Clerk sign-in
4. Clerk form appears (email/password fields)
5. Enter credentials → Authentication succeeds
6. Redirect to dashboard with `userId: user_xxxxx`

## Quick Fix Commands

```bash
# 1. Check if Clerk is responding
curl "https://api.clerk.com/v1/instance" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY"

# 2. Restart with clean cache
rm -rf .next
npm run dev

# 3. Test governance API after sign-in
curl -b cookies.txt http://localhost:3000/api/governance-data
```

## If Still Broken

### Nuclear Option: Bypass Auth Temporarily
```typescript
// src/app/api/governance-data/route.ts
// Add at top of GET function:
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';
if (BYPASS_AUTH) {
  // Mock user for testing
  const mockUser = await prismaClient.user.findFirst({
    where: { email: 'admin@qzen.com' }
  });
  // ... continue with mockUser
}
```

This lets you test governance functionality while fixing Clerk separately.