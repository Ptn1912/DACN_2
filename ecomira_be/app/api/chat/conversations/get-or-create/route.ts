import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user1Id, user2Id, productId } = await req.json();

    if (!user1Id || !user2Id) {
      return NextResponse.json({ error: 'User IDs are required' }, { status: 400 });
    }

    // Tìm conversation đã tồn tại
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
          lastMessage: '',
          lastMessageTime: new Date(),
        },
        include: {
          user1: true,
          user2: true
        }
      });
    }

    const participant = conversation.user1Id === parseInt(user1Id) ? conversation.user2 : conversation.user1;
    
    const formattedConversation = {
      id: conversation.id.toString(),
      participantId: participant.id.toString(),
      participantName: participant.fullName,
      participantType: participant.userType,
      participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}&background=random`,
      lastMessage: conversation.lastMessage || '',
      lastMessageTime: conversation.lastMessageTime || conversation.createdAt,
      unreadCount: conversation.user1Id === parseInt(user1Id) ? conversation.unreadCountUser1 : conversation.unreadCountUser2,
      isOnline: Math.random() > 0.5,
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}