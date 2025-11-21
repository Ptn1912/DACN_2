import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChat } from '@/hooks/useChat';
import { Conversation } from '@/types/chat';

export default function InboxScreen() {
  const { conversations, loading, selectConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} phút`;
    } else if (hours < 24) {
      return `${hours} giờ`;
    } else {
      return `${days} ngày`;
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation);
    // Sửa route để phù hợp với cấu trúc
    router.push('../chat');
  };

  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải tin nhắn...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">Tin nhắn</Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm tin nhắn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubble-ellipses-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">Chưa có tin nhắn</Text>
            <Text className="text-gray-400 text-center mt-2 px-12">
              Khi bạn có tin nhắn với cửa hàng, chúng sẽ xuất hiện ở đây
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center"
              onPress={() => handleSelectConversation(conversation)}
            >
              <View className="relative">
                <Image
                  source={{ uri: conversation.participantAvatar }}
                  className="w-12 h-12 rounded-full"
                />
                {conversation.isOnline && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-start">
                  <Text className="font-semibold text-gray-900 text-base">
                    {conversation.participantName}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {formatTime(conversation.lastMessageTime)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-1">
                  <Text 
                    className="text-gray-600 text-sm flex-1 mr-2" 
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>
                  
                  {conversation.unreadCount > 0 && (
                    <View className="bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {conversation.unreadCount}
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
  );
}