"use client"

// Chat Hook with Socket.IO Real-time Support

import { useState, useEffect, useCallback, useRef } from "react"
import type { Message, Conversation } from "@/types/chat"
import { chatService } from "@/services/chatService"
import { useAuth } from "./useAuth"
import { useSocket } from "./useSocket"

export const useChat = () => {
  const { user } = useAuth()
  const { socket, isConnected, emit, on, off, joinConversation, leaveConversation } = useSocket()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentConversationRef = useRef<Conversation | null>(null)

  // Keep ref in sync
  useEffect(() => {
    currentConversationRef.current = currentConversation
  }, [currentConversation])

  const clearError = () => setError(null)

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setError("User not authenticated")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await chatService.getConversations(user.id.toString())
      setConversations(data)
    } catch (err) {
      console.error("Error loading conversations:", err)
      setError("Không thể tải danh sách trò chuyện")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!conversationId) {
        setError("No conversation ID provided")
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await chatService.getMessages(conversationId)
        setMessages(data)

        // Mark as read
        if (user?.id) {
          await chatService.markAsRead(conversationId, user.id.toString())
          emit("message:read", {
            conversationId: Number(conversationId),
            userId: user.id,
          })
        }
      } catch (err) {
        console.error("Error loading messages:", err)
        setError("Không thể tải tin nhắn")
      } finally {
        setLoading(false)
      }
    },
    [user?.id, emit],
  )

  // Send message
  const sendMessage = useCallback(
    async (text: string, productId?: string) => {
      if (!currentConversationRef.current || !user?.id) {
        setError("No active conversation or user")
        return
      }

      const conversation = currentConversationRef.current
      const tempId = `temp_${Date.now()}`

      // Optimistic update
      const optimisticMessage: Message = {
        id: tempId,
        tempId,
        conversationId: conversation.id,
        senderId: user.id.toString(),
        receiverId: conversation.participantId,
        senderType: user.userType as "customer" | "seller",
        senderName: user.fullName,
        text,
        messageType: productId ? "product" : "text",
        productId,
        isRead: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      // Emit via socket for real-time
      emit("message:send", {
        conversationId: Number(conversation.id),
        senderId: user.id,
        receiverId: Number(conversation.participantId),
        content: text,
        messageType: productId ? "product" : "text",
        productId: productId ? Number(productId) : undefined,
        tempId,
        senderType: user.userType,
        senderName: user.fullName,
      })

      // Also save to database
      try {
        const savedMessage = await chatService.sendMessage(
          conversation.id,
          user.id.toString(),
          conversation.participantId,
          text,
          productId,
        )

        // Replace optimistic message with saved one
        setMessages((prev) => prev.map((msg) => (msg.tempId === tempId ? { ...savedMessage, tempId: undefined } : msg)))

        // Update conversations list
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === conversation.id
                ? {
                    ...conv,
                    lastMessage: text,
                    lastMessageTime: new Date(),
                    unreadCount: 0,
                  }
                : conv,
            )
            .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()),
        )
      } catch (err) {
        console.error("Error saving message:", err)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId))
        setError("Không thể gửi tin nhắn")
      }
    },
    [user, emit],
  )

  // Select conversation
  const selectConversation = useCallback(
    (conversation: Conversation) => {
      // Leave previous conversation room
      if (currentConversationRef.current) {
        leaveConversation(currentConversationRef.current.id)
      }

      setCurrentConversation(conversation)
      setMessages([])

      // Join new conversation room
      joinConversation(conversation.id)

      // Load messages
      loadMessages(conversation.id)
    },
    [joinConversation, leaveConversation, loadMessages],
  )

  // Start typing
  const startTyping = useCallback(() => {
    if (!currentConversationRef.current || !user?.id) return

    emit("typing:start", {
      conversationId: Number(currentConversationRef.current.id),
      userId: user.id,
      userName: user.fullName,
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [user, emit])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!currentConversationRef.current || !user?.id) return

    emit("typing:stop", {
      conversationId: Number(currentConversationRef.current.id),
      userId: user.id,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [user, emit])

  // Start new conversation
  const startNewConversation = useCallback(
    async (participantId: string, participantName: string, initialMessage?: string, productId?: string) => {
      if (!user?.id) {
        setError("User not authenticated")
        throw new Error("User not authenticated")
      }

      setError(null)
      try {
        const newConversation = await chatService.getOrCreateConversation(user.id.toString(), participantId, productId)

        const conversationWithParticipant = {
          ...newConversation,
          participantName,
          participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random`,
        }

        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conversationWithParticipant.id)
          if (exists) {
            return prev
          }
          return [conversationWithParticipant, ...prev]
        })

        selectConversation(conversationWithParticipant)

        if (initialMessage) {
          await sendMessage(initialMessage, productId)
        }

        return conversationWithParticipant
      } catch (err) {
        console.error("Error starting new conversation:", err)
        setError("Không thể bắt đầu trò chuyện")
        throw err
      }
    },
    [user, selectConversation, sendMessage],
  )

  // Get conversation by ID
  // ✅ FIX: Thêm await cho loadConversations() và tăng delay
const getConversationById = useCallback(
  async (conversationId: string): Promise<Conversation | null> => {
    // Retry up to 3 times with increasing delay
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Check in current list
        const existingConv = conversations.find((conv) => conv.id === conversationId)
        if (existingConv) {
          console.log(`[useChat] Found conversation ${conversationId} on attempt ${attempt + 1}`)
          return existingConv
        }

        // If not found on first attempt, reload conversations
        if (attempt === 0) {
          console.log(`[useChat] Reloading conversations to find ${conversationId}`)
          // ✅ PHẢI AWAIT! Chờ API trả về dữ liệu
          await loadConversations()
          
          // Kiểm tra lại sau khi load
          const foundConv = conversations.find((conv) => conv.id === conversationId)
          if (foundConv) {
            console.log(`[useChat] Found after reload on attempt ${attempt + 1}`)
            return foundConv
          }
        }

        // Tăng delay cho mỗi lần retry
        const delay = attempt === 0 ? 800 : 1200
        console.log(`[useChat] Not found, retrying in ${delay}ms... (attempt ${attempt + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } catch (err) {
        console.error(`[useChat] Error on attempt ${attempt + 1}:`, err)
        if (attempt === 2) {
          return null
        }
        // Chờ trước khi retry tiếp
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.warn(`[useChat] Conversation ${conversationId} not found after 3 attempts`)
    return null
  },
  [conversations, loadConversations],
)

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return

    // Handle new messages
    const handleNewMessage = (message: Message) => {
      const currentConv = currentConversationRef.current

      // Only add if it's for the current conversation and not our own message
      if (currentConv && message.conversationId === currentConv.id) {
        setMessages((prev) => {
          // Check if message already exists (by id or tempId)
          const exists = prev.some((m) => m.id === message.id || (m.tempId && m.tempId === message.tempId))
          if (exists) return prev
          return [...prev, message]
        })
      }

      // Update conversation list
      setConversations((prev) =>
        prev
          .map((conv) => {
            if (conv.id === message.conversationId) {
              const isCurrentConv = currentConv?.id === conv.id
              return {
                ...conv,
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                unreadCount: isCurrentConv ? 0 : conv.unreadCount + 1,
              }
            }
            return conv
          })
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()),
      )
    }

    // Handle typing indicators
    const handleTypingStart = (data: { userId: number; userName?: string; conversationId: number }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev)
          newMap.set(data.conversationId.toString(), data.userName || "Someone")
          return newMap
        })

        // Update conversation typing status
        setConversations((prev) =>
          prev.map((conv) => (conv.id === data.conversationId.toString() ? { ...conv, isTyping: true } : conv)),
        )
      }
    }

    const handleTypingStop = (data: { userId: number; conversationId: number }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev)
          newMap.delete(data.conversationId.toString())
          return newMap
        })

        setConversations((prev) =>
          prev.map((conv) => (conv.id === data.conversationId.toString() ? { ...conv, isTyping: false } : conv)),
        )
      }
    }

    // Handle online status
    const handleUserOnline = (data: { userId: number; isOnline: boolean }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === data.userId.toString() ? { ...conv, isOnline: data.isOnline } : conv,
        ),
      )

      if (currentConversationRef.current?.participantId === data.userId.toString()) {
        setCurrentConversation((prev) => (prev ? { ...prev, isOnline: data.isOnline } : prev))
      }
    }

    // Handle read receipts
    const handleMessageRead = (data: { conversationId: number; userId: number }) => {
      if (data.userId !== user?.id && currentConversationRef.current?.id === data.conversationId.toString()) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === user?.id.toString() ? { ...msg, isRead: true } : msg)),
        )
      }
    }

    // Subscribe to events
    const unsubNewMessage = on("message:new", handleNewMessage)
    const unsubTypingStart = on("typing:start", handleTypingStart)
    const unsubTypingStop = on("typing:stop", handleTypingStop)
    const unsubUserOnline = on("user:online", handleUserOnline)
    const unsubMessageRead = on("message:read", handleMessageRead)

    return () => {
      unsubNewMessage()
      unsubTypingStart()
      unsubTypingStop()
      unsubUserOnline()
      unsubMessageRead()
    }
  }, [isConnected, user?.id, on])

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
  }, [user?.id, loadConversations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentConversationRef.current) {
        leaveConversation(currentConversationRef.current.id)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [leaveConversation])

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    isConnected,
    typingUsers,
    sendMessage,
    selectConversation,
    startNewConversation,
    loadConversations,
    loadMessages,
    clearError,
    getConversationById,
    startTyping,
    stopTyping,
  }
}
