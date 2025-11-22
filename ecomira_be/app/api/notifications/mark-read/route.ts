import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing notification id" }, { status: 400 });

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT mark-read error:", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
