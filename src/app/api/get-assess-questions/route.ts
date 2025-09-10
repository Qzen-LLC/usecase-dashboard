import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userRecord = await prismaClient.user.findUnique({
            where: { clerkId: clerkId },
        });
        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        console.log("User Record: ", userRecord);
        const questions = await prismaClient.question.findMany({
            include: {
                options: true,
                answers: true,
            },
        });
        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}