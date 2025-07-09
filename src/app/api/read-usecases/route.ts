import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const fields = searchParams.get('fields');

        // If no pagination params provided, return all data (backward compatibility)
        const shouldPaginate = page && limit;
        let pageNum = 1;
        let limitNum: number | undefined = undefined;
        let skipNum: number | undefined = undefined;

        if (shouldPaginate) {
            pageNum = parseInt(page);
            limitNum = parseInt(limit);
            if (!isNaN(pageNum) && !isNaN(limitNum)) {
                skipNum = (pageNum - 1) * limitNum;
            } else {
                // Invalid pagination params, treat as no pagination
                limitNum = undefined;
            }
        }

        // Determine which fields to select (backward compatibility)
        const selectFields = fields ? 
            fields.split(',').reduce((acc, field) => {
                acc[field.trim()] = true;
                return acc;
            }, {} as any) :
            {
                id: true,
                title: true,
                stage: true,
                priority: true,
                primaryStakeholders: true,
                aiucId: true,
                problemStatement: true,
                proposedAISolution: true,
                currentState: true,
                desiredState: true,
                secondaryStakeholders: true,
                successCriteria: true,
                problemValidation: true,
                solutionHypothesis: true,
                keyAssumptions: true,
                initialROI: true,
                confidenceLevel: true,
                operationalImpactScore: true,
                productivityImpactScore: true,
                revenueImpactScore: true,
                implementationComplexity: true,
                estimatedTimeline: true,
                requiredResources: true,
                createdAt: true,
                updatedAt: true
            };

        const queryOptions: any = {
            select: selectFields,
            orderBy: { updatedAt: 'desc' }
        };

        if (shouldPaginate && limitNum !== undefined) {
            queryOptions.skip = skipNum;
            queryOptions.take = limitNum;
        }

        const usecases = await prismaClient.useCase.findMany(queryOptions);

        // For backward compatibility, if no pagination params, return just the array
        if (!shouldPaginate || limitNum === undefined) {
            const response = NextResponse.json(usecases);
            // Add cache headers for better performance
            response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
            return response;
        }

        // If pagination requested, return paginated response
        const total = await prismaClient.useCase.count();
        const response = NextResponse.json({
            data: usecases,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
                hasNext: pageNum * limitNum < total,
                hasPrev: pageNum > 1
            }
        });
        
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    } catch (error) {
        console.error("Error Reading UseCases", error);
        return NextResponse.json(
            { success: false, error: "Failed to read UseCases"},
            { status: 500},
        );
    }
}   