import React from 'react';
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
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN') + 'đ';

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">
          Giỏ hàng ({cart.length})
        </Text>
      </View>

      {cart.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cart-outline" size={100} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            Giỏ hàng trống
          </Text>
          <TouchableOpacity className="bg-blue-600 rounded-xl py-3 px-8 mt-6"
            onPress={() => router.push("/")}
          >
            <Text className="text-white font-semibold">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
              {cart.map((item) => (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                >
                  <View className="flex-row">

                    <Image
                      source={{ uri: item.image }}
                      className="w-20 h-20 rounded-xl"
                    />

                    <View className="flex-1 ml-3">
                      <Text className="text-gray-900 font-semibold text-sm mb-1">
                        {item.name}
                      </Text>

                      <Text className="text-blue-600 font-bold text-base mb-2">
                        {formatPrice(item.price)}
                      </Text>

                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="w-7 h-7 bg-gray-100 rounded-lg items-center justify-center"
                          onPress={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Ionicons name="remove" size={16} color="#374151" />
                        </TouchableOpacity>

                        <Text className="mx-4 text-gray-900 font-semibold">
                          {item.quantity}
                        </Text>

                        <TouchableOpacity
                          className="w-7 h-7 bg-blue-600 rounded-lg items-center justify-center"
                          onPress={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="justify-center"
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>

                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="bg-white border-t border-gray-100 px-4 pt-4 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-gray-500 text-sm">Tổng thanh toán</Text>
                <Text className="text-blue-600 font-bold text-2xl">
                  {formatPrice(totalPrice)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/checkout')}
                className="rounded-xl py-4 px-8 bg-blue-600"
              >
                <Text className="text-white font-semibold text-base">
                  Thanh toán
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
