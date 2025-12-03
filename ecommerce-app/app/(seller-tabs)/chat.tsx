"use client"

// Seller Chat Screen - Real-time messaging with customers

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
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { ChatMessage } from "@/components/Chat/ChatMessage"
import { TypingIndicator } from "@/components/Chat/TypingIndicator"

// Quick reply templates for sellers
const QUICK_REPLIES = [
  "Cam on ban da quan tam san pham!",
  "San pham van con hang a",
  "Minh se gui hang trong 24h",
  "Ban co the dat hang truc tiep",
  "Xin loi, san pham hien da het hang",
  "Ban can ho tro gi them khong a?",
]

export default function SellerChatScreen() {
  const { conversationId, customerId, customerName } = useLocalSearchParams<{
    conversationId?: string
    customerId?: string
    customerName?: string
  }>()
  const { user } = useAuth()
  const {
    messages,
    currentConversation,
    sendMessage,
    sendImage,
    loading,
    uploading,
    isConnected,
    typingUsers,
    selectConversation,
    getOrCreateConversationById,
    startNewConversation,
    loadConversations,
    startTyping,
    stopTyping,
    markAsRead,
  } = useChat()

  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const initializeConversation = async () => {
      setInitializing(true)
      setInitError(null)

      try {
        if (conversationId) {
          console.log(`[v0] Seller: Initializing with conversationId: ${conversationId}`)

          const conversation = await getOrCreateConversationById(conversationId, customerId)

          if (conversation) {
            selectConversation(conversation)
            markAsRead(conversation.id)
          } else {
            setInitError("Khong tim thay cuoc tro chuyen")
          }
        } else if (customerId && user?.id) {
          console.log(`[v0] Seller: Creating new conversation with customer: ${customerId}`)

          const conversation = await startNewConversation(customerId, customerName || "Khach hang")

          if (conversation) {
            router.replace({
              pathname: "/(seller-tabs)/chat",
              params: { conversationId: conversation.id },
            })
          }
        } else {
          setInitError("Thieu thong tin cuoc tro chuyen")
        }
      } catch (error) {
        console.error("[v0] Seller: Error initializing conversation:", error)
        setInitError("Khong the tai cuoc tro chuyen")
      } finally {
        setInitializing(false)
      }
    }

    if (user?.id) {
      initializeConversation()
    }
  }, [conversationId, customerId, user?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Handle text input
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

  // Send message handler
  const handleSendMessage = async (text?: string) => {
    const messageText = text || newMessage.trim()
    if (!messageText || sending) return

    setSending(true)
    stopTyping()
    setShowQuickReplies(false)

    try {
      await sendMessage(messageText)
      setNewMessage("")
    } catch (error) {
      console.error("[SellerChat] Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  // Send quick reply
  const handleQuickReply = (text: string) => {
    handleSendMessage(text)
  }

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Thong bao", "Can cap quyen truy cap thu vien anh de gui hinh")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        console.log("[v0] Selected image:", result.assets[0].uri)
        await sendImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("[SellerChat] Error picking image:", error)
      Alert.alert("Loi", "Khong the chon hinh anh")
    }
  }

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Thong bao", "Can cap quyen truy cap camera de chup hinh")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        console.log("[v0] Captured photo:", result.assets[0].uri)
        await sendImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("[SellerChat] Error taking photo:", error)
      Alert.alert("Loi", "Khong the chup hinh")
    }
  }

  // Check if message is from current user
  const isOwnMessage = (senderId: string) => {
    return senderId === user?.id?.toString()
  }

  // Get typing status
  const currentTypingUser = currentConversation ? typingUsers.get(currentConversation.id) : null

  // Loading state
  if (initializing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Dang tai cuoc tro chuyen...</Text>
      </SafeAreaView>
    )
  }

  if (initError || !currentConversation) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-600 mt-4 text-lg">{initError || "Khong tim thay cuoc tro chuyen"}</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-6 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Quay lai</Text>
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

        <Image source={{ uri: currentConversation.participantAvatar }} className="w-10 h-10 rounded-full bg-gray-200" />

        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="font-semibold text-gray-900 text-lg">{currentConversation.participantName}</Text>
            <View className="ml-2 bg-green-100 px-2 py-0.5 rounded">
              <Text className="text-green-600 text-xs">Khach hang</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-1 ${currentConversation.isOnline ? "bg-green-500" : "bg-gray-400"}`}
            />
            <Text className="text-gray-500 text-xs">
              {currentConversation.isOnline ? "Dang hoat dong" : "Khong hoat dong"}
            </Text>
            {!isConnected && <Text className="text-red-500 text-xs ml-2">(Mat ket noi)</Text>}
          </View>
        </View>

        <TouchableOpacity className="ml-2 p-2" onPress={() => setShowQuickReplies(!showQuickReplies)}>
          <Ionicons name="flash-outline" size={22} color={showQuickReplies ? "#3B82F6" : "#6B7280"} />
        </TouchableOpacity>

        <TouchableOpacity className="ml-1 p-2">
          <Ionicons name="ellipsis-vertical" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Quick Replies Panel */}
      {showQuickReplies && (
        <View className="bg-white border-b border-gray-100 px-4 py-2">
          <Text className="text-xs text-gray-500 mb-2">Tra loi nhanh:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_REPLIES.map((reply, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickReply(reply)}
                className="bg-blue-50 px-3 py-2 rounded-xl mr-2"
              >
                <Text className="text-blue-600 text-sm">{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages Area */}
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
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">Dang tai tin nhan...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">Chua co tin nhan nao</Text>
              <Text className="text-gray-400 text-center mt-2">Hay bat dau tro chuyen voi khach hang</Text>
            </View>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} isOwn={isOwnMessage(message.senderId)} />
              ))}

              {/* Typing indicator */}
              {currentTypingUser && <TypingIndicator userName={currentTypingUser.userName} />}
            </>
          )}
        </ScrollView>

        {uploading && (
          <View className="bg-blue-50 px-4 py-2 flex-row items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-blue-600 ml-2 text-sm">Dang tai hinh anh...</Text>
          </View>
        )}

        {/* Input Area */}
        <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-center">
          <TouchableOpacity className="mr-2 p-1" onPress={handlePickImage} disabled={uploading}>
            <Ionicons name="image-outline" size={26} color={uploading ? "#D1D5DB" : "#6B7280"} />
          </TouchableOpacity>

          <TouchableOpacity className="mr-2 p-1" onPress={handleTakePhoto} disabled={uploading}>
            <Ionicons name="camera-outline" size={26} color={uploading ? "#D1D5DB" : "#6B7280"} />
          </TouchableOpacity>

          <TouchableOpacity className="mr-2 p-1">
            <Ionicons name="pricetag-outline" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 mx-1">
            <TextInput
              value={newMessage}
              onChangeText={handleTextChange}
              placeholder="Nhap tin nhan..."
              className="text-gray-900 max-h-24"
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={!newMessage.trim() || sending || uploading}
            className={`ml-2 p-2 rounded-full ${newMessage.trim() && !sending && !uploading ? "bg-blue-500" : "bg-gray-300"}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() && !sending && !uploading ? "white" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
