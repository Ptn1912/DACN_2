// GET /api/chat/conversations - Get all conversations for a user
// POST /api/chat/conversations - Create new conversation

import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const userIdNum = Number.parseInt(userId)

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userIdNum }, { user2Id: userIdNum }],
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userType: true,
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userType: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        lastMessageTime: "desc",
      },
    })

    // Transform to include participant info based on current user
    const transformedConversations = conversations.map((conv) => {
      const isUser1 = conv.user1Id === userIdNum
      const participant = isUser1 ? conv.user2 : conv.user1
      const unreadCount = isUser1 ? conv.unreadCountUser1 : conv.unreadCountUser2

      return {
        id: conv.id.toString(),
        participantId: participant.id.toString(),
        participantName: participant.fullName,
        participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}&background=random`,
        participantType: participant.userType,
        lastMessage: conv.lastMessage || "",
        lastMessageTime: conv.lastMessageTime || conv.createdAt,
        unreadCount,
        isOnline: false, // Will be updated via socket
      }
    })

    return NextResponse.json(transformedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user1Id, user2Id, initialMessage, productId } = body

    if (!user1Id || !user2Id) {
      return NextResponse.json({ error: "user1Id and user2Id are required" }, { status: 400 })
    }

    const user1IdNum = Number.parseInt(user1Id)
    const user2IdNum = Number.parseInt(user2Id)

    // Ensure user1Id < user2Id for consistency
    const [smallerId, largerId] = user1IdNum < user2IdNum ? [user1IdNum, user2IdNum] : [user2IdNum, user1IdNum]

    // Check if conversation already exists
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
          lastMessage: initialMessage || null,
          lastMessageTime: initialMessage ? new Date() : null,
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

      // If there's an initial message, create it
      if (initialMessage) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: user1IdNum,
            receiverId: user2IdNum,
            content: initialMessage,
            messageType: productId ? "product" : "text",
            productId: productId ? Number.parseInt(productId) : null,
          },
        })

        // Update unread count for receiver
        const isReceiverUser1 = user2IdNum === smallerId
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: isReceiverUser1 ? { unreadCountUser1: { increment: 1 } } : { unreadCountUser2: { increment: 1 } },
        })
      }
    }

    // Determine participant based on who initiated
    const isUser1 = user1IdNum === smallerId
    const participant = isUser1 ? conversation.user2 : conversation.user1

    return NextResponse.json({
      id: conversation.id.toString(),
      participantId: participant.id.toString(),
      participantName: participant.fullName,
      participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}&background=random`,
      participantType: participant.userType,
      lastMessage: conversation.lastMessage || "",
      lastMessageTime: conversation.lastMessageTime || conversation.createdAt,
      unreadCount: 0,
      isOnline: false,
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
