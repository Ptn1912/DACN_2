// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { categories, products } from '../data/products';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
          <TouchableOpacity
            onPress={() => {
              if (searchQuery.trim().length > 0) {
                router.push(`/all_products?query=${encodeURIComponent(searchQuery)}`);
              }
            }}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (searchQuery.trim().length > 0) {
                router.push(`/all_products?query=${encodeURIComponent(searchQuery)}`);
              }
            }}
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
                key={`cat-${category.id}`} // prefix để chắc chắn key duy nhất
                className="items-center mb-4"
                style={{ width: '30%' }}
                onPress={() => router.push(`/all_products?category=${encodeURIComponent(category.name)}`)}
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
            <TouchableOpacity
              onPress={() => router.push('/all_products?showAll=true')}
            >
              <Text className="text-blue-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {products.slice(0, 4).map((product) => ( // chỉ lấy 4 sp nổi bật
              <TouchableOpacity
                key={`prod-${product.id}`} // prefix để chắc chắn key duy nhất
                className="bg-white rounded-2xl p-3 mb-4 border border-gray-100"
                style={{ width: '48%' }}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]" as any,
                    params: { id: String(product.id) },
                  })
                }
              >
                <Image
                  source={product.image}
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
