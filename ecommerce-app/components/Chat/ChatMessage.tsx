// Reusable Chat Message Component

import type React from "react"
import { View, Text, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Message } from "@/types/chat"

interface ChatMessageProps {
  message: Message
  isOwn: boolean
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <View className={`my-1 ${isOwn ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwn ? "bg-blue-500 rounded-br-none" : "bg-white rounded-bl-none border border-gray-200"
        }`}
      >
        {/* Product Reference */}
        {message.productName && (
          <View className="bg-blue-50 rounded-lg p-2 mb-2 border border-blue-200 flex-row items-center">
            {message.productImage && (
              <Image source={{ uri: message.productImage }} className="w-10 h-10 rounded mr-2" />
            )}
            <View className="flex-1">
              <Text className="text-blue-800 text-xs font-medium" numberOfLines={1}>
                {message.productName}
              </Text>
              {message.productPrice && (
                <Text className="text-blue-600 text-xs">{Number(message.productPrice).toLocaleString("vi-VN")}đ</Text>
              )}
            </View>
          </View>
        )}

        {/* Message Text */}
        <Text className={isOwn ? "text-white" : "text-gray-800"}>{message.text}</Text>

        {/* Timestamp and Read Status */}
        <View className="flex-row items-center justify-end mt-1">
          <Text className={`text-xs ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
            {formatTime(message.timestamp)}
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
}
