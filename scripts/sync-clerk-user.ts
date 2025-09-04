import { prismaClient } from "../src/utils/db";
import { createClerkClient } from "@clerk/backend";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function syncClerkUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.log("Usage: npx tsx scripts/sync-clerk-user.ts <email>");
    console.log("Example: npx tsx scripts/sync-clerk-user.ts test@example.com");
    process.exit(1);
  }

  try {
    // Initialize Clerk client with secret key
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    console.log(`🔍 Looking for Clerk user with email: ${email}`);
    
    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList();
    const clerkUser = clerkUsers.data.find(u => 
      u.emailAddresses.some(e => e.emailAddress === email)
    );

    if (!clerkUser) {
      console.log("❌ User not found in Clerk");
      console.log("Available users in Clerk:");
      clerkUsers.data.forEach(u => {
        console.log(`  - ${u.emailAddresses[0]?.emailAddress} (ID: ${u.id})`);
      });
      process.exit(1);
    }

    console.log(`✅ Found Clerk user: ${clerkUser.id}`);

    // Check if user exists in database
    const existingUser = await prismaClient.user.findUnique({
      where: { clerkId: clerkUser.id }
    });

    if (existingUser) {
      console.log("✅ User already exists in database");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
    } else {
      // Create user in database
      const newUser = await prismaClient.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName || "User",
          lastName: clerkUser.lastName || "",
          role: "USER",
          isActive: true
        }
      });
      console.log('[CRUD_LOG] User created (script):', { id: newUser.id, email: newUser.email, role: newUser.role, authoredBy: newUser.id });

      console.log("✅ Created user in database:");
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Clerk ID: ${newUser.clerkId}`);
    }

    console.log("\n✨ User is ready to use the application!");
    
  } catch (error) {
    console.error("❌ Error syncing user:", error);
  } finally {
    await prismaClient.$disconnect();
  }
}

syncClerkUser().catch(console.error);