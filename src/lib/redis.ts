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
} else {
  // Parse the Redis URL to extract components
  const url = new URL(process.env.REDIS_URL);
  const useSSL = url.protocol === 'rediss:';
  
  // Create connection options
  const options = {
    host: url.hostname,
    port: parseInt(url.port || '6379'),
    password: url.password,
    username: url.username || 'default',
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    // Only enable TLS if URL uses rediss://
    ...(useSSL && {
      tls: {
        rejectUnauthorized: false
      }
    })
  };
  
  redis = new Redis(options);
  
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });
}

export default redis;
