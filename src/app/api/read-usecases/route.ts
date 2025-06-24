import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const db_res = await prismaClient.useCase.findMany();
        const usecases = db_res.json();
        console.log(usecases);  
        NextResponse.json(db_res);
    } catch (error) {
        console.error("Error Reading UseCases");
        return Response.json(
            { success: false, error: "Failed to read UseCases"},
            { status: 500},
        );
    }
}