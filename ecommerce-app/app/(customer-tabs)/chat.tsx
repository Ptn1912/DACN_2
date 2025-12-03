"use client"

// Customer Chat Screen - Real-time messaging with sellers

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

export default function CustomerChatScreen() {
  const { conversationId, sellerId, sellerName } = useLocalSearchParams<{
    conversationId?: string
    sellerId?: string
    sellerName?: string
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
  const scrollViewRef = useRef<ScrollView>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ... existing useEffect for initializeConversation ...

  useEffect(() => {
    const initializeConversation = async () => {
      setInitializing(true)
      setInitError(null)

      try {
        if (conversationId) {
          console.log(`[v0] Initializing with conversationId: ${conversationId}`)

          const conversation = await getOrCreateConversationById(conversationId, sellerId)

          if (conversation) {
            selectConversation(conversation)
            markAsRead(conversation.id)
          } else {
            setInitError("Khong tim thay cuoc tro chuyen")
          }
        } else if (sellerId && user?.id) {
          console.log(`[v0] Creating new conversation with seller: ${sellerId}`)

          const conversation = await startNewConversation(sellerId, sellerName || "Nguoi ban")

          if (conversation) {
            router.replace({
              pathname: "/(customer-tabs)/chat",
              params: { conversationId: conversation.id },
            })
          }
        } else {
          setInitError("Thieu thong tin cuoc tro chuyen")
        }
      } catch (error) {
        console.error("[v0] Error initializing conversation:", error)
        setInitError("Khong the tai cuoc tro chuyen")
      } finally {
        setInitializing(false)
      }
    }

    if (user?.id) {
      initializeConversation()
    }
  }, [conversationId, sellerId, user?.id])

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
      console.error("[CustomerChat] Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Thong bao", "Can cap quyen truy cap thu vien anh de gui hinh")
        return
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        await sendImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("[CustomerChat] Error picking image:", error)
      Alert.alert("Loi", "Khong the chon hinh anh")
    }
  }

  const handleTakePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Thong bao", "Can cap quyen truy cap camera de chup hinh")
        return
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        await sendImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("[CustomerChat] Error taking photo:", error)
      Alert.alert("Loi", "Khong the chup hinh")
    }
  }

  const isOwnMessage = (senderId: string) => {
    return senderId === user?.id?.toString()
  }

  const currentTypingUser = currentConversation ? typingUsers.get(currentConversation.id) : null

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
        <TouchableOpacity className="mt-4 bg-blue-500 px-6 py-3 rounded-xl" onPress={() => router.push("/(customer-tabs)/inbox")}>
          <Text className="text-white font-semibold">Quay lai</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.push("/(customer-tabs)/inbox")} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Image source={{ uri: currentConversation.participantAvatar }} className="w-10 h-10 rounded-full bg-gray-200" />

        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 text-lg">{currentConversation.participantName}</Text>
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

        <TouchableOpacity className="ml-2 p-2">
          <Ionicons name="call-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>

        <TouchableOpacity className="ml-2 p-2">
          <Ionicons name="information-circle-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

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
              <Text className="text-gray-400 text-center mt-2">
                Hay bat dau cuoc tro chuyen voi {currentConversation.participantName}
              </Text>
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
            onPress={handleSendMessage}
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