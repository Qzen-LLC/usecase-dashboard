import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        
        const res = await prismaClient.finOps.findMany({
            where: {
                useCaseId: id,
            },
        });
        // console.log(res);
        return NextResponse.json(res)
    } catch(error) {
        console.error("Unable to fetch FinOps", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}