# Ngrok Webhook Setup Guide

This document provides step-by-step instructions for setting up ngrok to expose your local development server and configuring Clerk webhooks for the QZen Use Case Dashboard.

## Prerequisites

- Node.js and npm installed
- QZen Use Case Dashboard running locally
- Clerk account and application configured
- ngrok account (free tier available)

## Step 1: Install ngrok

### Option A: Download from ngrok.com
1. Visit [ngrok.com](https://ngrok.com)
2. Sign up for a free account
3. Download ngrok for your operating system
4. Extract the ngrok executable to a directory in your PATH

### Option B: Install via npm
```bash
npm install -g ngrok
```

### Option C: Install via package manager

**Windows (Chocolatey):**
```bash
choco install ngrok
```

**macOS (Homebrew):**
```bash
brew install ngrok
```

**Linux (Snap):**
```bash
sudo snap install ngrok
```

## Step 2: Authenticate ngrok

1. Get your authtoken from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
2. Run the authentication command:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

## Step 3: Start Your Local Development Server

1. Navigate to your project directory:
```bash
cd usecase-dashboard
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Verify the server is running on `http://localhost:3000`

## Step 4: Create ngrok Tunnel

1. Open a new terminal window/tab
2. Create an ngrok tunnel to your local server:
```bash
ngrok http 3000
```

3. ngrok will display output similar to:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`) - this is your public ngrok URL

## Step 5: Configure Clerk Webhook

### 5.1 Access Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your QZen application
3. Navigate to **Webhooks** in the left sidebar

### 5.2 Create New Webhook
1. Click **"Add Endpoint"**
2. Configure the webhook:
   - **Endpoint URL**: `https://your-ngrok-url.ngrok.io/api/webhook/clerk`
   - **Events**: Select the following events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - **Version**: Select the latest version (usually v1)

### 5.3 Get Webhook Signing Secret
1. After creating the webhook, click on it to view details
2. Copy the **Signing Secret** (starts with `whsec_`)

## Step 6: Update Environment Variables

### 6.1 Create/Update .env.local file
Update the following environment variables in your `.env` file:

CLERK_WEBHOOK_SECRET=whsec_your_webhook_signing_secret


# Database
DATABASE_URL=your_database_url
```

### 6.2 Restart Development Server
After updating the environment variables:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 7: Test Webhook Configuration

### 7.1 Test via Clerk Dashboard
1. In Clerk Dashboard, go to your webhook
2. Click **"Send test event"**
3. Select `user.created` event
4. Click **"Send"**
5. Check the webhook delivery status

### 7.2 Test via Application
1. Go to your ngrok URL: `https://your-ngrok-url.ngrok.io`
2. Try to sign up a new user
3. Check the webhook delivery in Clerk Dashboard
4. Verify the user is created in your database

### 7.3 Monitor ngrok Traffic
1. Open ngrok web interface: `http://127.0.0.1:4040`
2. Go to **"HTTP"** tab
3. You can see all incoming requests and their responses

## Step 8: Production Deployment

When deploying to production, update the webhook URL in Clerk Dashboard:

1. **Before deployment**: Update webhook URL to your production domain
   ```
   https://your-production-domain.com/api/webhook/clerk
   ```

2. **Update environment variables** in your production environment:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
   ```

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events
- **Check ngrok tunnel**: Ensure ngrok is running and forwarding correctly
- **Verify URL**: Make sure the webhook URL in Clerk matches your ngrok URL
- **Check logs**: Monitor ngrok web interface for incoming requests
- **Test endpoint**: Visit `https://your-ngrok-url.ngrok.io/api/webhook/clerk` directly

#### 2. 404 Errors
- **Verify route**: Ensure the webhook route exists at `/api/webhook/clerk`
- **Check server**: Make sure your Next.js server is running on port 3000
- **ngrok tunnel**: Confirm ngrok is forwarding to the correct port

#### 3. 500 Internal Server Errors
- **Check environment variables**: Ensure `CLERK_WEBHOOK_SECRET` is set correctly
- **Database connection**: Verify database is accessible
- **Logs**: Check server logs for detailed error messages

#### 4. Webhook Verification Failures
- **Secret mismatch**: Ensure the signing secret in `.env.local` matches Clerk Dashboard
- **Request format**: Verify the webhook payload format
- **Headers**: Check that all required headers are present

### Debug Commands

#### Check ngrok Status
```bash
ngrok http 3000 --log=stdout
```

#### Test Webhook Endpoint
```bash
curl -X POST https://your-ngrok-url.ngrok.io/api/webhook/clerk \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### Monitor ngrok Traffic
```bash
# Open ngrok web interface
open http://127.0.0.1:4040
```

## Security Considerations

### 1. ngrok Security
- **HTTPS only**: Always use HTTPS URLs for webhooks
- **Temporary use**: ngrok is for development/testing only
- **Access control**: Be aware that ngrok URLs are publicly accessible

### 2. Webhook Security
- **Signing secret**: Never commit webhook secrets to version control
- **Verification**: Always verify webhook signatures in production
- **HTTPS**: Use HTTPS for all webhook endpoints

### 3. Environment Variables
- **Local development**: Use `.env.local` for local environment variables
- **Production**: Use secure environment variable management
- **Secrets**: Never expose secrets in client-side code

## Best Practices

### 1. Development Workflow
1. Start local development server
2. Start ngrok tunnel
3. Update Clerk webhook URL
4. Update environment variables
5. Test webhook functionality
6. Monitor ngrok traffic for debugging

### 2. Testing Strategy
- Test webhook events individually
- Verify database operations
- Check error handling
- Monitor performance

### 3. Production Checklist
- [ ] Update webhook URL to production domain
- [ ] Verify environment variables in production
- [ ] Test webhook functionality in production
- [ ] Monitor webhook delivery status
- [ ] Set up error monitoring

## Additional Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [Clerk Webhooks Documentation](https://clerk.com/docs/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Database](https://www.prisma.io/docs)

## Support

If you encounter issues:

1. **Check ngrok status**: Visit `http://127.0.0.1:4040`
2. **Review Clerk logs**: Check webhook delivery status in Clerk Dashboard
3. **Server logs**: Monitor your Next.js server console
4. **Database logs**: Check database connection and operations

For persistent issues, check the troubleshooting section above or consult the relevant documentation. 