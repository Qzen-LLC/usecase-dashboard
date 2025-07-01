import { NextRequest, NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';

export async function GET() {
  try {
    const result = await vendorServiceServer.getVendors();
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Vendors API error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const vendorData = await request.json();
    const result = await vendorServiceServer.createVendor(vendorData);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    console.error('Vendors POST API error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}