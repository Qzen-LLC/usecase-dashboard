import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import crypto from 'crypto';

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

// GET /api/prompts - List prompts for a use case
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'useCaseId is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this use case
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && useCase.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && useCase.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch prompts for this use case
    const prompts = await prismaClient.promptTemplate.findMany({
      where: { useCaseId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest version
        },
        deployments: {
          where: { isActive: true },
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt template
export async function POST(request: NextRequest) {
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
    const {
      name,
      description,
      tags = [],
      versionNotes,
      content,
      type = 'PROMPT',
      service = 'OPENAI',
      settings = {},
      useCaseId,
    } = body;

    if (!name || !content || !useCaseId) {
      return NextResponse.json(
        { error: 'Name, content, and useCaseId are required' },
        { status: 400 }
      );
    }

    // Check if user has access to this use case
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    // Check permissions
    if (userRecord.role === 'USER' && useCase.userId !== userRecord.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if ((userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') 
        && useCase.organizationId !== userRecord.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Detect variables in content
    const variables = detectVariables(content);

    // Create prompt template
    const promptTemplate = await prismaClient.promptTemplate.create({
      data: {
        name,
        description,
        tags,
        content,
        variables,
        settings,
        type,
        service,
        useCaseId,
        organizationId: useCase.organizationId,
        userId: useCase.userId,
        createdById: userRecord.id,
      },
    });

    // Create initial version
    const versionSha = generateVersionSha(content, settings);
    await prismaClient.promptVersion.create({
      data: {
        versionSha,
        versionNumber: 1,
        content,
        settings,
        variables,
        commitMessage: 'Initial version',
        versionNotes: versionNotes || null,
        templateId: promptTemplate.id,
        createdById: userRecord.id,
      },
    });

    return NextResponse.json(promptTemplate);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}