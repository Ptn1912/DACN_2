import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChat } from '@/hooks/useChat';
import { Conversation } from '@/types/chat';

export default function InboxScreen() {
  const { 
    conversations, 
    loading, 
    error, 
    selectConversation, 
    loadConversations,
    clearError 
  } = useChat();
  const [refreshing, setRefreshing] = useState(false);

  // Xử lý hiển thị lỗi
  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        { 
          text: 'OK', 
          onPress: () => clearError() 
        }
      ]);
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation);
    router.push('/chat');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Tin nhắn</Text>
      </View>

      {/* Conversations List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">Đang tải tin nhắn...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8 px-4">
            <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-lg font-medium">
              Chưa có tin nhắn
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Khi bạn có tin nhắn từ cửa hàng, chúng sẽ xuất hiện ở đây
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              className="flex-row items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50"
              onPress={() => handleSelectConversation(conversation)}
            >
              <View className="relative">
                <Image
                  source={{ uri: conversation.participantAvatar }}
                  className="w-12 h-12 rounded-full"
                />
                {conversation.isOnline && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                )}
              </View>

              <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-start">
                  <Text className="font-semibold text-gray-900 text-base flex-1">
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
                    <View className="bg-red-500 rounded-full min-w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-medium px-1">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
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