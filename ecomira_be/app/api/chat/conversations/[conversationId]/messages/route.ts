
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params
    const conversationIdNum = Number.parseInt(conversationId)

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before") // For pagination

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationIdNum,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      include: {
        sender: {
          select: { id: true, fullName: true, userType: true },
        },
        product: {
          select: { id: true, name: true, price: true, images: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    })

    const transformedMessages = messages.map((msg) => ({
      id: msg.id.toString(),
      conversationId: msg.conversationId.toString(),
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      senderType: msg.sender.userType,
      senderName: msg.sender.fullName,
      text: msg.content,
      messageType: msg.messageType,
      productId: msg.productId?.toString() || null,
      productName: msg.product?.name || null,
      productPrice: msg.product?.price?.toString() || null,
      productImage: msg.product?.images?.[0] || null,
      isRead: msg.isRead,
      timestamp: msg.createdAt,
    }))

    return NextResponse.json(transformedMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params
    const conversationIdNum = Number.parseInt(conversationId)
    const body = await request.json()
    const { senderId, receiverId, text, productId } = body

    if (!senderId || !receiverId || !text) {
      return NextResponse.json({ error: "senderId, receiverId, and text are required" }, { status: 400 })
    }

    const senderIdNum = Number.parseInt(senderId)
    const receiverIdNum = Number.parseInt(receiverId)

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: senderIdNum },
      select: { id: true, fullName: true, userType: true },
    })

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversationIdNum,
        senderId: senderIdNum,
        receiverId: receiverIdNum,
        content: text,
        messageType: productId ? "product" : "text",
        productId: productId ? Number.parseInt(productId) : null,
      },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true },
        },
      },
    })

    // Get conversation to determine which unread count to update
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationIdNum },
    })

    if (conversation) {
      const isReceiverUser1 = receiverIdNum === conversation.user1Id

      // Update conversation with last message and unread count
      await prisma.conversation.update({
        where: { id: conversationIdNum },
        data: {
          lastMessage: text,
          lastMessageTime: new Date(),
          ...(isReceiverUser1 ? { unreadCountUser1: { increment: 1 } } : { unreadCountUser2: { increment: 1 } }),
        },
      })
    }

    return NextResponse.json({
      id: message.id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      senderType: sender.userType,
      senderName: sender.fullName,
      text: message.content,
      messageType: message.messageType,
      productId: message.productId?.toString() || null,
      productName: message.product?.name || null,
      productPrice: message.product?.price?.toString() || null,
      productImage: message.product?.images?.[0] || null,
      isRead: message.isRead,
      timestamp: message.createdAt,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
