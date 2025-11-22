import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
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

    // Mark all messages as read
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}