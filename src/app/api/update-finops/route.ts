import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const {
        useCaseId,
        ROI,
        netValue,
        apiCostBase,
        cumOpCost,
        cumValue,
        devCostBase,
        infraCostBase,
        opCostBase,
        totalInvestment,
        valueBase,
        valueGrowthRate,
    } = body;

    const res = await prismaClient.finOps.upsert({
        where: { useCaseId },
        update: {
            ROI,
            netValue,
            apiCostBase,
            cumOpCost,
            cumValue,
            devCostBase,
            infraCostBase,
            opCostBase,
            totalInvestment,
            valueBase,
            valueGrowthRate,
        },
        create: {
            useCaseId,
            ROI,
            netValue,
            apiCostBase,
            cumOpCost,
            cumValue,
            devCostBase,
            infraCostBase,
            opCostBase,
            totalInvestment,
            valueBase,
            valueGrowthRate,
        },
    });
    return NextResponse.json({ success: true });
}