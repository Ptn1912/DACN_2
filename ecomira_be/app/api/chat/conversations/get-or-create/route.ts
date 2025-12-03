
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user1Id, user2Id, productId } = body

    if (!user1Id || !user2Id) {
      return NextResponse.json({ error: "user1Id and user2Id are required" }, { status: 400 })
    }

    const user1IdNum = Number.parseInt(user1Id)
    const user2IdNum = Number.parseInt(user2Id)

    // Ensure consistent ordering
    const [smallerId, largerId] = user1IdNum < user2IdNum ? [user1IdNum, user2IdNum] : [user2IdNum, user1IdNum]

    // Try to find existing conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: smallerId,
          user2Id: largerId,
        },
      },
      include: {
        user1: {
          select: { id: true, fullName: true, userType: true },
        },
        user2: {
          select: { id: true, fullName: true, userType: true },
        },
      },
    })

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          user1Id: smallerId,
          user2Id: largerId,
        },
        include: {
          user1: {
            select: { id: true, fullName: true, userType: true },
          },
          user2: {
            select: { id: true, fullName: true, userType: true },
          },
        },
      })
    }

    // Determine participant based on who initiated
    const isUser1 = user1IdNum === smallerId
    const participant = isUser1 ? conversation.user2 : conversation.user1
    const unreadCount = isUser1 ? conversation.unreadCountUser1 : conversation.unreadCountUser2

    return NextResponse.json({
      id: conversation.id.toString(),
      participantId: participant.id.toString(),
      participantName: participant.fullName,
      participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}&background=random`,
      participantType: participant.userType,
      lastMessage: conversation.lastMessage || "",
      lastMessageTime: conversation.lastMessageTime || conversation.createdAt,
      unreadCount,
      isOnline: false,
    })
  } catch (error) {
    console.error("Error in get-or-create conversation:", error)
    return NextResponse.json({ error: "Failed to get or create conversation" }, { status: 500 })
  }
}
