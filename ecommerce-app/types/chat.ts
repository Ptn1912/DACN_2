export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'seller';
  timestamp: Date;
  productId?: string;
  productName?: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
}