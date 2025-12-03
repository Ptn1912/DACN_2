"use client"

// Seller Inbox Screen - List of Customer Conversations

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useChat } from "@/hooks/useChat"
import type { Conversation } from "@/types/chat"

export default function SellerInboxScreen() {
  const { conversations, loading, error, isConnected, typingUsers, selectConversation, loadConversations, clearError } =
    useChat()

  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (error) {
      Alert.alert("Loi", error, [{ text: "OK", onPress: () => clearError() }])
    }
  }, [error, clearError])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadConversations()
    setRefreshing(false)
  }, [loadConversations])

  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation)
    router.push({
      pathname: "/(seller-tabs)/chat",
      params: { conversationId: conversation.id },
    })
  }

  const formatTime = (date: Date | string) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("vi-VN", { weekday: "short" })
    } else {
      return messageDate.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const isTyping = (conversationId: string) => {
    return typingUsers.has(conversationId)
  }

  // Filter conversations
  const filteredConversations = filter === "unread" ? conversations.filter((c) => c.unreadCount > 0) : conversations

  // Count unread
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-gray-900">Tin nhan</Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <Text className="text-xs text-gray-500">{isConnected ? "Truc tuyen" : "Ngoai tuyen"}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl mr-2 ${filter === "all" ? "bg-blue-500" : "bg-gray-100"}`}
          >
            <Text className={`text-sm font-medium ${filter === "all" ? "text-white" : "text-gray-600"}`}>
              Tat ca ({conversations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl flex-row items-center ${
              filter === "unread" ? "bg-blue-500" : "bg-gray-100"
            }`}
          >
            <Text className={`text-sm font-medium ${filter === "unread" ? "text-white" : "text-gray-600"}`}>
              Chua doc
            </Text>
            {totalUnread > 0 && (
              <View className={`ml-2 px-1.5 py-0.5 rounded-full ${filter === "unread" ? "bg-white" : "bg-red-500"}`}>
                <Text className={`text-xs font-bold ${filter === "unread" ? "text-blue-500" : "text-white"}`}>
                  {totalUnread > 99 ? "99+" : totalUnread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading && conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-4">Dang tai tin nhan...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-4">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-lg font-medium">
              {filter === "unread" ? "Khong co tin nhan chua doc" : "Chua co tin nhan"}
            </Text>
            <Text className="text-gray-400 text-center mt-2">Tin nhan tu khach hang se xuat hien o day</Text>
          </View>
        ) : (
          filteredConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              className={`flex-row items-center px-4 py-3 border-b border-gray-50 ${
                conversation.unreadCount > 0 ? "bg-blue-50" : ""
              }`}
              onPress={() => handleSelectConversation(conversation)}
            >
              <View className="relative">
                <Image
                  source={{ uri: conversation.participantAvatar }}
                  className="w-14 h-14 rounded-full bg-gray-200"
                />
                {conversation.isOnline && (
                  <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center flex-1">
                    <Text
                      className={`text-base ${
                        conversation.unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-900"
                      }`}
                    >
                      {conversation.participantName}
                    </Text>
                    <View className="ml-2 bg-green-100 px-2 py-0.5 rounded">
                      <Text className="text-green-600 text-xs">Khach hang</Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-xs">{formatTime(conversation.lastMessageTime)}</Text>
                </View>

                <View className="flex-row justify-between items-center mt-1">
                  {isTyping(conversation.id) ? (
                    <View className="flex-row items-center">
                      <Text className="text-blue-500 text-sm italic">dang nhap...</Text>
                    </View>
                  ) : (
                    <Text
                      className={`text-sm flex-1 mr-2 ${
                        conversation.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                      }`}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage || "Bat dau tro chuyen"}
                    </Text>
                  )}
                  {conversation.unreadCount > 0 && (
                    <View className="bg-red-500 rounded-full min-w-6 h-6 items-center justify-center">
                      <Text className="text-white text-xs font-bold px-1.5">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}