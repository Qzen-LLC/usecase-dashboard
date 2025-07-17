import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import { NextResponse } from "next/server";
import redis from '@/lib/redis';

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data from database
        const userRecord = await prismaClient.user.findUnique({
            where: { clerkId: user.id },
            include: { organization: true }
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Redis cache check
        const cacheKey = `usecases:${userRecord.role}:${userRecord.id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
        }

        // Admin: return all use cases
        let useCases = [];
        if (userRecord.role === 'QZEN_ADMIN') {
            useCases = await prismaClient.useCase.findMany({
                orderBy: { updatedAt: 'desc' }
            });
        } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
            useCases = await prismaClient.useCase.findMany({
                where: { organizationId: userRecord.organizationId },
                orderBy: { updatedAt: 'desc' }
            });
        } else if (userRecord.role === 'USER') {
            // Only return use cases for this user
            useCases = await prismaClient.useCase.findMany({
                where: { userId: userRecord.id },
                orderBy: { updatedAt: 'desc' }
            });
        } else {
            // Fallback: restrict to userId
            useCases = await prismaClient.useCase.findMany({
                where: { userId: userRecord.id },
                orderBy: { updatedAt: 'desc' }
            });
        }

        // Add cache header
        await redis.set(cacheKey, JSON.stringify({ useCases }), 'EX', 300);
        const response = NextResponse.json({ useCases });
        response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch (error) {
        console.error('Error Reading UseCases', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}   