import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await _req.json();
    const { modelName, apiKey } = body || {};
    const data: any = {};
    if (typeof modelName === "string") data.modelName = modelName.trim();
    if (typeof apiKey === "string") data.apiKey = apiKey.trim();
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const updated = await prisma.aiModel.update({ where: { id: (await params).id }, data });
    return NextResponse.json({ model: updated });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: "A model with this name already exists for this organization" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed to update model" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.aiModel.delete({ where: { id: (await params).id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete model" }, { status: 500 });
  }
}


