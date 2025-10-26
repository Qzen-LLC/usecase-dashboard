import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Get all organizations (QZen Admin only)
export const GET = withAuth(async (request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!currentUserRecord || currentUserRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch organizations from DB
    const organizations = await prismaClient.organization.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        useCases: {
          select: {
            id: true,
            title: true,
            stage: true,
            priority: true,
          },
        },
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });

// Create new organization (QZen Admin only)
export const POST = withAuth(async (req: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!currentUserRecord || currentUserRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, domain, adminEmail, adminFirstName, adminLastName } = await req.json();

    console.log('Creating organization with:', { name, domain, adminEmail, adminFirstName, adminLastName });

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    if (!adminEmail || !adminEmail.trim()) {
      return NextResponse.json({ error: 'Admin email is required' }, { status: 400 });
    }

    // Check for existing org by name or domain (case-insensitive, trimmed)
    const existingOrg = await prismaClient.organization.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: 'insensitive' as const } },
          ...(domain ? [{ domain: { equals: domain.trim(), mode: 'insensitive' as const } }] : []),
        ],
      },
    });

    console.log('Existing org check result:', existingOrg ? { id: existingOrg.id, name: existingOrg.name, domain: existingOrg.domain } : 'NONE');

    if (existingOrg) {
      console.log('Organization already exists, returning error');
      return NextResponse.json(
        { error: 'Organization with this name or domain already exists' },
        { status: 400 }
      );
    }

    // Check if admin user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email: adminEmail.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create the organization and invitation in a transaction
    const result = await prismaClient.$transaction(async (tx) => {
      // Create the organization
      const org = await tx.organization.create({
        data: {
          name: name.trim(),
          domain: domain ? domain.trim() : null,
        },
      });

      // Create invitation for the admin user
      const invitation = await tx.invitation.create({
        data: {
          email: adminEmail.trim(),
          role: 'ORG_ADMIN',
          organizationId: org.id,
          invitedById: currentUserRecord.id,
          token: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      return { org, invitation };
    });

    // Send email invitation via Clerk
    try {
      // Automatically detect current environment's URL for invitations
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const rawHost = (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'localhost:3000').trim();
      let baseUrl: string;
      try {
        const parsed = rawHost.startsWith('http') ? new URL(rawHost) : new URL(`${protocol}://${rawHost}`);
        baseUrl = `${parsed.protocol}//${parsed.host}`; // normalize
      } catch {
        baseUrl = `${protocol}://${rawHost.replace(/^https?:\/\//, '')}`;
      }

      console.log('[Organization Creation] Using baseUrl:', baseUrl);
      
      await clerk.invitations.createInvitation({
        emailAddress: adminEmail.trim(),
        publicMetadata: { 
          role: 'ORG_ADMIN', 
          organizationId: result.org.id 
        },
        redirectUrl: `${baseUrl}/sign-up?invitation_token=${result.invitation.token}`,
      });
      console.log('Email invitation sent to:', adminEmail.trim());
    } catch (error: any) {
      console.error('Error sending email invitation:', error, error?.errors);
      // Don't fail the organization creation if email fails
      // The invitation record is still created in the database
    }

    const templates = await prismaClient.questionTemplate.findMany({
      include: { optionTemplates: true },
    });
  
    await prismaClient.$transaction(
      templates.map((template) =>
        prismaClient.question.create({
          data: {
            text: template.text,
            type: template.type,
            templateId: template.id,
            organizationId: result.org.id,
            stage: template.stage,
            options: {
              create: template.optionTemplates.map((opt) => ({ text: opt.text })),
            },
          },
        })
      )
    );
    

    return NextResponse.json({ 
      success: true, 
      organization: result.org,
      invitation: {
        id: result.invitation.id,
        email: result.invitation.email,
        role: result.invitation.role,
        token: result.invitation.token,
      }
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });

// Delete organization (QZen Admin only)
export const DELETE = withAuth(async (req: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper

    const currentUserRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!currentUserRecord || currentUserRecord.role !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Check if organization exists
    const organization = await prismaClient.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: true,
        useCases: true,
        vendors: true,
        invitations: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    console.log('Deleting organization:', {
      id: organization.id,
      name: organization.name,
      usersCount: organization.users.length,
      useCasesCount: organization.useCases.length,
      vendorsCount: organization.vendors.length,
      invitationsCount: organization.invitations.length,
    });

    // Delete organization and all related data in a transaction
    await prismaClient.$transaction(async (tx) => {
      // Delete invitations first (due to foreign key constraints)
      await tx.invitation.deleteMany({
        where: { organizationId: organizationId },
      });

      // Update users to remove organization association
      await tx.user.updateMany({
        where: { organizationId: organizationId },
        data: { organizationId: null },
      });

      // Delete the organization - all related data will cascade automatically:
      // - UseCases (and all their nested data: FinOps, Assess, Approval, etc.)
      // - Vendors (and all their nested data: AssessmentScore, ApprovalArea)
      await tx.organization.delete({
        where: { id: organizationId },
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Organization deleted successfully',
      deletedOrganization: {
        id: organization.id,
        name: organization.name,
        domain: organization.domain,
      }
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });