import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const usecases = await prismaClient.useCase.findMany();
        return NextResponse.json(usecases);
    } catch (error) {
        console.error("Error Reading UseCases", error);
        return NextResponse.json(
            { success: false, error: "Failed to read UseCases"},
            { status: 500},
        );
    }
}   