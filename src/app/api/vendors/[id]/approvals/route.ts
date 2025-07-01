import { NextRequest, NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';

interface Params {
  id: string;
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const { area, status, approvedBy, comments } = await request.json();
    
    const result = await vendorServiceServer.updateApprovalArea(
      params.id,
      area,
      status,
      approvedBy,
      comments || ''
    );
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Approval area API error:', error);
    return NextResponse.json({ error: 'Failed to update approval area' }, { status: 500 });
  }
}