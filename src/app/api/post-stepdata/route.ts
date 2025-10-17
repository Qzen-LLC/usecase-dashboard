import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";
import { withAuth } from '@/lib/auth-gateway';


export const POST = withAuth(async (req: Request, { auth }: { auth: any }) => {
    try {
        // auth context is provided by withAuth wrapper
        
        const userRecord = await prismaClient.user.findUnique({
            where: { clerkId: auth.userId! },
        });
        
        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { useCaseId, assessData } = await req.json();

        if (!useCaseId || !assessData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check permissions based on role
        if (userRecord.role !== 'QZEN_ADMIN') {
            const useCase = await prismaClient.useCase.findUnique({
                where: { id: useCaseId },
            });
            
            if (!useCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }
            
            if (userRecord.role === 'USER') {
                // USER can only update their own use cases
                if (useCase.userId !== userRecord.id) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
                // ORG_ADMIN and ORG_USER can only update use cases in their organization
                if (useCase.organizationId !== userRecord.organizationId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            }
        }

        const now = new Date();
        const result = await prismaClient.assess.upsert({
            where: {
                useCaseId,
            },
            update: {
                stepsData: {
                    ...assessData,
                    metadata: {
                        ...assessData.metadata,
                        status: assessData.status || "in_progress",
                        completedAt: assessData.status === "completed" ? now.toISOString() : null,
                        lastUpdated: now.toISOString()
                    }
                },
                updatedAt: now,
            },
            create: {
                useCaseId,
                stepsData: {
                    ...assessData,
                    metadata: {
                        ...assessData.metadata,
                        status: assessData.status || "in_progress",
                        completedAt: assessData.status === "completed" ? now.toISOString() : null,
                        lastUpdated: now.toISOString(),
                        createdAt: now.toISOString()
                    }
                },
                updatedAt: now,
                createdAt: now,
            },
        });
        console.log('[CRUD_LOG] Assess data upserted:', { useCaseId, stepsDataKeys: Object.keys(assessData), updatedAt: now, authoredBy: userRecord.id });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error saving assessment data:", error);
        return NextResponse.json(
            { error: "Failed to save assessment data" },
            { status: 500 }
        );
    }
}, { requireUser: true });