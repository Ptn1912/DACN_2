// Chat Types for React Native App

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  senderType: "customer" | "seller"
  senderName?: string
  text: string
  messageType: "text" | "product" | "image"
  productId?: string
  productName?: string
  productPrice?: string
  productImage?: string
  isRead: boolean
  timestamp: Date | string
  tempId?: string // For optimistic updates
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  participantType: "customer" | "seller"
  lastMessage: string
  lastMessageTime: Date | string
  unreadCount: number
  isOnline: boolean
  isTyping?: boolean
}

export interface TypingIndicator {
  odId: number
  odName?: string
  conversationId: number
}

export interface SocketEvents {
  "user:join": { userId: number; userType: "customer" | "seller" }
  "user:online": { userId: number; isOnline: boolean }
  "conversation:join": number
  "conversation:leave": number
  "message:send": {
    conversationId: number
    senderId: number
    receiverId: number
    content: string
    messageType?: string
    productId?: number
    tempId?: string
    senderType?: string
    senderName?: string
  }
  "message:new": Message
  "message:notification": {
    conversationId: number
    senderId: number
    senderName?: string
    content: string
    timestamp: string
  }
  "typing:start": TypingIndicator
  "typing:stop": TypingIndicator
  "message:read": {
    conversationId: number
    userId: number
    readAt?: string
  }
}
