import { Message, Conversation } from '@/types/chat';

class ChatService {
  private conversations: Conversation[] = [];
  private messages: Map<string, Message[]> = new Map();

  // Mock data tạm thời
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock conversations
    this.conversations = [
      {
        id: '1',
        participantId: 'seller1',
        participantName: 'Cửa hàng Thời trang XYZ',
        participantAvatar: 'https://via.placeholder.com/50',
        lastMessage: 'Cảm ơn bạn đã mua hàng!',
        lastMessageTime: new Date(),
        unreadCount: 2,
        isOnline: true,
      },
      {
        id: '2',
        participantId: 'seller2',
        participantName: 'Shop Điện tử ABC',
        participantAvatar: 'https://via.placeholder.com/50',
        lastMessage: 'Sản phẩm đã có hàng lại rồi ạ',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 0,
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000),
      },
    ];

    // Mock messages
    this.messages.set('1', [
      {
        id: '1',
        text: 'Xin chào, tôi muốn hỏi về sản phẩm áo thun này',
        senderId: 'customer1',
        senderName: 'Bạn',
        senderType: 'customer',
        timestamp: new Date(Date.now() - 7200000),
        productId: '1',
        productName: 'Áo thun nam cotton',
        read: true,
      },
      {
        id: '2',
        text: 'Chào bạn, mình có thể giúp gì cho bạn ạ?',
        senderId: 'seller1',
        senderName: 'Cửa hàng Thời trang XYZ',
        senderType: 'seller',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
      },
      {
        id: '3',
        text: 'Cảm ơn bạn đã mua hàng!',
        senderId: 'seller1',
        senderName: 'Cửa hàng Thời trang XYZ',
        senderType: 'seller',
        timestamp: new Date(),
        read: false,
      },
    ]);
  }

  async getConversations(): Promise<Conversation[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.conversations);
      }, 500);
    });
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = this.messages.get(conversationId) || [];
        resolve(messages);
      }, 300);
    });
  }

  async sendMessage(conversationId: string, text: string, productId?: string, productName?: string): Promise<Message> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          senderId: 'customer1', // Mock customer ID
          senderName: 'Bạn',
          senderType: 'customer',
          timestamp: new Date(),
          productId,
          productName,
          read: false,
        };

        // Add to local storage
        const existingMessages = this.messages.get(conversationId) || [];
        this.messages.set(conversationId, [...existingMessages, newMessage]);

        // Update conversation last message
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.lastMessage = text;
          conversation.lastMessageTime = new Date();
        }

        resolve(newMessage);
      }, 200);
    });
  }

  async createConversation(participantId: string, participantName: string, initialMessage?: string): Promise<Conversation> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          participantId,
          participantName,
          participantAvatar: `https://via.placeholder.com/50`,
          lastMessage: initialMessage || 'Bắt đầu cuộc trò chuyện',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: true,
        };

        this.conversations.unshift(newConversation);

        if (initialMessage) {
          const newMessage: Message = {
            id: Date.now().toString(),
            text: initialMessage,
            senderId: 'customer1',
            senderName: 'Bạn',
            senderType: 'customer',
            timestamp: new Date(),
            read: false,
          };
          this.messages.set(newConversation.id, [newMessage]);
        }

        resolve(newConversation);
      }, 300);
    });
  }
}

export const chatService = new ChatService();