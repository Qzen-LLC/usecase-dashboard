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
            return NextResponse.json(
                { success: false, error: "ID is required" },
                { status: 400 }
            );
        }

        // Redis cache check
        const cacheKey = `usecase:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return new NextResponse(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
        }

        // Check permissions based on role
        if (userRecord.role !== 'QZEN_ADMIN') {
            const useCase = await prismaClient.useCase.findUnique({
                where: { id },
            });
            
            if (!useCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }
            
            if (userRecord.role === 'USER') {
                // USER can only access their own use cases
                if (useCase.userId !== userRecord.id) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
                // ORG_ADMIN and ORG_USER can only access use cases in their organization
                if (useCase.organizationId !== userRecord.organizationId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            }
        }

        const useCase = await prismaClient.useCase.findUnique({
            where: { id },
            select: {
                id: true,
                aiucId: true,
                title: true,
                problemStatement: true,
                proposedAISolution: true,
                keyBenefits: true,
                currentState: true,
                desiredState: true,
                primaryStakeholders: true,
                secondaryStakeholders: true,
                successCriteria: true,
                problemValidation: true,
                solutionHypothesis: true,
                keyAssumptions: true,
                initialCost: true,
                initialROI: true,
                confidenceLevel: true,
                operationalImpactScore: true,
                productivityImpactScore: true,
                revenueImpactScore: true,
                implementationComplexity: true,
                estimatedTimeline: true,
                plannedStartDate: true,
                estimatedTimelineMonths: true,
                requiredResources: true,
                priority: true,
                stage: true,
                businessFunction: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!useCase) {
            return NextResponse.json(
                { success: false, error: "Use case not found" },
                { status: 404 }
            );
        }

        // Cache the result for 5 minutes
        await redis.set(cacheKey, JSON.stringify(useCase), 'EX', 300);

        // Add cache header
        const response = NextResponse.json(useCase);
        response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch (error) {
        console.error('Error fetching use case:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}