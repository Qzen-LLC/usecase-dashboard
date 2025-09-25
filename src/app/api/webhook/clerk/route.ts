import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { validateUserRole } from '@/utils/role-validation';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // If no webhook secret is configured, skip webhook verification (development mode)
  if (!WEBHOOK_SECRET) {
    console.log('No webhook secret configured, skipping webhook verification (development mode)');
    try {
      const payload = await req.json();
      const eventType = payload.type;
      const eventData = payload.data;
      console.log(`Processing webhook event: ${eventType}`);
      switch (eventType) {
        case 'session.ended':
        case 'session.revoked':
        case 'user.signed_out': {
          try {
            const clerkUserId = eventData?.user_id || eventData?.id;
            if (!clerkUserId) break;
            const userRecord = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
            if (!userRecord) break;
            const result = await prisma.lock.deleteMany({ where: { userId: userRecord.id, isActive: false } });
            console.log('🧹 Cleanup inactive locks (dev):', { clerkUserId, deleted: result.count });
          } catch (cleanupErr) {
            console.error('Failed cleaning inactive locks on session end (dev):', cleanupErr);
          }
          break;
        }
        case 'session.removed': {
          try {
            const clerkUserId = eventData?.user_id || eventData?.id;
            if (!clerkUserId) break;
            const userRecord = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
            if (!userRecord) break;
            const result = await prisma.lock.deleteMany({ where: { userId: userRecord.id, isActive: false } });
            console.log('🧹 Cleanup inactive locks on session removed (dev):', { clerkUserId, deleted: result.count });
          } catch (cleanupErr) {
            console.error('Failed cleaning inactive locks on session removed (dev):', cleanupErr);
          }
          break;
        }
        case 'organizationMembership.created':
        case 'organizationMembership.updated':
        case 'organizationMembership.deleted': {
          try {
            const userId = eventData?.public_user_data?.user_id || eventData?.data?.user_id || eventData?.user_id;
            const organizationId = eventType === 'organizationMembership.deleted'
              ? null
              : (eventData?.organization?.id || eventData?.data?.organization_id || null);
            if (userId) {
              const client = await clerkClient();
              await client.users.updateUser(userId, {
                privateMetadata: {
                  organizationId,
                },
              });
              console.log('✅ Synced organizationId to user publicMetadata (dev):', { userId, organizationId });
            }
          } catch (err) {
            console.error('Failed syncing organizationId to user publicMetadata (dev):', err);
          }
          break;
        }
        case 'user.created':
          try {
            const { id: clerkId, email_addresses, first_name, last_name, public_metadata } = eventData;
            const email = email_addresses?.[0]?.email_address;
            const organizationId = typeof public_metadata?.organizationId === 'string' ? public_metadata.organizationId : null;
            
            // Use validation function to ensure correct role assignment
            const userRole = validateUserRole(
              public_metadata?.role as string || 'USER',
              organizationId
            );
            
            console.log('🔧 Webhook - Processing user.created event:', {
              email,
              role: userRole,
              organizationId: organizationId || 'No organization',
              clerkId
            });
            
            if (email) {
              const created = await prisma.user.create({
                data: {
                  clerkId,
                  email,
                  firstName: first_name || null,
                  lastName: last_name || null,
                  role: userRole,
                  organizationId,
                },
              });
              // Mirror minimal identity into Clerk publicMetadata for low-latency claims
              const client = await clerkClient();
              await client.users.updateUser(clerkId, {
                privateMetadata: {
                  appRole: userRole,
                  organizationId,
                  dbUserId: created.id,
                },
              });
              console.log('User created successfully and metadata synced (dev):', email, userRole, organizationId || 'No organization', created.id);
            }
          } catch (error) {
            console.error('Error creating user:', error);
          }
          break;
        case 'user.updated':
          try {
            const { id: clerkId, email_addresses, first_name, last_name } = eventData;
            const email = email_addresses?.[0]?.email_address;
            if (email) {
              await prisma.user.update({
                where: { clerkId },
                data: {
                  email,
                  firstName: first_name || null,
                  lastName: last_name || null,
                },
              });
              // Keep appRole/org/dbUserId consistent in Clerk publicMetadata based on DB
              const dbUser = await prisma.user.findUnique({ where: { clerkId } });
              if (dbUser) {
                const client = await clerkClient();
                await client.users.updateUser(clerkId, {
                  privateMetadata: {
                    appRole: dbUser.role,
                    organizationId: dbUser.organizationId || null,
                    dbUserId: dbUser.id,
                  },
                });
              }
              console.log('User updated successfully:', email);
            }
          } catch (error) {
            console.error('Error updating user:', error);
          }
          break;
        case 'user.deleted':
          try {
            const { id: clerkId } = eventData;
            await prisma.user.delete({
              where: { clerkId },
            });
            console.log('User deleted successfully:', clerkId);
          } catch (error) {
            console.error('Error deleting user:', error);
          }
          break;
      }
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // Production webhook verification
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  switch (eventType) {
    case 'session.ended':
    case 'session.revoked':
    case 'session.removed':
      try {
        const clerkUserId: string | undefined = (evt.data as any)?.user_id || (evt.data as any)?.id;
        if (clerkUserId) {
          const userRecord = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
          if (userRecord) {
            const result = await prisma.lock.deleteMany({ where: { userId: userRecord.id, isActive: false } });
            console.log('🧹 Cleanup inactive locks on session end:', { clerkUserId, deleted: result.count });
          }
        }
      } catch (error) {
        console.error('Error cleaning inactive locks on session end:', error);
      }
      break;
    case 'organizationMembership.created':
    case 'organizationMembership.updated':
    case 'organizationMembership.deleted':
      try {
        const userId: string | undefined = (evt.data as any)?.public_user_data?.user_id || (evt.data as any)?.data?.user_id || (evt.data as any)?.user_id;
        const organizationId: string | null = eventType === 'organizationMembership.deleted'
          ? null
          : ((evt.data as any)?.organization?.id || (evt.data as any)?.data?.organization_id || null);
        if (userId) {
          const client = await clerkClient();
          await client.users.updateUser(userId, {
            privateMetadata: {
              organizationId,
            },
          });
          console.log('✅ Synced organizationId to user publicMetadata:', { userId, organizationId });
        }
      } catch (error) {
        console.error('Error syncing organization membership to user metadata:', error);
      }
      break;
    case 'user.created':
      try {
                const { id: clerkId, email_addresses, first_name, last_name, public_metadata } = evt.data;
        const email = email_addresses?.[0]?.email_address;
        const organizationId = typeof public_metadata?.organizationId === 'string' ? public_metadata.organizationId : null;
        
        // Use validation function to ensure correct role assignment
        const userRole = validateUserRole(
          public_metadata?.role as string || 'USER',
          organizationId
        );
        
        console.log('🔧 Webhook - Processing user.created event:', {
          email,
          role: userRole,
          organizationId: organizationId || 'No organization',
          clerkId
        });
        
        if (email) {
          // Check if user already exists (by email or clerkId)
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { clerkId }
              ]
            }
          });
          
          if (existingUser) {
            console.log('ℹ️ Webhook - User already exists, updating instead:', {
              email,
              existingUserId: existingUser.id,
              existingClerkId: existingUser.clerkId
            });
            
            // Update existing user with new clerkId if needed
            if (existingUser.clerkId !== clerkId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  clerkId,
                  email,
                  firstName: first_name || null,
                  lastName: last_name || null,
                  role: userRole,
                  organizationId,
                },
              });
              const client = await clerkClient();
              await client.users.updateUser(clerkId, {
                privateMetadata: {
                  appRole: userRole,
                  organizationId,
                  dbUserId: existingUser.id,
                },
              });
              console.log('✅ Webhook - User updated successfully:', email);
            } else {
              console.log('ℹ️ Webhook - User already exists with same clerkId, skipping');
              const client = await clerkClient();
              await client.users.updateUser(clerkId, {
                privateMetadata: {
                  appRole: existingUser.role,
                  organizationId: existingUser.organizationId || null,
                  dbUserId: existingUser.id,
                },
              });
            }
          } else {
            // Create new user
          await prisma.user.create({
            data: {
              clerkId,
              email,
              firstName: first_name || null,
              lastName: last_name || null,
              role: userRole,
              organizationId,
            },
          });
          const created = await prisma.user.findUnique({ where: { clerkId } });
          if (created) {
            const client = await clerkClient();
            await client.users.updateUser(clerkId, {
              privateMetadata: {
                appRole: userRole,
                organizationId,
                dbUserId: created.id,
              },
            });
          }
          console.log('✅ Webhook - User created successfully:', email, userRole, organizationId || 'No organization');
          }
        }
      } catch (error) {
        console.error('Error processing user.created webhook:', error);
      }
      break;
    case 'user.updated':
      try {
        const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses?.[0]?.email_address;
        if (email) {
          await prisma.user.update({
            where: { clerkId },
            data: {
              email,
              firstName: first_name || null,
              lastName: last_name || null,
            },
          });
          const dbUser = await prisma.user.findUnique({ where: { clerkId } });
          if (dbUser) {
            const client = await clerkClient();
            await client.users.updateUser(clerkId, {
              privateMetadata: {
                appRole: dbUser.role,
                organizationId: dbUser.organizationId || null,
                dbUserId: dbUser.id,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
      break;
    case 'user.deleted':
      try {
        const { id: clerkId } = evt.data;
        await prisma.user.delete({
          where: { clerkId },
        });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
      break;
  }

  return NextResponse.json({ success: true });
} 