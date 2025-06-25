    import { prismaClient } from "@/utils/db";

    export async function POST(req: Request) {
        try {
            const { useCaseId, newStage } = await req.json();
            const res = await prismaClient.useCase.update({
                where: {
                    id: useCaseId,
                },
                data: {
                    stage: newStage,
                }
            });
        } catch(error) {
            console.error("Unable to update stage");
        }
    }