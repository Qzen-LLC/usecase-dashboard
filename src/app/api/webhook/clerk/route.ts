import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

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
        case 'user.created':
          try {
            const { id: clerkId, email_addresses, first_name, last_name, public_metadata } = eventData;
            const email = email_addresses?.[0]?.email_address;
            // Only allow valid UserRole values
            const validRoles = ['QZEN_ADMIN', 'ORG_ADMIN', 'ORG_USER', 'USER'] as const;
            let role = (public_metadata && typeof public_metadata.role === 'string' && validRoles.includes(public_metadata.role as any)) ? public_metadata.role : 'USER';
            const organizationId = typeof public_metadata?.organizationId === 'string' ? public_metadata.organizationId : null;
            
            // Type assertion for Prisma UserRole
            const userRole = role as 'QZEN_ADMIN' | 'ORG_ADMIN' | 'ORG_USER' | 'USER';
            if (email) {
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
              console.log('User created successfully:', email, userRole, organizationId || 'No organization');
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
    console.error('Error verifying webhook:', err);
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
    case 'user.created':
      try {
        const { id: clerkId, email_addresses, first_name, last_name, public_metadata } = evt.data;
        const email = email_addresses?.[0]?.email_address;
        // Only allow valid UserRole values
        const validRoles = ['QZEN_ADMIN', 'ORG_ADMIN', 'ORG_USER', 'USER'] as const;
        let role = (public_metadata && typeof public_metadata.role === 'string' && validRoles.includes(public_metadata.role as any)) ? public_metadata.role : 'USER';
        const organizationId = typeof public_metadata?.organizationId === 'string' ? public_metadata.organizationId : null;
        
        // Type assertion for Prisma UserRole
        const userRole = role as 'QZEN_ADMIN' | 'ORG_ADMIN' | 'ORG_USER' | 'USER';
        if (email) {
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
          console.log('User created in Supabase/Prisma:', email, userRole, organizationId || 'No organization');
        }
      } catch (error) {
        console.error('Error creating user:', error);
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