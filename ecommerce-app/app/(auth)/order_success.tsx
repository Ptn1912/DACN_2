import React from 'react';
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
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderSuccessScreen() {
  const orderInfo = {
    orderNumber: 'DH2024100401234',
    orderDate: '04/10/2024 14:30',
    estimatedDelivery: '07/10/2024',
    total: 43010000,
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
  };

  const orderItems = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB',
      price: 29990000,
      quantity: 1,
      image: 'https://via.placeholder.com/60',
    },
    {
      id: 2,
      name: 'AirPods Pro 2nd Gen',
      price: 6490000,
      quantity: 2,
      image: 'https://via.placeholder.com/60',
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)');
  };

  const handleViewOrderDetails = () => {
    // TODO: Navigate to order details
    console.log('View order details');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View className="bg-white pt-8 pb-6 px-6 items-center">
          {/* Success Animation Container */}
          <View className="w-32 h-32 bg-green-100 rounded-full items-center justify-center mb-4">
            <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={60} color="#fff" />
            </View>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công!
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý
          </Text>

          {/* Order Number */}
          <View className="bg-blue-50 rounded-2xl px-6 py-4 mt-6 w-full">
            <View className="flex-row items-center justify-center">
              <Ionicons name="receipt-outline" size={20} color="#2563EB" />
              <Text className="text-gray-600 text-sm ml-2">Mã đơn hàng:</Text>
            </View>
            <Text className="text-blue-600 font-bold text-lg text-center mt-1">
              {orderInfo.orderNumber}
            </Text>
          </View>
        </View>

        {/* Order Timeline */}
        <View className="bg-white mt-2 px-6 py-5">
          <Text className="text-gray-900 font-bold text-base mb-4">
            Trạng thái đơn hàng
          </Text>
          
          <View className="space-y-4">
            {/* Step 1 - Completed */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
                <View className="w-0.5 h-16 bg-green-500 mt-2" />
              </View>
              <View className="flex-1 pt-2">
                <Text className="text-gray-900 font-semibold">Đặt hàng thành công</Text>
                <Text className="text-gray-500 text-sm mt-1">{orderInfo.orderDate}</Text>
              </View>
            </View>

            {/* Step 2 - In Progress */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                  <Ionicons name="time" size={20} color="#fff" />
                </View>
                <View className="w-0.5 h-16 bg-gray-200 mt-2" />
              </View>
              <View className="flex-1 pt-2">
                <Text className="text-gray-900 font-semibold">Đang xử lý</Text>
                <Text className="text-gray-500 text-sm mt-1">Đơn hàng đang được chuẩn bị</Text>
              </View>
            </View>

            {/* Step 3 - Pending */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
                  <Ionicons name="cube" size={20} color="#6B7280" />
                </View>
                <View className="w-0.5 h-16 bg-gray-200 mt-2" />
              </View>
              <View className="flex-1 pt-2">
                <Text className="text-gray-500 font-semibold">Đang giao hàng</Text>
                <Text className="text-gray-400 text-sm mt-1">Dự kiến giao ngày {orderInfo.estimatedDelivery}</Text>
              </View>
            </View>

            {/* Step 4 - Pending */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center">
                  <Ionicons name="home" size={20} color="#6B7280" />
                </View>
              </View>
              <View className="flex-1 pt-2">
                <Text className="text-gray-500 font-semibold">Đã giao hàng</Text>
                <Text className="text-gray-400 text-sm mt-1">Chờ xác nhận</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View className="bg-white mt-2 px-6 py-5">
          <Text className="text-gray-900 font-bold text-base mb-4">
            Chi tiết đơn hàng
          </Text>

          {/* Products */}
          {orderItems.map((item, index) => (
            <View 
              key={item.id} 
              className={`flex-row pb-4 ${index < orderItems.length - 1 ? 'mb-4 border-b border-gray-100' : ''}`}
            >
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold text-sm mb-1">
                  {item.name}
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  x{item.quantity}
                </Text>
                <Text className="text-blue-600 font-bold text-sm">
                  {formatPrice(item.price)}
                </Text>
              </View>
            </View>
          ))}

          {/* Payment Method */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="card-outline" size={18} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2">Thanh toán:</Text>
            </View>
            <Text className="text-gray-900 font-medium ml-7">
              {orderInfo.paymentMethod}
            </Text>
          </View>

          {/* Shipping Address */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2">Địa chỉ giao hàng:</Text>
            </View>
            <Text className="text-gray-900 font-medium ml-7">
              {orderInfo.shippingAddress}
            </Text>
          </View>

          {/* Total */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-bold text-base">
                Tổng thanh toán
              </Text>
              <Text className="text-blue-600 font-bold text-xl">
                {formatPrice(orderInfo.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-5">
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 bg-white border border-gray-200 rounded-xl py-4 mr-2 items-center"
              onPress={handleViewOrderDetails}
            >
              <Ionicons name="document-text-outline" size={24} color="#2563EB" />
              <Text className="text-blue-600 font-semibold text-sm mt-2">
                Chi tiết
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white border border-gray-200 rounded-xl py-4 mx-1 items-center"
            >
              <Ionicons name="chatbubble-outline" size={24} color="#10B981" />
              <Text className="text-green-600 font-semibold text-sm mt-2">
                Liên hệ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white border border-gray-200 rounded-xl py-4 ml-2 items-center"
            >
              <Ionicons name="download-outline" size={24} color="#F59E0B" />
              <Text className="text-amber-600 font-semibold text-sm mt-2">
                Hóa đơn
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Shopping Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 items-center"
            onPress={handleContinueShopping}
          >
            <Text className="text-white font-semibold text-base">
              Tiếp tục mua sắm
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}