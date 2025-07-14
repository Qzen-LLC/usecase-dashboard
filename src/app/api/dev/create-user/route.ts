import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role = 'USER' } = await req.json();

    console.log('Creating user with Clerk ID:', user.id, 'Role:', role);

    // Check if user already exists
    let userRecord = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (userRecord) {
      // Update existing user
      userRecord = await prisma.user.update({
        where: { clerkId: user.id },
        data: { role: role as any },
      });
      console.log('User updated:', userRecord.email);
    } else {
      // Create new user
      userRecord = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: role as any,
        },
      });
      console.log('User created:', userRecord.email);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        role: userRecord.role,
        clerkId: userRecord.clerkId,
      },
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 