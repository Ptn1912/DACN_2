// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, name: 'Điện thoại', icon: 'phone-portrait', color: '#EF4444' },
    { id: 2, name: 'Laptop', icon: 'laptop', color: '#3B82F6' },
    { id: 3, name: 'Tai nghe', icon: 'headset', color: '#10B981' },
    { id: 4, name: 'Đồng hồ', icon: 'watch', color: '#F59E0B' },
    { id: 5, name: 'Máy ảnh', icon: 'camera', color: '#8B5CF6' },
    { id: 6, name: 'Phụ kiện', icon: 'gift', color: '#EC4899' },
  ];

  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 29990000,
      image: 'https://via.placeholder.com/150',
      rating: 4.8,
      sold: 234,
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      price: 22990000,
      image: 'https://via.placeholder.com/150',
      rating: 4.6,
      sold: 189,
    },
    {
      id: 3,
      name: 'MacBook Pro M3',
      price: 54990000,
      image: 'https://via.placeholder.com/150',
      rating: 4.9,
      sold: 156,
    },
    {
      id: 4,
      name: 'AirPods Pro 2',
      price: 6490000,
      image: 'https://via.placeholder.com/150',
      rating: 4.7,
      sold: 412,
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-gray-500 text-sm">Xin chào 👋</Text>
            <Text className="text-xl font-bold text-gray-900">
              Người dùng
            </Text>
          </View>
          <TouchableOpacity className="relative">
            <Ionicons name="notifications-outline" size={26} color="#1F2937" />
            <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View className="px-4 mt-4">
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 h-40 justify-center">
            <Text className="text-white text-2xl font-bold mb-2">
              Flash Sale 50%
            </Text>
            <Text className="text-white/90 text-base mb-3">
              Ưu đãi có hạn - Mua ngay!
            </Text>
            <TouchableOpacity className="bg-white rounded-lg py-2 px-5 self-start">
              <Text className="text-blue-600 font-semibold">Xem ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Danh mục</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="items-center mb-4"
                style={{ width: '30%' }}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={28}
                    color={category.color}
                  />
                </View>
                <Text className="text-gray-700 text-sm text-center">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products */}
        <View className="px-4 mt-4 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Sản phẩm nổi bật
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                className="bg-white rounded-2xl p-3 mb-4 border border-gray-100"
                style={{ width: '48%' }}
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-32 rounded-xl mb-3"
                  resizeMode="cover"
                />
                <Text className="text-gray-900 font-semibold text-sm mb-1" numberOfLines={2}>
                  {product.name}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {product.rating} | Đã bán {product.sold}
                  </Text>
                </View>
                <Text className="text-blue-600 font-bold text-base">
                  {formatPrice(product.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}