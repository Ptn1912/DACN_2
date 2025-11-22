import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/notifications?userId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("GET notifications error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications  — tạo thông báo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, actionUrl } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || "system",
        title,
        message,
        actionUrl,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.error("POST notification error:", err);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications?id=1 — đánh dấu đã đọc
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { error: "Missing notification id" },
        { status: 400 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT notification error:", err);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
