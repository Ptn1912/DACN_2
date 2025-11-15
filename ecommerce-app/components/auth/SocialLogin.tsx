// components/auth/SocialLogin.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SocialLogin() {
  const handleSocialLogin = (provider: string) => {
    console.log('Login with:', provider);
    // TODO: Implement social login
  };

  return (
    <View className="mt-6">
      <TouchableOpacity
        className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3.5 mb-3"
        onPress={() => handleSocialLogin('google')}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text className="ml-3 text-gray-700 font-medium">
          Tiếp tục với Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center justify-center bg-blue-600 rounded-xl py-3.5"
        onPress={() => handleSocialLogin('facebook')}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-facebook" size={20} color="#fff" />
        <Text className="ml-3 text-white font-medium">
          Tiếp tục với Facebook
        </Text>
      </TouchableOpacity>
    </View>
  );
}