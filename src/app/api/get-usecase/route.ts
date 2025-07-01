import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: "ID is required" },
                { status: 400 }
            );
        }

        const useCase = await prismaClient.useCase.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                stage: true,
                primaryStakeholders: true,
                aiucId: true
            }
        });

        if (!useCase) {
            return NextResponse.json(
                { success: false, error: "Use case not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(useCase);
    } catch (error) {
        console.error("Error fetching use case:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch use case" },
            { status: 500 }
        );
    }
}