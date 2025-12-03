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
  const [typingUsers, setTypingUsers] = useState<Map<string, { userName: string }>>(new Map())
  const [uploading, setUploading] = useState(false)

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentConversationRef = useRef<Conversation | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    currentConversationRef.current = currentConversation
  }, [currentConversation])

  const clearError = () => setError(null)

  // ... existing code for loadConversations, loadMessages ...

  // Load all conversations for the current user
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
      console.error("[useChat] Error loading conversations:", err)
      setError("Khong the tai danh sach tro chuyen")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load messages for a specific conversation
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

        // Mark messages as read
        if (user?.id) {
          await chatService.markAsRead(conversationId, user.id.toString())
          emit("message:read", {
            conversationId: Number(conversationId),
            userId: user.id,
          })
        }
      } catch (err) {
        console.error("[useChat] Error loading messages:", err)
        setError("Khong the tai tin nhan")
      } finally {
        setLoading(false)
      }
    },
    [user?.id, emit],
  )

  // Send a new message
  const sendMessage = useCallback(
    async (text: string, productId?: string) => {
      if (!currentConversationRef.current || !user?.id) {
        setError("No active conversation or user")
        return
      }

      const conversation = currentConversationRef.current
      const tempId = `temp_${Date.now()}`

      // Optimistic update - show message immediately
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

      // Emit via socket for real-time delivery
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

      // Save to database
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

        // Update conversation list
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
        console.error("[useChat] Error saving message:", err)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId))
        setError("Khong the gui tin nhan")
      }
    },
    [user, emit],
  )

  const sendImage = useCallback(
    async (imageUri: string) => {
      if (!currentConversationRef.current || !user?.id) {
        setError("No active conversation or user")
        return
      }

      const conversation = currentConversationRef.current
      const tempId = `temp_img_${Date.now()}`

      setUploading(true)

      // Optimistic update - show image immediately with local URI
      const optimisticMessage: Message = {
        id: tempId,
        tempId,
        conversationId: conversation.id,
        senderId: user.id.toString(),
        receiverId: conversation.participantId,
        senderType: user.userType as "customer" | "seller",
        senderName: user.fullName,
        text: imageUri,
        messageType: "image",
        imageUrl: imageUri,
        isRead: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      try {
        // Upload image to Cloudinary
        const cloudinaryUrl = await chatService.uploadImage(imageUri)

        // Send message with Cloudinary URL
        const savedMessage = await chatService.sendImageMessage(
          conversation.id,
          user.id.toString(),
          conversation.participantId,
          cloudinaryUrl,
        )

        // Replace optimistic message with saved one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...savedMessage, imageUrl: cloudinaryUrl, tempId: undefined } : msg,
          ),
        )

        // Emit via socket for real-time delivery
        emit("message:send", {
          conversationId: Number(conversation.id),
          senderId: user.id,
          receiverId: Number(conversation.participantId),
          content: cloudinaryUrl,
          messageType: "image",
          tempId,
          senderType: user.userType,
          senderName: user.fullName,
        })

        // Update conversation list
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === conversation.id
                ? {
                    ...conv,
                    lastMessage: "[Hinh anh]",
                    lastMessageTime: new Date(),
                    unreadCount: 0,
                  }
                : conv,
            )
            .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()),
        )
      } catch (err) {
        console.error("[useChat] Error sending image:", err)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId))
        setError("Khong the gui hinh anh")
      } finally {
        setUploading(false)
      }
    },
    [user, emit],
  )

  // ... existing code for selectConversation, markAsRead, startTyping, stopTyping ...

  // Select and join a conversation
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

  // Mark messages as read
  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!user?.id) return

      try {
        await chatService.markAsRead(conversationId, user.id.toString())
        emit("message:read", {
          conversationId: Number(conversationId),
          userId: user.id,
        })

        // Update unread count in conversations list
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)),
        )
      } catch (err) {
        console.error("[useChat] Error marking as read:", err)
      }
    },
    [user?.id, emit],
  )

  // Start typing indicator
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

  // Stop typing indicator
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

  // Start a new conversation with another user
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
          participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            participantName,
          )}&background=random`,
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
        console.error("[useChat] Error starting new conversation:", err)
        setError("Khong the bat dau tro chuyen")
        throw err
      }
    },
    [user, selectConversation, sendMessage],
  )

  const getOrCreateConversationById = useCallback(
    async (conversationId: string, participantId?: string): Promise<Conversation | null> => {
      if (!user?.id) {
        console.error("[useChat] User not authenticated")
        return null
      }

      try {
        // First check in current list
        const existingConv = conversations.find((conv) => conv.id === conversationId)
        if (existingConv) {
          console.log(`[useChat] Found conversation ${conversationId} in local list`)
          return existingConv
        }

        // If participantId is provided, use get-or-create endpoint
        if (participantId) {
          console.log(`[useChat] Creating conversation with participant ${participantId}`)
          const newConversation = await chatService.getOrCreateConversation(user.id.toString(), participantId)

          // Add to conversations list
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === newConversation.id)
            if (exists) return prev
            return [newConversation, ...prev]
          })

          return newConversation
        }

        // Try to fetch from API by loading all conversations
        console.log(`[useChat] Fetching conversations from API to find ${conversationId}`)
        const allConversations = await chatService.getConversations(user.id.toString())
        setConversations(allConversations)

        const foundConv = allConversations.find((conv) => conv.id === conversationId)
        if (foundConv) {
          console.log(`[useChat] Found conversation ${conversationId} from API`)
          return foundConv
        }

        console.warn(`[useChat] Conversation ${conversationId} not found`)
        return null
      } catch (err) {
        console.error("[useChat] Error getting conversation:", err)
        return null
      }
    },
    [user?.id, conversations],
  )

  const getConversationById = useCallback(
    async (conversationId: string): Promise<Conversation | null> => {
      return getOrCreateConversationById(conversationId)
    },
    [getOrCreateConversationById],
  )

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return

    // Handle new messages from socket
    const handleNewMessage = (message: any) => {
      const currentConv = currentConversationRef.current

      const formattedMessage: Message = {
        id: message.id?.toString() || message.tempId,
        tempId: message.tempId,
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString(),
        senderType: message.senderType,
        senderName: message.senderName,
        text: message.content || message.text,
        messageType: message.messageType || "text",
        imageUrl: message.messageType === "image" ? message.content || message.text : undefined,
        productId: message.productId?.toString(),
        isRead: message.isRead || false,
        timestamp: new Date(message.createdAt || message.timestamp || Date.now()),
      }

      // Only add if it's for the current conversation and not our own message
      if (
        currentConv &&
        formattedMessage.conversationId === currentConv.id &&
        formattedMessage.senderId !== user?.id?.toString()
      ) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(
            (m) => m.id === formattedMessage.id || (m.tempId && m.tempId === formattedMessage.tempId),
          )
          if (exists) return prev
          return [...prev, formattedMessage]
        })
      }

      // Update conversation list
      setConversations((prev) =>
        prev
          .map((conv) => {
            if (conv.id === formattedMessage.conversationId) {
              const isCurrentConv = currentConv?.id === conv.id
              const lastMessageText = formattedMessage.messageType === "image" ? "[Hinh anh]" : formattedMessage.text
              return {
                ...conv,
                lastMessage: lastMessageText,
                lastMessageTime: formattedMessage.timestamp,
                unreadCount: isCurrentConv ? 0 : conv.unreadCount + 1,
              }
            }
            return conv
          })
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()),
      )
    }

    // Handle typing indicators
    const handleTypingStart = (data: {
      userId: number
      userName?: string
      conversationId: number
    }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev)
          newMap.set(data.conversationId.toString(), {
            userName: data.userName || "Someone",
          })
          return newMap
        })

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

    // Handle online status changes
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
    const handleMessageRead = (data: {
      conversationId: number
      userId: number
    }) => {
      if (data.userId !== user?.id && currentConversationRef.current?.id === data.conversationId.toString()) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === user?.id?.toString() ? { ...msg, isRead: true } : msg)),
        )
      }
    }

    // Subscribe to socket events
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
    uploading,
    sendMessage,
    sendImage,
    selectConversation,
    startNewConversation,
    loadConversations,
    loadMessages,
    clearError,
    getConversationById,
    getOrCreateConversationById,
    startTyping,
    stopTyping,
    markAsRead,
  }
}
