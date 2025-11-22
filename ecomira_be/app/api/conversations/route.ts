import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
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

    // Format conversations to include participant info and last message
    const formattedConversations = conversations.map(conv => {
      const isUser1 = conv.user1Id === userId;
      const participant = isUser1 ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id.toString(),
        participantId: participant.id.toString(),
        participantName: participant.fullName,
        participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.fullName)}`,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt || conv.updatedAt,
        unreadCount: isUser1 ? conv.unreadCountUser1 : conv.unreadCountUser2,
        isOnline: false,
        lastSeen: new Date()
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const { participantId, initialMessage } = await req.json();

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }

    const participantIdNum = parseInt(participantId);

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantIdNum }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: participantIdNum },
          { user1Id: participantIdNum, user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
          }
        },
        user2: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: participantIdNum,
          lastMessage: initialMessage || '',
          lastMessageTime: new Date(),
        },
        include: {
          user1: {
            select: {
              id: true,
              fullName: true,
            }
          },
          user2: {
            select: {
              id: true,
              fullName: true,
            }
          }
        }
      });
    }

    // If there's an initial message, create it
    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          receiverId: participantIdNum,
          content: initialMessage,
          messageType: 'text'
        }
      });

      // Update conversation's last message and time
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: initialMessage,
          lastMessageTime: new Date()
        }
      });
    }

    // Format the conversation to return
    const isUser1 = conversation.user1Id === userId;
    const participantUser = isUser1 ? conversation.user2 : conversation.user1;

    const formattedConversation = {
      id: conversation.id.toString(),
      participantId: participantUser.id.toString(),
      participantName: participantUser.fullName,
      participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participantUser.fullName)}`,
      lastMessage: initialMessage || '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: false,
      lastSeen: new Date()
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}