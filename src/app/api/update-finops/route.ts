import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const body = await req.json();
    const {           
        monthYear,                  
        useCaseId,               
        devCost,                 
        infraCost,               
        apiCost,                 
        opCost,                  
        cumCost,                  
        valueGenerated,
        ROI,
        netValue,
        monthlyProfit,
        totalLifetimeValue,        
        }  = body;

    const res = await prismaClient.finOps.upsert({
        where: {
            monthYear_useCaseId: {
                monthYear,
                useCaseId,
            },
        },
        update: {   
            devCost,                 
            infraCost,               
            apiCost,                 
            opCost,                  
            cumCost,                  
            valueGenerated,
            ROI,
            netValue,
            monthlyProfit,
            totalLifetimeValue,
        },
        create: {
            monthYear,
            useCaseId,
            devCost,                 
            infraCost,               
            apiCost,                 
            opCost,                  
            cumCost,                  
            valueGenerated,
            ROI,
            netValue,
            monthlyProfit,
            totalLifetimeValue,
        },
    });
    return NextResponse.json({success: true});

}