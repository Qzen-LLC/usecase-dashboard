#!/usr/bin/env tsx

import { writeFileSync, readFileSync, existsSync } from 'fs';

const middlewarePath = '/Users/kaluri/usecase-dashboard/src/middleware.ts';
const backupPath = '/Users/kaluri/usecase-dashboard/src/middleware.ts.backup';

function restoreAuth() {
  console.log('🔧 Restoring original authentication...');

  try {
    if (!existsSync(backupPath)) {
      console.log('❌ No backup found. Cannot restore original auth.');
      return;
    }

    const originalMiddleware = readFileSync(backupPath, 'utf8');
    writeFileSync(middlewarePath, originalMiddleware);
    
    console.log('✅ Original authentication restored');
    console.log(`
🔄 Authentication restored! 

Now you need to:
1. Restart your dev server: npm run dev
2. Fix Clerk authentication issues
3. Sign in properly to access protected routes
`);

  } catch (error) {
    console.error('❌ Error restoring auth:', error);
  }
}

if (require.main === module) {
  restoreAuth();
}

export default restoreAuth;