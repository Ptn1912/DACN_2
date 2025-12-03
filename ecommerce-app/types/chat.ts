// types/chat.ts
export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'seller';
  timestamp: Date;
  read: boolean;
  productName?: string;
  productId?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantType: 'customer' | 'seller';
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}