import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Extract filename from URL (e.g., /uploads/evidence/filename.ext)
    const fileName = fileUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'evidence', fileName);

    // Check if file exists before trying to delete
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } else {
      console.log(`File not found (already deleted?): ${filePath}`);
    }

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