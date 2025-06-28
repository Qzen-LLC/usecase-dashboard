import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { useCaseId, newStage } = await req.json();
        const res = await prismaClient.useCase.update({
            where: {
                id: useCaseId,
            },
            data: {
                stage: newStage,
            }
        });
        return NextResponse.json({ success: true });
    } catch(error) {
        console.error("Unable to update stage");
        return NextResponse.json({ success: false, error: 'Unable to update stage' }, { status: 500 });
    }
}