import { NextRequest, NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';

interface Params {
  id: string;
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const result = await vendorServiceServer.calculateOverallScore(params.id);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ score: result.data });
  } catch (error: any) {
    console.error('Calculate score API error:', error);
    return NextResponse.json({ error: 'Failed to calculate overall score' }, { status: 500 });
  }
}