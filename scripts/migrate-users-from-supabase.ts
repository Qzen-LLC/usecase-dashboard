import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@/generated/prisma';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Prisma client for Neon
const prisma = new PrismaClient();

async function migrateUsersFromSupabase() {
  try {
    console.log('🚀 Starting user migration from Supabase to Neon...');
    
    // Fetch users from Supabase
    console.log('📥 Fetching users from Supabase...');
    const { data: supabaseUsers, error } = await supabase
      .from('User')
      .select('*');

    if (error) {
      console.error('❌ Error fetching from Supabase:', error);
      return;
    }

    if (!supabaseUsers || supabaseUsers.length === 0) {
      console.log('ℹ️  No users found in Supabase User table');
      return;
    }

    console.log(`📊 Found ${supabaseUsers.length} users in Supabase`);
    console.log('👥 Sample user data:', JSON.stringify(supabaseUsers[0], null, 2));

    // Migrate each user to Neon
    console.log('📤 Migrating users to Neon...');
    
    for (const user of supabaseUsers) {
      try {
        const userData = {
          clerkId: user.clerkId || `migrated_${user.id}`,
          email: user.email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: user.role || 'USER',
          organizationId: user.organizationId || null,
        };

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          console.log(`⚠️  User already exists: ${user.email}`);
          continue;
        }

        const newUser = await prisma.user.create({
          data: userData
        });

        console.log(`✅ Migrated user: ${newUser.email} (${newUser.role})`);

      } catch (userError) {
        console.error(`❌ Error migrating user ${user.email}:`, userError);
      }
    }

    console.log('🎉 User migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersFromSupabase();