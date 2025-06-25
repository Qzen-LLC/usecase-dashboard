import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    console.log(id);
    const useCase = await prismaClient.useCase.findUnique({
        where: { id: id as string},
    });
    
    return NextResponse.json(useCase);    
}