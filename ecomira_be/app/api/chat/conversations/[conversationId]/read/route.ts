// PUT /api/chat/conversations/[conversationId]/read - Mark messages as read

import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params
    const conversationIdNum = Number.parseInt(conversationId)
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const userIdNum = Number.parseInt(userId)

    // Mark all messages as read for this user
    await prisma.message.updateMany({
      where: {
        conversationId: conversationIdNum,
        receiverId: userIdNum,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    // Reset unread count for this user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationIdNum },
    })

    if (conversation) {
      const isUser1 = userIdNum === conversation.user1Id

      await prisma.conversation.update({
        where: { id: conversationIdNum },
        data: isUser1 ? { unreadCountUser1: 0 } : { unreadCountUser2: 0 },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}
