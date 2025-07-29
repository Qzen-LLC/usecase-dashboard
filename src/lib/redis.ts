import Redis from 'ioredis';

// Fix Redis URL to use SSL for Redis Cloud
const getRedisUrl = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Convert redis:// to rediss:// for Redis Cloud SSL connections
  if (redisUrl.includes('redis-cloud.com') && redisUrl.startsWith('redis://')) {
    return redisUrl.replace('redis://', 'rediss://');
  }
  
  return redisUrl;
};

const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  // Enable TLS for Redis Cloud
  tls: process.env.REDIS_URL?.includes('redis-cloud.com') ? {
    rejectUnauthorized: false,
  } : undefined,
});

// Add connection error handling
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export default redis;