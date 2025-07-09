import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// Add proper cleanup for development
if (process.env.NODE_ENV === 'development') {
  process.on('beforeExit', async () => {
    await prismaClient.$disconnect();
  });
}

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