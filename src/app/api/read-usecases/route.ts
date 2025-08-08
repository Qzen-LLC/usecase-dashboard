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

        // Redis cache check (gracefully handle failures)
        const cacheKey = `usecases:${userRecord.role}:${userRecord.id}`;
        let cached = null;
        try {
            cached = await redis.get(cacheKey);
            if (cached) {
                console.log(`Cache HIT for key: ${cacheKey}`);
                return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
            } else {
                console.log(`Cache MISS for key: ${cacheKey}`);
            }
        } catch (error) {
            console.warn('Redis cache read failed, continuing without cache:', error.message);
        }

        // Admin: return all use cases
        let useCases = [];
        if (userRecord.role === 'QZEN_ADMIN') {
            useCases = await prismaClient.useCase.findMany({
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
            useCases = await prismaClient.useCase.findMany({
                where: { organizationId: userRecord.organizationId },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        } else if (userRecord.role === 'USER') {
            // Only return use cases for this user
            useCases = await prismaClient.useCase.findMany({
                where: { userId: userRecord.id },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        } else {
            // Fallback: restrict to userId
            useCases = await prismaClient.useCase.findMany({
                where: { userId: userRecord.id },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }

        // Try to cache the result (gracefully handle failures)
        try {
            await redis.set(cacheKey, JSON.stringify({ useCases }), 'EX', 300);
            console.log(`Cached ${useCases.length} use cases for key: ${cacheKey}`);
        } catch (error) {
            console.warn('Redis cache write failed, continuing without cache:', error.message);
        }
        
        const response = NextResponse.json({ useCases });
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error) {
        console.error('Error Reading UseCases', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}   