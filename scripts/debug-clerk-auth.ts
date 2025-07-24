#!/usr/bin/env tsx

// Load environment variables manually
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envContent = readFileSync(join(process.cwd(), '.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (e) {
  console.log('Warning: Could not load .env file');
}

import { createClerkClient } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function debugClerkAuth() {
  console.log('🔍 Debugging Clerk Authentication...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  console.log(`CLERK_SECRET_KEY: ${secretKey ? secretKey.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${publishableKey ? publishableKey.substring(0, 10) + '...' : 'NOT SET'}`);

  if (!secretKey) {
    console.log('❌ CLERK_SECRET_KEY is missing!');
    return;
  }

  try {
    // Test Clerk connection
    console.log('\n🔗 Testing Clerk API Connection...');
    const users = await clerkClient.users.getUserList({ limit: 1 });
    console.log(`✅ Clerk API connected. Found ${users.totalCount} users in Clerk.`);

    // Look for specific user
    console.log('\n👤 Looking for kramesh06@gmail.com in Clerk...');
    
    try {
      const clerkUsers = await clerkClient.users.getUserList({
        emailAddress: ['kramesh06@gmail.com'],
        limit: 10
      });
      
      if (clerkUsers.data.length > 0) {
        const user = clerkUsers.data[0];
        console.log('✅ User found in Clerk:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.emailAddresses[0]?.emailAddress}`);
        console.log(`   - First Name: ${user.firstName}`);
        console.log(`   - Last Name: ${user.lastName}`);
        console.log(`   - Created: ${user.createdAt}`);
        console.log(`   - Last Sign In: ${user.lastSignInAt || 'Never'}`);
        
        // Check if IDs match database
        const expectedClerkId = 'user_2zulksw3dvAyBQifFWL4d3CTKn1';
        if (user.id === expectedClerkId) {
          console.log('✅ Clerk ID matches database!');
        } else {
          console.log(`❌ ID Mismatch! Clerk: ${user.id}, Database: ${expectedClerkId}`);
        }
      } else {
        console.log('❌ User NOT found in Clerk');
        console.log('   This means the user exists in your database but not in Clerk.');
        console.log('   Solutions:');
        console.log('   1. Create the user in Clerk dashboard');
        console.log('   2. Or sign up with this email to create the Clerk user');
      }
    } catch (userError) {
      console.log('❌ Error searching for user:', userError);
    }

    // List all Clerk users to see what's available
    console.log('\n📋 All Clerk Users (first 10):');
    const allUsers = await clerkClient.users.getUserList({ limit: 10 });
    allUsers.data.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.emailAddresses[0]?.emailAddress} (${user.id})`);
    });

  } catch (error) {
    console.log('❌ Failed to connect to Clerk API:', error);
    console.log('\nPossible issues:');
    console.log('1. Invalid CLERK_SECRET_KEY');
    console.log('2. Network connectivity issues');
    console.log('3. Clerk service is down');
  }

  console.log('\n🔧 Next Steps:');
  console.log('1. If user exists in Clerk: Check frontend Clerk configuration');
  console.log('2. If user missing in Clerk: Create user in Clerk dashboard or sign up');
  console.log('3. If API fails: Verify secret key in Clerk dashboard');
}

if (require.main === module) {
  debugClerkAuth();
}

export default debugClerkAuth;