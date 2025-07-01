import { NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';

export async function GET() {
  try {
    const result = await vendorServiceServer.getDashboardStats();
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Vendor dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}