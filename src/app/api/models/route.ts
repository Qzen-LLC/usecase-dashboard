import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }
    const models = await prisma.aiModel.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch models" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, modelName, apiKey } = body || {};
    if (!organizationId || !modelName || !apiKey) {
      return NextResponse.json({ error: "organizationId, modelName, apiKey are required" }, { status: 400 });
    }
    const created = await prisma.aiModel.create({
      data: {
        organizationId,
        modelName: String(modelName).trim(),
        apiKey: String(apiKey).trim(),
      },
    });
    return NextResponse.json({ model: created }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: "A model with this name already exists for this organization" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed to create model" }, { status: 500 });
  }
}


