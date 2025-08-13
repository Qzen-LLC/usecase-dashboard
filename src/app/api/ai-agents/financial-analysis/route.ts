import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { FinancialAIAgent } from '@/lib/ai-agents/financial-agent';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');
    const portfolio = searchParams.get('portfolio') === 'true';

    if (!useCaseId && !portfolio) {
      return NextResponse.json({ error: 'useCaseId or portfolio parameter required' }, { status: 400 });
    }

    const financialAgent = FinancialAIAgent.getInstance();

    if (portfolio) {
      // Analyze portfolio
      const portfolioAnalysis = await financialAgent.analyzePortfolio();
      return NextResponse.json(portfolioAnalysis);
    } else {
      // Analyze specific use case
      const analysis = await financialAgent.analyzeUseCase(useCaseId!);
      return NextResponse.json(analysis);
    }
  } catch (error) {
    console.error('Error in financial analysis API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { useCaseId, months = 12 } = body;

    if (!useCaseId) {
      return NextResponse.json({ error: 'useCaseId is required' }, { status: 400 });
    }

    const financialAgent = FinancialAIAgent.getInstance();
    const prediction = await financialAgent.predictPerformance(useCaseId, months);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error in financial prediction API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
