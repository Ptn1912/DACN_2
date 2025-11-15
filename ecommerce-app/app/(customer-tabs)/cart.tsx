import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selected: boolean;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB',
      price: 29990000,
      image: 'https://via.placeholder.com/80',
      quantity: 1,
      selected: true,
    },
    {
      id: 2,
      name: 'AirPods Pro 2nd Gen',
      price: 6490000,
      image: 'https://via.placeholder.com/80',
      quantity: 2,
      selected: true,
    },
    {
      id: 3,
      name: 'Apple Watch Series 9',
      price: 10990000,
      image: 'https://via.placeholder.com/80',
      quantity: 1,
      selected: false,
    },
  ]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const toggleSelect = (id: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const selectAll = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems(
      cartItems.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const selectedItems = cartItems.filter((item) => item.selected);
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">
            Giỏ hàng ({cartItems.length})
          </Text>
          <TouchableOpacity>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cart-outline" size={100} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            Giỏ hàng trống
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </Text>
          <TouchableOpacity className="bg-blue-600 rounded-xl py-3 px-8 mt-6">
            <Text className="text-white font-semibold">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
              {cartItems.map((item) => (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                >
                  <View className="flex-row">
                    {/* Checkbox */}
                    <TouchableOpacity
                      className="mr-3 justify-center"
                      onPress={() => toggleSelect(item.id)}
                    >
                      <View
                        className={`w-5 h-5 rounded border-2 items-center justify-center ${
                          item.selected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {item.selected && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Image */}
                    <Image
                      source={{ uri: item.image }}
                      className="w-20 h-20 rounded-xl"
                      resizeMode="cover"
                    />

                    {/* Info */}
                    <View className="flex-1 ml-3">
                      <Text className="text-gray-900 font-semibold text-sm mb-1">
                        {item.name}
                      </Text>
                      <Text className="text-blue-600 font-bold text-base mb-2">
                        {formatPrice(item.price)}
                      </Text>

                      {/* Quantity Controls */}
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="w-7 h-7 bg-gray-100 rounded-lg items-center justify-center"
                          onPress={() => updateQuantity(item.id, -1)}
                        >
                          <Ionicons name="remove" size={16} color="#374151" />
                        </TouchableOpacity>
                        <Text className="mx-4 text-gray-900 font-semibold">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          className="w-7 h-7 bg-blue-600 rounded-lg items-center justify-center"
                          onPress={() => updateQuantity(item.id, 1)}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Delete */}
                    <TouchableOpacity
                      className="justify-center"
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Bottom Section */}
          <View className="bg-white border-t border-gray-100 px-4 pt-4 pb-8">
            {/* Select All */}
            <TouchableOpacity
              className="flex-row items-center mb-4"
              onPress={selectAll}
            >
              <View
                className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                  allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              >
                {allSelected && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text className="text-gray-700 font-medium">Chọn tất cả</Text>
            </TouchableOpacity>

            {/* Total */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-gray-500 text-sm">Tổng thanh toán</Text>
                <Text className="text-blue-600 font-bold text-2xl">
                  {formatPrice(totalPrice)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/checkout')}
                className={`rounded-xl py-4 px-8 ${
                  selectedItems.length === 0 ? 'bg-gray-300' : 'bg-blue-600'
                }`}
                disabled={selectedItems.length === 0}
              >
                <Text className="text-white font-semibold text-base">
                  Mua ngay ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}