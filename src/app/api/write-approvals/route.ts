import { prismaClient } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { useCaseId, ...rest } = body;
  if (!useCaseId) {
    return NextResponse.json({ error: 'Missing useCaseId' }, { status: 400 });
  }
  const res = await prismaClient.approval.upsert({
    where: { useCaseId },
    update: rest,
    create: { useCaseId, ...rest },
  });
  return NextResponse.json(res);
} 