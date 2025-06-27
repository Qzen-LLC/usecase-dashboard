import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const {useCaseId,
           stepsData,
    } = await req.json();
    await prismaClient.assess.upsert({
        where: {
            useCaseId,
        },
        update: {
            stepsData,
        },
        create: {
            useCaseId,
            stepsData,
        },
    });
    return NextResponse.json({"success": "true"});
}