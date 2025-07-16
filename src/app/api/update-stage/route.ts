import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
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

        const { useCaseId, newStage } = await req.json();

        if (!useCaseId || !newStage) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

        await prismaClient.useCase.update({
            where: {
                id: useCaseId,
            },
            data: {
                stage: newStage,
            }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unable to update stage", error);
        return NextResponse.json({ success: false, error: 'Unable to update stage' }, { status: 500 });
    }
}