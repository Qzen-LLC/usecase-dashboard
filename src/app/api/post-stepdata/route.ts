import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { useCaseId, assessData } = await req.json();

        if (!useCaseId || !assessData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error saving assessment data:", error);
        return NextResponse.json(
            { error: "Failed to save assessment data" },
            { status: 500 }
        );
    }
}