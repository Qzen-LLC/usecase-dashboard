import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import crypto from 'crypto';

// Helper function to generate SHA-256 hash for version tracking
function generateVersionSha(content: any, settings: any): string {
  const data = JSON.stringify({ 
    content, 
    settings, 
    timestamp: Date.now(),
    random: crypto.randomBytes(8).toString('hex')
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

// GET /api/prompts/[id]/versions - Get all versions of a prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the prompt template
    const promptTemplate = await prismaClient.promptTemplate.findUnique({
      where: { id: params.id },
    });

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && promptTemplate.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && promptTemplate.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all versions
    const versions = await prismaClient.promptVersion.findMany({
      where: { templateId: params.id },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    // Map relation alias to createdBy for frontend
    return NextResponse.json(
      versions.map(v => ({
        ...v,
        createdBy: v.User ? {
          id: v.User.id,
          email: v.User.email,
          firstName: v.User.firstName ?? undefined,
          lastName: v.User.lastName ?? undefined,
        } : undefined,
      }))
    );
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST /api/prompts/[id]/versions - Create a new version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { commitMessage } = body;

    if (!commitMessage) {
      return NextResponse.json(
        { error: 'Commit message is required' },
        { status: 400 }
      );
    }

    // Get the prompt template
    const promptTemplate = await prismaClient.promptTemplate.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        }
      }
    });

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && promptTemplate.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && promptTemplate.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create new version
    const latestVersion = promptTemplate.versions[0];
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    const versionSha = generateVersionSha(promptTemplate.content, promptTemplate.settings);

    const newVersion = await prismaClient.promptVersion.create({
      data: {
        versionSha,
        versionNumber: newVersionNumber,
        content: promptTemplate.content,
        settings: promptTemplate.settings,
        variables: promptTemplate.variables,
        commitMessage,
        templateId: params.id,
        createdById: userRecord.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
      }
    });

    console.log('[CRUD_LOG] Prompt Version created:', { id: newVersion.id, templateId: params.id, versionNumber: newVersion.versionNumber, commitMessage: newVersion.commitMessage });

    return NextResponse.json(newVersion);
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}