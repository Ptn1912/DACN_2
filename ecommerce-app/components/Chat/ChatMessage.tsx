// components/Chat/ChatMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  return (
    <View className={`my-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwn
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
          className={isOwn ? 'text-white' : 'text-gray-800'}
        >
          {message.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};