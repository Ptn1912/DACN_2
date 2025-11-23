import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: parseInt(userId) },
          { user2Id: parseInt(userId) }
        ]
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format response
    const formattedConversations = conversations.map(conv => {
      const participant = conv.user1Id === parseInt(userId) ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id.toString(),
        participantId: participant.id.toString(),
        participantName: participant.fullName,
        participantType: participant.userType,
        participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}&background=random`,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt || conv.createdAt,
        unreadCount: conv.user1Id === parseInt(userId) ? conv.unreadCountUser1 : conv.unreadCountUser2,
        isOnline: Math.random() > 0.5, // Trong thực tế, bạn có thể dùng WebSocket để tracking online status
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user1Id, user2Id, initialMessage, productId } = await req.json();

    if (!user1Id || !user2Id) {
      return NextResponse.json({ error: 'User IDs are required' }, { status: 400 });
    }

    // Kiểm tra conversation đã tồn tại chưa
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: parseInt(user1Id), user2Id: parseInt(user2Id) },
          { user1Id: parseInt(user2Id), user2Id: parseInt(user1Id) }
        ]
      },
      include: {
        user1: true,
        user2: true
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: parseInt(user1Id),
          user2Id: parseInt(user2Id),
          lastMessage: initialMessage || '',
          lastMessageTime: new Date(),
        },
        include: {
          user1: true,
          user2: true
        }
      });
    }

    // Format response
    const participant = conversation.user1Id === parseInt(user1Id) ? conversation.user2 : conversation.user1;
    
    const formattedConversation = {
      id: conversation.id.toString(),
      participantId: participant.id.toString(),
      participantName: participant.fullName,
      participantType: participant.userType,
      participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}&background=random`,
      lastMessage: initialMessage || '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: Math.random() > 0.5,
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}