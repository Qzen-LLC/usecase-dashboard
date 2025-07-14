import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';
import { NextResponse } from "next/server";

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

        // Admin: return all use cases
        let useCases = [];
        if (userRecord.role === 'QZEN_ADMIN') {
            useCases = await prismaClient.useCase.findMany({
                orderBy: { updatedAt: 'desc' }
            });
        } else if (userRecord.role === 'ORG_ADMIN') {
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

        return NextResponse.json({ useCases });
    } catch (error) {
        console.error('Error Reading UseCases', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}   