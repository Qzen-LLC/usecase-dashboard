import { prismaClient } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const useCaseId = searchParams.get('useCaseId');
  if (!useCaseId) {
    return NextResponse.json({ error: 'Missing useCaseId' }, { status: 400 });
  }
  const res = await prismaClient.approval.findFirst({ where: { useCaseId } });
  return NextResponse.json(res);
} 