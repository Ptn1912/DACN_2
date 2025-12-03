// Chat Types for Seller-Customer Communication

export type SenderType = "customer" | "seller"
export type MessageType = "text" | "image" | "product"

export interface Message {
  id: string
  tempId?: string
  conversationId: string
  senderId: string
  receiverId: string
  senderType?: SenderType
  senderName?: string
  text: string
  messageType: MessageType
  imageUrl?: string
  productId?: string
  productName?: string
  productImage?: string
  productPrice?: number
  isRead: boolean
  timestamp: Date
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  participantType: SenderType
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  isTyping?: boolean
}

export interface TypingUser {
  conversationId: string
  userId: string
  userName: string
  userType: SenderType
}

export interface SocketMessage {
  conversationId: string  // Changed from number to string for consistency
  senderId: string        // Changed from number to string for consistency
  receiverId: string      // Changed from number to string for consistency
  content: string
  messageType: MessageType
  productId?: string      // Changed from number to string for consistency
  tempId?: string
  senderType?: SenderType
  senderName?: string
  imageUrl?: string       // Added for image messages
}

// Utility types for API responses
export interface SendMessageRequest {
  conversationId: string
  text: string
  messageType: MessageType
  productId?: string
  imageUrl?: string
}

export interface SendMessageResponse {
  success: boolean
  message: Message
  tempId?: string
}