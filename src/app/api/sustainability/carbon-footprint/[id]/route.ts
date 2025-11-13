import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prismaClient.carbonFootprint.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting carbon footprint:', error);
    return NextResponse.json({ error: 'Failed to delete carbon footprint' }, { status: 500 });
  }
}
