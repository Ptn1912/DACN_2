import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const conversationId = parseInt(params.id);

    // Check if the user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        },
        sender: {
          select: {
            id: true,
            fullName: true
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
      senderName: msg.senderId === userId ? 'Bạn' : msg.sender.fullName,
      senderType: msg.senderId === userId ? 'customer' : 'seller',
      timestamp: msg.createdAt,
      productId: msg.productId?.toString(),
      productName: msg.product?.name,
      read: msg.isRead
    }));

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Reset unread count for this user
    const isUser1 = conversation.user1Id === userId;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: isUser1 
        ? { unreadCountUser1: 0 }
        : { unreadCountUser2: 0 }
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const conversationId = parseInt(params.id);
    const { text, productId, productName } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // Check if the user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Determine the receiver ID
    const receiverId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: userId,
        receiverId: receiverId,
        content: text,
        messageType: 'text',
        productId: productId ? parseInt(productId) : null
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update conversation's last message and time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageTime: new Date(),
        // Update unread count for the receiver
        ...(receiverId === conversation.user1Id ? 
          { unreadCountUser1: { increment: 1 } } : 
          { unreadCountUser2: { increment: 1 } }
        )
      }
    });

    // Format the message to return
    const formattedMessage = {
      id: message.id.toString(),
      text: message.content,
      senderId: message.senderId.toString(),
      senderName: 'Bạn',
      senderType: 'customer',
      timestamp: message.createdAt,
      productId: message.productId?.toString(),
      productName: message.product?.name,
      read: message.isRead
    };

    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}