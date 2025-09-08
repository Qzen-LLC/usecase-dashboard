import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import * as yaml from 'js-yaml';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');
    const guardrailId = searchParams.get('guardrailId');
    const format = searchParams.get('format') || 'json';

    if (!useCaseId && !guardrailId) {
      return NextResponse.json(
        { error: 'Either useCaseId or guardrailId is required' },
        { status: 400 }
      );
    }

    let guardrails;
    
    if (guardrailId) {
      // Export specific guardrail
      const guardrail = await prismaClient.guardrail.findUnique({
        where: { id: guardrailId },
        include: {
          rules: true,
          useCase: {
            select: {
              title: true,
              problemStatement: true
            }
          }
        }
      });

      if (!guardrail) {
        return NextResponse.json(
          { error: 'Guardrail not found' },
          { status: 404 }
        );
      }

      guardrails = [guardrail];
    } else {
      // Export all guardrails for a use case
      guardrails = await prismaClient.guardrail.findMany({
        where: { useCaseId },
        include: {
          rules: true,
          useCase: {
            select: {
              title: true,
              problemStatement: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (format === 'yaml') {
      // Convert to YAML format
      const yamlContent = yaml.dump({
        guardrails: guardrails.map(g => ({
          name: g.name,
          useCase: g.useCase?.title,
          approach: g.approach,
          confidence: g.confidence,
          status: g.status,
          rules: g.rules?.map((r: any) => ({
            type: r.type,
            severity: r.severity,
            rule: r.rule,
            description: r.description,
            implementation: r.implementation
          }))
        }))
      });
      
      return new NextResponse(yamlContent, {
        headers: {
          'Content-Type': 'text/yaml',
          'Content-Disposition': `attachment; filename="guardrails-${Date.now()}.yaml"`
        }
      });
    } else if (format === 'openai') {
      // Export in OpenAI format for their moderation API
      const openAIFormat = guardrails.map(g => ({
        name: g.name,
        rules: g.rules?.filter((r: any) => r.type === 'content_safety').map((r: any) => ({
          category: r.rule,
          threshold: r.severity === 'critical' ? 0.1 : r.severity === 'high' ? 0.3 : 0.5
        }))
      }));
      
      return NextResponse.json(openAIFormat);
    } else {
      // Return as JSON
      return NextResponse.json({
        guardrails,
        exportedAt: new Date().toISOString(),
        count: guardrails.length
      });
    }
  } catch (error) {
    console.error('Error exporting guardrails:', error);
    return NextResponse.json(
      { error: 'Failed to export guardrails' },
      { status: 500 }
    );
  }
}