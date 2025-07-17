import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server';
import redis from '@/lib/redis';

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userRecord = await prismaClient.user.findUnique({
            where: { clerkId: user.id },
        });
        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        // Redis cache check
        const cacheKey = `finops:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
        }
        // Check use case ownership for USER role
        if (userRecord.role === 'USER') {
            const useCase = await prismaClient.useCase.findUnique({
                where: { id },
            });
            if (!useCase || useCase.userId !== userRecord.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }
        const res = await prismaClient.finOps.findMany({
            where: {
                useCaseId: id,
            },
        });
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 300);
        const response = NextResponse.json(res);
        response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch(error) {
        console.error("Unable to fetch FinOps", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}