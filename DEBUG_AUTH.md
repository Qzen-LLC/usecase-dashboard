# 🔧 Authentication Debug Steps

## The Problem
- Middleware shows `userId: undefined` 
- Users can access protected routes without signing in
- API calls fail because they expect authenticated users

## The Fix

### Step 1: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Sign In Process
1. Navigate to `http://localhost:3000`
2. You should see the landing page with "Sign In" button
3. Click "Sign In" - it will redirect to `/sign-in`
4. Use one of these test accounts:
   - `admin@qzen.com` (QZEN_ADMIN)
   - `shibu.gp@gmail.com` (QZEN_ADMIN)
   - `kramesh06@gmail.com` (QZEN_ADMIN)

### Step 3: Check Authentication
After signing in, you should see:
- Middleware logs: `[Middleware] userId: user_xxxxx pathname: /dashboard`
- Redirect to dashboard
- Governance data loads properly

## If Sign-In Doesn't Work

### Option A: Check Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Check if users exist in Clerk
3. Verify publishable key matches your `.env`

### Option B: Create New User
1. Try signing up with new email
2. Use the sign-up flow at `/sign-up`

### Option C: Bypass Auth Temporarily
If you need to test immediately, temporarily modify middleware:
```typescript
// Add this line after getting userId
const userId = auth.userId || 'test-user-id';
```

## Expected Result
After signing in:
✅ Middleware shows actual userId
✅ Dashboard loads
✅ Governance page shows data
✅ Assessments work properly

## Debugging Commands
```bash
# Check if Clerk is working
curl http://localhost:3000/api/user/me

# Test governance data (after sign-in)
curl http://localhost:3000/api/governance-data
```