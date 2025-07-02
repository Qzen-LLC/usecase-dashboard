import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Use case ID is required' }, { status: 400 });
    }

    // Delete the use case
    await prismaClient.useCase.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Use case deleted successfully' });
  } catch (error) {
    console.error('Error deleting use case:', error);
    return NextResponse.json({ error: 'Failed to delete use case' }, { status: 500 });
  }
} 