import Redis from 'ioredis';

// Check if we're in build time
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;
const hasRedisUrl = !!process.env.REDIS_URL;
const isDevelopment = process.env.NODE_ENV === 'development';

// Create a mock Redis client for development/build
const createMockRedis = () => {
  const mockRedis = {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 1,
    ping: async () => 'PONG',
    on: () => {},
    connect: async () => {},
    disconnect: async () => {},
    quit: async () => {},
  };
  
  // Add all other Redis methods as no-ops
  return new Proxy(mockRedis, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      // Return async no-op for any other method
      return async () => null;
    },
  });
};

let redis: Redis | any;

if (!hasRedisUrl || isBuildTime || isDevelopment) {
  // Use mock Redis for development and build
  redis = createMockRedis();
  console.log('Using mock Redis client for development/build');
} else if (process.env.REDIS_URL?.includes('redis-cloud.com')) {
  // Production: Redis Cloud with SSL
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
  
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });
} else {
  // Other providers
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });
  
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });
}

export default redis;