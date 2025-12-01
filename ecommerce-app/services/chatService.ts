// Chat Service with Socket.IO support

import type { Message, Conversation } from "@/types/chat"
import api from "./api"

class ChatService {
  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await api.get(`/chat/conversations?userId=${userId}`)
    return response.data
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`)
    return response.data
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    productId?: string,
  ): Promise<Message> {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      senderId,
      receiverId,
      text,
      productId,
    })
    return response.data
  }

  async createConversation(
    user1Id: string,
    user2Id: string,
    initialMessage?: string,
    productId?: string,
  ): Promise<Conversation> {
    const response = await api.post("/chat/conversations", {
      user1Id,
      user2Id,
      initialMessage,
      productId,
    })
    return response.data
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await api.put(`/chat/conversations/${conversationId}/read`, { userId })
  }

  async getOrCreateConversation(user1Id: string, user2Id: string, productId?: string): Promise<Conversation> {
    const response = await api.post("/chat/conversations/get-or-create", {
      user1Id,
      user2Id,
      productId,
    })
    return response.data
  }
}

export const chatService = new ChatService()
