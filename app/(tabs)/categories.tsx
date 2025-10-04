// app/(tabs)/categories.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState(1);

  const categories = [
    { id: 1, name: 'Điện thoại', icon: 'phone-portrait', count: 234 },
    { id: 2, name: 'Laptop', icon: 'laptop', count: 156 },
    { id: 3, name: 'Tablet', icon: 'tablet-portrait', count: 89 },
    { id: 4, name: 'Tai nghe', icon: 'headset', count: 178 },
    { id: 5, name: 'Đồng hồ', icon: 'watch', count: 92 },
    { id: 6, name: 'Máy ảnh', icon: 'camera', count: 67 },
    { id: 7, name: 'TV & AV', icon: 'tv', count: 45 },
    { id: 8, name: 'Phụ kiện', icon: 'gift', count: 312 },
  ];

  const subcategories = [
    {
      id: 1,
      name: 'iPhone',
      image: 'https://via.placeholder.com/100',
      count: 89,
    },
    {
      id: 2,
      name: 'Samsung',
      image: 'https://via.placeholder.com/100',
      count: 76,
    },
    {
      id: 3,
      name: 'Xiaomi',
      image: 'https://via.placeholder.com/100',
      count: 54,
    },
    {
      id: 4,
      name: 'OPPO',
      image: 'https://via.placeholder.com/100',
      count: 43,
    },
    {
      id: 5,
      name: 'Vivo',
      image: 'https://via.placeholder.com/100',
      count: 38,
    },
    {
      id: 6,
      name: 'Realme',
      image: 'https://via.placeholder.com/100',
      count: 29,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Danh mục</Text>
      </View>

      <View className="flex-1 flex-row">
        {/* Left Sidebar - Categories */}
        <ScrollView
          className="w-28 bg-white border-r border-gray-100"
          showsVerticalScrollIndicator={false}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`items-center py-5 border-l-4 ${
                selectedCategory === category.id
                  ? 'bg-blue-50 border-blue-600'
                  : 'border-transparent'
              }`}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={28}
                color={selectedCategory === category.id ? '#2563EB' : '#6B7280'}
              />
              <Text
                className={`text-xs mt-2 text-center px-2 ${
                  selectedCategory === category.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600'
                }`}
                numberOfLines={2}
              >
                {category.name}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {category.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Right Content - Subcategories */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Banner */}
            <View className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-5 mb-5">
              <Text className="text-white text-xl font-bold mb-2">
                Sale Up To 30%
              </Text>
              <Text className="text-white/90 text-sm mb-3">
                Khuyến mãi điện thoại hot nhất
              </Text>
              <TouchableOpacity className="bg-white rounded-lg py-2 px-4 self-start">
                <Text className="text-purple-600 font-semibold text-sm">
                  Mua ngay
                </Text>
              </TouchableOpacity>
            </View>

            {/* Subcategories Grid */}
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Thương hiệu nổi bật
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  className="bg-white rounded-2xl p-4 mb-4 items-center border border-gray-100"
                  style={{ width: '48%' }}
                >
                  <Image
                    source={{ uri: sub.image }}
                    className="w-20 h-20 rounded-xl mb-3"
                    resizeMode="cover"
                  />
                  <Text className="text-gray-900 font-semibold text-sm">
                    {sub.name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {sub.count} sản phẩm
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Popular Products */}
            <View className="mt-4">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Sản phẩm phổ biến
              </Text>
              {[1, 2, 3].map((item) => (
                <TouchableOpacity
                  key={item}
                  className="bg-white rounded-2xl p-3 mb-3 flex-row border border-gray-100"
                >
                  <Image
                    source={{ uri: 'https://via.placeholder.com/80' }}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-3 justify-center">
                    <Text className="text-gray-900 font-semibold text-sm mb-1">
                      iPhone 15 Pro Max 256GB
                    </Text>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-gray-600 text-xs ml-1">
                        4.8 (234)
                      </Text>
                    </View>
                    <Text className="text-blue-600 font-bold text-base">
                      29.990.000đ
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}