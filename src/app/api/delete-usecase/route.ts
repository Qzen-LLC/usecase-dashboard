import { prismaClient } from "@/utils/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Use case ID is required' },
                { status: 400 }
            );
        }

        // Delete related records first (due to foreign key constraints)
        // Delete Approval record
        await prismaClient.approval.deleteMany({
            where: {
                useCaseId: id
            }
        });

        // Delete Assess record
        await prismaClient.assess.deleteMany({
            where: {
                useCaseId: id
            }
        });

        // Delete FinOps record
        await prismaClient.finOps.deleteMany({
            where: {
                useCaseId: id
            }
        });

        // Finally delete the use case
        await prismaClient.useCase.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting use case:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete use case' },
            { status: 500 }
        );
    }
} 