import Redis from 'ioredis';

// Check if we're in build time or don't have Redis URL
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;
const hasRedisUrl = !!process.env.REDIS_URL;

let redis: Redis;

if (!hasRedisUrl || isBuildTime) {
  // Create a minimal client that won't actually connect
  redis = new Redis('redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 0, // Don't retry during build
    retryStrategy: () => null, // Don't retry
    enableOfflineQueue: false, // Don't queue commands
  });
} else if (process.env.REDIS_URL?.includes('redis-cloud.com')) {
  // Redis Cloud with SSL
  const redisUrl = process.env.REDIS_URL.replace('redis://', 'rediss://');
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    tls: {
      rejectUnauthorized: false,
    },
    lazyConnect: true,
  });
} else {
  // Local Redis or other providers
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });
}

// Only add event listeners if we have a real Redis URL
if (hasRedisUrl && !isBuildTime) {
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });
}

export default redis;