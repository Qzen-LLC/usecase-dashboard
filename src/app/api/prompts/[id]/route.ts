import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';
import crypto from 'crypto';
import type { Prisma } from '@/generated/prisma';

// Helper function to detect variables in prompt content
function detectVariables(content: any): string[] {
  const variables = new Set<string>();
  // Only match variables that look like placeholders, not JSON content
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  
  const searchInString = (str: string) => {
    let match;
    while ((match = regex.exec(str)) !== null) {
      const varName = match[1];
      // Filter out common JSON keys
      if (!varName.includes('"') && !varName.includes(':') && !varName.includes('\n')) {
        variables.add(varName);
      }
    }
  };

  // Handle both simple prompts and chat messages
  if (typeof content === 'string') {
    searchInString(content);
  } else if (content?.prompt) {
    searchInString(content.prompt);
  } else if (content?.messages && Array.isArray(content.messages)) {
    content.messages.forEach((msg: any) => {
      if (msg.content) searchInString(msg.content);
    });
  }

  return Array.from(variables);
}

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

// GET /api/prompts/[id] - Get a specific prompt
export const GET = withAuth(async (
  request: Request,
  { params, auth }: { params: { id: string }, auth: any }
) => {
  try {
    // auth context is provided by withAuth wrapper

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const prompt = await prismaClient.promptTemplate.findUnique({
      where: { id: params.id },
      include: {
        User_PromptTemplate_createdByIdToUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        PromptVersion: {
          orderBy: { createdAt: 'desc' },
        },
        PromptDeployment: {
          where: { isActive: true },
        }
      }
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && prompt.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && prompt.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      ...prompt,
      createdBy: (prompt as any).User_PromptTemplate_createdByIdToUser
        ? {
            id: (prompt as any).User_PromptTemplate_createdByIdToUser.id,
            email: (prompt as any).User_PromptTemplate_createdByIdToUser.email,
            firstName: (prompt as any).User_PromptTemplate_createdByIdToUser.firstName ?? undefined,
            lastName: (prompt as any).User_PromptTemplate_createdByIdToUser.lastName ?? undefined,
          }
        : undefined,
      versions: (prompt as any).PromptVersion,
      deployments: (prompt as any).PromptDeployment,
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}, { requireUser: true });

// PUT /api/prompts/[id] - Update a prompt template
export const PUT = withAuth(async (
  request: Request,
  { params, auth }: { params: { id: string }, auth: any }
) => {
  try {
    // auth context is provided by withAuth wrapper

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      tags = [],
      versionNotes,
      content,
      type,
      service,
      settings = {},
    } = body;

    // Fetch existing prompt
    const existingPrompt = await prismaClient.promptTemplate.findUnique({
      where: { id: params.id },
      include: {
        PromptVersion: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        }
      }
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && existingPrompt.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && existingPrompt.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Detect variables in content
    const variables = detectVariables(content);

    // Update prompt template
    const updatedPrompt = await prismaClient.promptTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
        tags,
        content: content as unknown as Prisma.InputJsonValue,
        variables,
        settings: settings as unknown as Prisma.InputJsonValue,
        type,
        service,
      },
    });
    console.log('[CRUD_LOG] Prompt Template updated:', { id: params.id, name: updatedPrompt.name, updatedAt: updatedPrompt.updatedAt, authoredBy: userRecord.id });

    // Create new version if content or settings changed
    const lastVersion = (existingPrompt as any).PromptVersion?.[0];
    const contentChanged = JSON.stringify(content) !== JSON.stringify(existingPrompt.content);
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(existingPrompt.settings);

    if (contentChanged || settingsChanged) {
      const versionSha = generateVersionSha(content, settings);
      const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
      
      await prismaClient.promptVersion.create({
        data: {
          versionSha,
          versionNumber: newVersionNumber,
          content: content as unknown as Prisma.InputJsonValue,
          settings: settings as unknown as Prisma.InputJsonValue,
          variables,
          commitMessage: versionNotes || `Update prompt - v${newVersionNumber}`,
          versionNotes: versionNotes || null,
          templateId: params.id,
          createdById: userRecord.id,
        },
      });
      console.log('[CRUD_LOG] Prompt Version created:', { templateId: params.id, versionNumber: newVersionNumber, commitMessage: versionNotes || `Update prompt - v${newVersionNumber}`, authoredBy: userRecord.id });
    }

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}, { requireUser: true });

// DELETE /api/prompts/[id] - Delete a prompt template
export const DELETE = withAuth(async (
  request: Request,
  { params, auth }: { params: { id: string }, auth: any }
) => {
  try {
    // auth context is provided by withAuth wrapper

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch prompt to check permissions
    const prompt = await prismaClient.promptTemplate.findUnique({
      where: { id: params.id },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && prompt.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && prompt.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete prompt (cascade will delete versions, deployments, etc.)
    await prismaClient.promptTemplate.delete({
      where: { id: params.id },
    });
    console.log('[CRUD_LOG] Prompt Template deleted:', { id: params.id, authoredBy: userRecord.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}, { requireUser: true });