"use client"

import type React from "react"
import { useState, useCallback, memo } from "react"
import { View, Text, Image, TouchableOpacity, Modal, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Message } from "@/types/chat"

interface ChatMessageProps {
  message: Message
  isOwn: boolean
  onImagePress?: (imageUrl: string) => void
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn,
  onImagePress 
}) => {
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [productImageError, setProductImageError] = useState(false)
  
  const screenWidth = Dimensions.get("window").width

  // ✅ Hàm kiểm tra URL có phải ảnh không
  const isImageUrl = useCallback((url: string): boolean => {
    if (!url) return false
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"]
    const lowerUrl = url.toLowerCase()
    
    // Kiểm tra extension
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return true
    }
    
    // Kiểm tra Cloudinary URL
    if (lowerUrl.includes("cloudinary.com") && lowerUrl.includes("/image/upload/")) {
      return true
    }
    
    return false
  }, [])

  const formatTime = useCallback((date: Date | string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  // ✅ CẬP NHẬT: Kiểm tra messageType hoặc URL
  const imageUrl = useCallback(() => {
    if (message.messageType === "image") {
      return message.imageUrl || message.text
    }
    
    // Nếu không có messageType nhưng text là URL ảnh
    if (isImageUrl(message.text)) {
      return message.text
    }
    
    return null
  }, [message, isImageUrl])()

  const handleImagePress = useCallback(() => {
    if (imageUrl && onImagePress) {
      onImagePress(imageUrl)
    }
    setShowImagePreview(true)
  }, [imageUrl, onImagePress])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleProductImageError = useCallback(() => {
    setProductImageError(true)
  }, [])

  return (
    <View className={`my-1 ${isOwn ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] rounded-2xl ${
          imageUrl ? "p-1" : "px-4 py-3"
        } ${
          isOwn 
            ? "bg-blue-500 rounded-br-none" 
            : "bg-white rounded-bl-none border border-gray-200"
        }`}
      >
        {/* Product Reference */}
        {message.productName && (
          <View className="bg-blue-50 rounded-lg p-2 mb-2 border border-blue-200 flex-row items-center">
            {message.productImage && !productImageError ? (
              <Image 
                source={{ uri: message.productImage }} 
                className="w-10 h-10 rounded mr-2"
                onError={handleProductImageError}
              />
            ) : (
              <View className="w-10 h-10 rounded mr-2 bg-gray-200 items-center justify-center">
                <Ionicons name="cube-outline" size={20} color="#6b7280" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-blue-800 text-xs font-medium" numberOfLines={1}>
                {message.productName}
              </Text>
              {message.productPrice !== undefined && (
                <Text className="text-blue-600 text-xs">
                  {message.productPrice.toLocaleString("vi-VN")}đ
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ✅ CẬP NHẬT: Hiển thị ảnh hoặc text */}
        {imageUrl ? (
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
            {imageError ? (
              <View 
                className="rounded-xl bg-gray-200 items-center justify-center"
                style={{ width: screenWidth * 0.6, height: screenWidth * 0.6 }}
              >
                <Ionicons name="image-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-500 text-xs mt-2">Không thể tải ảnh</Text>
              </View>
            ) : (
              <Image
                source={{ uri: imageUrl }}
                className="rounded-xl"
                style={{ 
                  width: screenWidth * 0.6, 
                  height: screenWidth * 0.6, 
                  resizeMode: "cover" 
                }}
                onError={handleImageError}
              />
            )}
          </TouchableOpacity>
        ) : (
          /* Text Message */
          <Text 
            className={`${isOwn ? "text-white" : "text-gray-800"}`}
            selectable
          >
            {message.text}
          </Text>
        )}

        {/* Timestamp and Read Status */}
        <View
          className={`flex-row items-center justify-end mt-1 ${
            imageUrl ? "px-2 pb-1" : ""
          }`}
        >
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

      {imageUrl && !imageError && (
        <Modal
          visible={showImagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImagePreview(false)}
        >
          <View className="flex-1 bg-black/90 justify-center items-center">
            <TouchableOpacity 
              className="absolute top-12 right-4 z-10 p-2" 
              onPress={() => setShowImagePreview(false)}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: imageUrl }}
              style={{ 
                width: screenWidth, 
                height: screenWidth, 
                resizeMode: "contain" 
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  )
}

export const ChatMessage = memo(ChatMessageComponent)