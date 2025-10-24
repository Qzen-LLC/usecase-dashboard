import { PrismaClient } from "../generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prismaClient = 
  global.prisma ||
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling and performance optimizations
    __internal: {
      engine: {
        connectTimeout: 10000, // 10 seconds
        queryTimeout: 30000,   // 30 seconds
      },
    },
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prismaClient;

// Add proper cleanup for development
if (process.env.NODE_ENV === 'development') {
  process.on('beforeExit', async () => {
    await prismaClient.$disconnect();
  });
  
  process.on('SIGINT', async () => {
    await prismaClient.$disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await prismaClient.$disconnect();
    process.exit(0);
  });
}

// Default export for backwards compatibility
export default prismaClient;

// Utility function to retry database operations for prepared statement conflicts
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      retries++;
      console.error(`Database operation attempt ${retries} failed:`, error.message);
      
      if (error.message?.includes('prepared statement') && retries < maxRetries) {
        // Wait a bit before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retries - 1)));
        continue;
      }
      
      // If it's not a prepared statement error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded for database operation');
}