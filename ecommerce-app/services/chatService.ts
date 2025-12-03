// Chat Service - API calls for chat functionality

import type { Message, Conversation } from "@/types/chat"
import api from "./api"

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dkdwmkpwd"
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "chat_images"

class ChatService {
  // Get all conversations for a user
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await api.get(`/chat/conversations?userId=${userId}`)
      return response.data
    } catch (error) {
      console.error("[ChatService] Error getting conversations:", error)
      throw error
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`)
      return response.data.map((msg: any) => ({
        id: msg.id.toString(),
        conversationId: msg.conversationId.toString(),
        senderId: msg.senderId.toString(),
        receiverId: msg.receiverId.toString(),
        text: msg.text || msg.content,
        messageType: msg.messageType,
        imageUrl: msg.messageType === "image" ? msg.text || msg.content : undefined,
        productId: msg.productId?.toString(),
        productName: msg.productName,
        productImage: msg.productImage,
        productPrice: msg.productPrice,
        isRead: msg.isRead,
        timestamp: new Date(msg.timestamp || msg.createdAt),
      }))
    } catch (error) {
      console.error("[ChatService] Error getting messages:", error)
      throw error
    }
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    productId?: string,
  ): Promise<Message> {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        senderId: Number(senderId),
        receiverId: Number(receiverId),
        text: text,
        messageType: productId ? "product" : "text",
        productId: productId ? Number(productId) : undefined,
      })

      const msg = response.data
      return {
        id: msg.id.toString(),
        conversationId: msg.conversationId.toString(),
        senderId: msg.senderId.toString(),
        receiverId: msg.receiverId.toString(),
        text: msg.text || msg.content,
        messageType: msg.messageType,
        productId: msg.productId?.toString(),
        productName: msg.productName,
        productImage: msg.productImage,
        productPrice: msg.productPrice,
        isRead: msg.isRead,
        timestamp: new Date(msg.timestamp || msg.createdAt),
      }
    } catch (error) {
      console.error("[ChatService] Error sending message:", error)
      throw error
    }
  }

  // Create a new conversation
  async createConversation(
    user1Id: string,
    user2Id: string,
    initialMessage?: string,
    productId?: string,
  ): Promise<Conversation> {
    try {
      const response = await api.post("/chat/conversations", {
        user1Id: Number(user1Id),
        user2Id: Number(user2Id),
        initialMessage,
        productId: productId ? Number(productId) : undefined,
      })
      return this.mapConversationResponse(response.data)
    } catch (error) {
      console.error("[ChatService] Error creating conversation:", error)
      throw error
    }
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`, {
        userId: Number(userId),
      })
    } catch (error) {
      console.error("[ChatService] Error marking as read:", error)
      throw error
    }
  }

  // Get or create conversation between two users
  async getOrCreateConversation(user1Id: string, user2Id: string, productId?: string): Promise<Conversation> {
    try {
      const response = await api.post("/chat/conversations/get-or-create", {
        user1Id: Number(user1Id),
        user2Id: Number(user2Id),
        productId: productId ? Number(productId) : undefined,
      })
      return this.mapConversationResponse(response.data)
    } catch (error) {
      console.error("[ChatService] Error get or create conversation:", error)
      throw error
    }
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const conversations = await this.getConversations(userId)
      return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)
    } catch (error) {
      console.error("[ChatService] Error getting unread count:", error)
      return 0
    }
  }

  async uploadImage(imageUri: string): Promise<string> {
    try {
      console.log("[ChatService] Starting direct Cloudinary upload...")
      console.log("[ChatService] Cloud name:", CLOUDINARY_CLOUD_NAME)
      console.log("[ChatService] Upload preset:", CLOUDINARY_UPLOAD_PRESET)

      // Get file extension and type
      const uriParts = imageUri.split(".")
      const fileType = uriParts[uriParts.length - 1].toLowerCase()
      const mimeType = fileType === "jpg" ? "image/jpeg" : `image/${fileType}`

      // Create FormData for Cloudinary direct upload
      const formData = new FormData()
      formData.append("file", {
        uri: imageUri,
        name: `chat_image_${Date.now()}.${fileType}`,
        type: mimeType,
      } as any)
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
      formData.append("folder", "chat_images")

      // Upload directly to Cloudinary API
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      console.log("[ChatService] Uploading to:", cloudinaryUrl)

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      })

      console.log("[ChatService] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[ChatService] Cloudinary error:", errorText)
        throw new Error(`Cloudinary upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("[ChatService] Upload success:", data.secure_url)

      return data.secure_url
    } catch (error) {
      console.error("[ChatService] Error uploading image:", error)
      throw error
    }
  }

  async sendImageMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    imageUrl: string,
  ): Promise<Message> {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        senderId: Number(senderId),
        receiverId: Number(receiverId),
        text: imageUrl,
        messageType: "image",
      })

      const msg = response.data
      return {
        id: msg.id.toString(),
        conversationId: msg.conversationId.toString(),
        senderId: msg.senderId.toString(),
        receiverId: msg.receiverId.toString(),
        text: msg.text || msg.content,
        messageType: msg.messageType,
        imageUrl: msg.messageType === "image" ? msg.text || msg.content : undefined,
        productId: msg.productId?.toString(),
        productName: msg.productName,
        productImage: msg.productImage,
        productPrice: msg.productPrice,
        isRead: msg.isRead,
        timestamp: new Date(msg.timestamp || msg.createdAt),
      }
    } catch (error) {
      console.error("[ChatService] Error sending image message:", error)
      throw error
    }
  }

  // Helper to map API response to Conversation type
  private mapConversationResponse(data: any): Conversation {
    return {
      id: data.id.toString(),
      participantId: data.participantId?.toString() || data.user2Id?.toString(),
      participantName: data.participantName || data.user2?.fullName || "User",
      participantAvatar:
        data.participantAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.participantName || "U")}&background=random`,
      participantType: data.participantType || "customer",
      lastMessage: data.lastMessage || "",
      lastMessageTime: new Date(data.lastMessageTime || data.createdAt),
      unreadCount: data.unreadCount || 0,
      isOnline: data.isOnline || false,
    }
  }
}

export const chatService = new ChatService()
