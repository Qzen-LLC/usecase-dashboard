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
  // Upstash specific settings
  ...(process.env.NODE_ENV === 'production' && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
});

// Add connection error handling
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export default redis;