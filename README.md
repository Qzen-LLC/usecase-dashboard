This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
 First, run the development server:

 

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev 
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Dockerization Complete ✅

  I've successfully dockerized your Next.js usecase-dashboard
  application for cloud deployment:

  Key Improvements Made:

  1. Enhanced Dockerfile
  (/Users/kaluri/usecase-dashboard/Dockerfile:1-50)
    - Multi-stage build for optimization
    - Updated to Node.js 20
    - Added Prisma client generation
    - Non-root user security
    - Standalone output for smaller images
  2. Production Next.js Config
  (/Users/kaluri/usecase-dashboard/next.config.ts:8)
    - Added output: 'standalone' for Docker optimization
  3. Complete Docker Compose
  (/Users/kaluri/usecase-dashboard/docker-compose.yml)
    - Application service
    - PostgreSQL database with health checks
    - Redis caching service
    - Database migration service
    - Production-ready networking
  4. Optimized .dockerignore
  (/Users/kaluri/usecase-dashboard/.dockerignore)
    - Excludes development files and sensitive data
    - Reduces image size significantly
  5. Environment Template
  (/Users/kaluri/usecase-dashboard/.env.example)
    - Complete environment variables documentation
    - Ready for cloud deployment configuration


  To Deploy:

  # Local development
  docker-compose up -d

  # Production deployment
  docker build -t usecase-dashboard .
  docker run -p 3000:3000 --env-file .env usecase-dashboard

  The application is now ready for deployment on any cloud
  platform (AWS, GCP, Azure, etc.) with proper security,
  performance optimizations, and scalability.

Deployment on Aug 13 5.57.       
