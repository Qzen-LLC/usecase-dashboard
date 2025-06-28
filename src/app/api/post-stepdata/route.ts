import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const {useCaseId,
           assessData,
    } = await req.json();
    await prismaClient.assess.upsert({
        where: {
            useCaseId,
        },
        update: {
            stepsData: assessData,
        },
        create: {
            useCaseId,
            stepsData: assessData,
            updatedAt: new Date(),
        },
    });
    return NextResponse.json({"success": "true"});
}