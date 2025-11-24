import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/notifications/mark-all?userId=1 — đánh dấu tất cả đã đọc
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Cập nhật tất cả thông báo của người dùng này thành đã đọc
    const result = await prisma.notification.updateMany({
      where: { userId: userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(
        { message: `Updated ${result.count} notifications` },
        { status: 200 }
    );
  } catch (err) {
    console.error("PUT mark-all error:", err);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}