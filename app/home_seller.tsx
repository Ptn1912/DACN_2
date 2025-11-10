import React from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';

export default function HomeSellerScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Giao diện Người Bán
        Đây là giao diện người bán chưa code
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-4 py-2 rounded-lg"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white font-semibold">Quay lại</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}