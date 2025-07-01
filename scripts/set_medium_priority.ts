import { prismaClient } from '../src/utils/db';

async function main() {
  try {
    const result = await prismaClient.$executeRaw`
      UPDATE "UseCase" 
      SET priority = 'MEDIUM' 
      WHERE priority IS NULL OR priority != 'MEDIUM'
    `;
    
    console.log(`Updated use cases to MEDIUM priority`);
  } catch (error) {
    console.error('Error updating priorities:', error);
  } finally {
    await prismaClient.$disconnect();
  }
}

main(); 