# Redis Caching Integration

This project uses Redis to cache API responses and improve page load speed for both development and production environments.

## Why Redis?
- **Ultra-fast** in-memory data store
- Reduces database load
- Improves user experience with faster API responses
- Scalable and easy to integrate

## Setup

### 1. Start Redis Locally (Development)
If you have Docker:
```sh
docker run --name redis -p 6379:6379 -d redis
```
Or install Redis directly from [redis.io](https://redis.io/download).

### 2. Environment Variable
Add the following to your `.env` file:
```
REDIS_URL=redis://localhost:6379
```
For production, set `REDIS_URL` to your managed Redis instance connection string.

### 3. Redis Client
The project uses [`ioredis`](https://www.npmjs.com/package/ioredis):
```sh
npm install ioredis
```

A utility is provided at `src/lib/redis.ts`:
```ts
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export default redis;
```

## Where Caching is Used
Redis caching is implemented in the following API endpoints:

### List of Endpoints with Redis Caching
- `/api/finops-dashboard`
- `/api/vendor-dashboard`
- `/api/governance-data`
- `/api/risk-metrics`
- `/api/executive-metrics`
- `/api/get-usecase`
- `/api/get-finops`
- `/api/read-usecases`
- `/api/eu-ai-act/assessment/full/[useCaseId]`
- `/api/eu-ai-act/assessment/by-usecase/[useCaseId]`
- `/api/iso-42001/assessment/full/[useCaseId]`
- `/api/iso-42001/assessment/by-usecase/[useCaseId]`
- `/api/eu-ai-act/topics`
- `/api/eu-ai-act/control-categories`
- `/api/iso-42001/annex`

Each endpoint:
- Checks Redis for a cached response before querying the database
- Stores fresh results in Redis for 5 minutes (`EX`, 300 seconds)
- Uses unique cache keys per user, organization, or resource as needed
- Adds an `X-Cache: HIT` header when serving from cache

## Cache Invalidation
- Cache is automatically refreshed every 5 minutes.
- For critical data changes, consider manually deleting or updating relevant cache keys.

## Production Recommendations
- Use a managed Redis service (e.g., Redis Cloud, AWS ElastiCache, Azure Cache for Redis)
- Monitor Redis memory usage and set appropriate eviction policies

## Troubleshooting
- Ensure `REDIS_URL` is set correctly in your environment
- Check that the Redis server is running and accessible
- Review API responses for the `X-Cache: HIT` header to confirm caching is working

---
For questions or issues, contact the project maintainer. 