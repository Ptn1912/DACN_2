// components/auth/AuthHeader.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function AuthHeader({ title, subtitle, icon = 'cart' }: AuthHeaderProps) {
  return (
    <View className="items-center">
      <View className="bg-blue-100 rounded-full p-4 mb-4">
        <Ionicons name={icon} size={40} color="#2563EB" />
      </View>
      <Text className="text-3xl font-bold text-gray-900 text-center">
        {title}
      </Text>
      <Text className="text-gray-500 text-center mt-2 text-base">
        {subtitle}
      </Text>
    </View>
  );
}