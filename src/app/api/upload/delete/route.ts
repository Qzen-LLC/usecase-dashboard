import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { del } from '@vercel/blob';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Delete from Vercel Blob
    await del(fileUrl);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}