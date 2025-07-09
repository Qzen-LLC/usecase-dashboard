import { NextRequest, NextResponse } from 'next/server';
import { vendorServiceServer } from '@/lib/vendorServiceServer';

export async function GET() {
  try {
    const result = await vendorServiceServer.getVendors();
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    const response = NextResponse.json(result.data);
    // Add caching headers for vendors (cache for 2 minutes)
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return response;
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