"use client"

// Seller Chat Screen with Real-time Socket.IO

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"

export default function SellerChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>()
  const { user } = useAuth()
  const {
    messages,
    currentConversation,
    sendMessage,
    loading,
    isConnected,
    typingUsers,
    selectConversation,
    getConversationById,
    loadConversations,
    startTyping,
    stopTyping,
  } = useChat()

  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const [initializing, setInitializing] = useState(true)
  const typingTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    initializeConversation()
  }, [conversationId])

  const initializeConversation = async () => {
    if (conversationId) {
      try {
        await loadConversations()
        const conversation = await getConversationById(conversationId)
        if (conversation) {
          selectConversation(conversation)
        }
      } catch (error) {
        console.error("Error initializing conversation:", error)
      } finally {
        setInitializing(false)
      }
    } else {
      setInitializing(false)
    }
  }

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const handleTextChange = (text: string) => {
    setNewMessage(text)

    if (text.length > 0) {
      startTyping()

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping()
      }, 2000)
    } else {
      stopTyping()
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    stopTyping()

    try {
      await sendMessage(newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isOwnMessage = (senderId: string) => {
    return senderId === user?.id?.toString()
  }

  const currentTypingUser = currentConversation ? typingUsers.get(currentConversation.id) : null

  if (initializing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải cuộc trò chuyện...</Text>
      </SafeAreaView>
    )
  }

  if (!currentConversation) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-600 mt-4">Không tìm thấy cuộc trò chuyện</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Image source={{ uri: currentConversation.participantAvatar }} className="w-10 h-10 rounded-full" />

        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 text-lg">{currentConversation.participantName}</Text>
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-1 ${currentConversation.isOnline ? "bg-green-500" : "bg-gray-400"}`}
            />
            <Text className="text-gray-500 text-xs">
              {currentConversation.isOnline ? "Đang hoạt động" : "Không hoạt động"}
            </Text>
            {!isConnected && <Text className="text-red-500 text-xs ml-2">(Mất kết nối)</Text>}
          </View>
        </View>

        <TouchableOpacity className="ml-4">
          <Ionicons name="ellipsis-vertical" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {loading && messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">Đang tải tin nhắn...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">Chưa có tin nhắn nào</Text>
              <Text className="text-gray-400 text-center mt-2">Hãy bắt đầu trả lời khách hàng</Text>
            </View>
          ) : (
            <>
              {messages.map((message) => {
                const isOwn = isOwnMessage(message.senderId)
                return (
                  <View key={message.id} className={`my-1 ${isOwn ? "items-end" : "items-start"}`}>
                    <View
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isOwn ? "bg-blue-500 rounded-br-none" : "bg-white rounded-bl-none border border-gray-200"
                      }`}
                    >
                      {message.productName && (
                        <View className="bg-blue-50 rounded-lg p-2 mb-2 border border-blue-200">
                          <Text className="text-blue-800 text-xs font-medium">Sản phẩm: {message.productName}</Text>
                        </View>
                      )}
                      <Text className={isOwn ? "text-white" : "text-gray-800"}>{message.text}</Text>
                      <View className="flex-row items-center justify-end mt-1">
                        <Text className={`text-xs ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
                          {formatMessageTime(message.timestamp)}
                        </Text>
                        {isOwn && (
                          <Ionicons
                            name={message.isRead ? "checkmark-done" : "checkmark"}
                            size={14}
                            color={message.isRead ? "#93C5FD" : "#BFDBFE"}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                )
              })}

              {currentTypingUser && (
                <View className="items-start my-1">
                  <View className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                    <View className="flex-row items-center">
                      <Text className="text-gray-500 text-xs">đang nhập...</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-white border-t border-gray-100 py-2 px-2"
        >
          {["Cảm ơn bạn!", "Còn hàng ạ", "Hết hàng rồi ạ", "Ship COD được ạ"].map((reply) => (
            <TouchableOpacity
              key={reply}
              className="bg-gray-100 rounded-full px-3 py-1 mr-2"
              onPress={() => setNewMessage(reply)}
            >
              <Text className="text-gray-700 text-sm">{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-center">
          <TouchableOpacity className="mr-3">
            <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity className="mr-3">
            <Ionicons name="image-outline" size={26} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 mx-1">
            <TextInput
              value={newMessage}
              onChangeText={handleTextChange}
              placeholder="Nhập tin nhắn..."
              className="text-gray-900"
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`ml-2 p-2 rounded-full ${newMessage.trim() && !sending ? "bg-blue-500" : "bg-gray-300"}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Ionicons name="send" size={20} color={newMessage.trim() && !sending ? "white" : "#9CA3AF"} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
