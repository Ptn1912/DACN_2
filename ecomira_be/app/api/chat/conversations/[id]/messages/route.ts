import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Thay đổi ở đây: params là Promise
) {
  try {
    // Await params
    const { id } = await params;
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            userType: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      text: msg.content,
      senderId: msg.senderId.toString(),
      senderName: msg.sender.fullName,
      senderType: msg.sender.userType,
      timestamp: msg.createdAt,
      read: msg.isRead,
      productId: msg.productId?.toString(),
      productName: msg.product?.name
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Thay đổi ở đây: params là Promise
) {
  try {
    // Await params
    const { id } = await params;
    const conversationId = parseInt(id);
    const { senderId, receiverId, text, productId } = await req.json();

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    if (!senderId || !receiverId || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Tạo tin nhắn
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content: text,
        messageType: 'text',
        productId: productId ? parseInt(productId) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            userType: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Cập nhật cuộc trò chuyện
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageTime: new Date(),
        // Cập nhật unread count
        ...(parseInt(receiverId) === (await prisma.conversation.findUnique({where: {id: conversationId}}))!.user1Id ? 
          { unreadCountUser1: { increment: 1 } } : 
          { unreadCountUser2: { increment: 1 } }
        )
      }
    });

    // Format response
    const formattedMessage = {
      id: message.id.toString(),
      text: message.content,
      senderId: message.senderId.toString(),
      senderName: message.sender.fullName,
      senderType: message.sender.userType,
      timestamp: message.createdAt,
      read: message.isRead,
      productId: message.productId?.toString(),
      productName: message.product?.name
    };

    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}