// app/chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router'; // Thêm useLocalSearchParams
import { useChat } from '@/hooks/useChat';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams(); // Lấy conversationId từ params
  const { 
    messages, 
    currentConversation, 
    sendMessage, 
    loading, 
    selectConversation,
    getConversationById,
    loadConversations 
  } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeConversation();
  }, [conversationId]);

  const initializeConversation = async () => {
    if (conversationId) {
      try {
        console.log('Initializing conversation with ID:', conversationId);
        
        // Tải lại danh sách conversations trước
        await loadConversations();
        
        // Tìm conversation theo ID
        const conversation = await getConversationById(conversationId as string);
        
        if (conversation) {
          console.log('Found conversation:', conversation);
          selectConversation(conversation);
        } else {
   
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      } finally {
        setInitializing(false);
      }
    } else {
      setInitializing(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Hiển thị loading khi đang khởi tạo
  if (initializing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải cuộc trò chuyện...</Text>
      </SafeAreaView>
    );
  }

  if (!currentConversation) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-600 mt-4">Không tìm thấy cuộc trò chuyện</Text>
        <Text className="text-gray-400 text-center mt-2 px-4">
          {conversationId ? `ID: ${conversationId}` : 'Không có ID cuộc trò chuyện'}
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ... phần còn lại của component giữ nguyên
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Image
          source={{ uri: currentConversation.participantAvatar }}
          className="w-10 h-10 rounded-full"
        />
        
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 text-lg">
            {currentConversation.participantName}
          </Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-1 ${
              currentConversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <Text className="text-gray-500 text-xs">
              {currentConversation.isOnline 
                ? 'Đang hoạt động' 
                : `Hoạt động ${formatMessageTime(currentConversation.lastMessageTime)}`
              }
            </Text>
          </View>
        </View>

        <TouchableOpacity className="ml-2">
          <Ionicons name="call-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
        
        <TouchableOpacity className="ml-4">
          <Ionicons name="information-circle-outline" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {loading && messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500">Đang tải tin nhắn...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">Chưa có tin nhắn nào</Text>
              <Text className="text-gray-400 text-center mt-2">
                Hãy bắt đầu cuộc trò chuyện với cửa hàng
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                className={`my-1 ${message.senderType === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.senderType === 'customer'
                      ? 'bg-blue-500 rounded-br-none'
                      : 'bg-white rounded-bl-none border border-gray-200'
                  }`}
                >
                  {message.productName && (
                    <View className="bg-blue-50 rounded-lg p-2 mb-2 border border-blue-200">
                      <Text className="text-blue-800 text-xs font-medium">
                        Đang nói về: {message.productName}
                      </Text>
                    </View>
                  )}
                  <Text
                    className={
                      message.senderType === 'customer' ? 'text-white' : 'text-gray-800'
                    }
                  >
                    {message.text}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      message.senderType === 'customer' ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-center">
          <TouchableOpacity className="mr-3">
            <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity className="mr-3">
            <Ionicons name="camera-outline" size={26} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 mx-1">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Nhập tin nhắn..."
              className="text-gray-900"
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`ml-2 p-2 rounded-full ${
              newMessage.trim() ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newMessage.trim() ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}