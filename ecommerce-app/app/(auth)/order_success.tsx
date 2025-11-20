import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";

interface ActualOrderItem {
  id: number;
  productName: string;
  price: number; 
  quantity: number;
  image?: string; 
}

interface ActualOrderData {
    orderNumber: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    shippingFee: number;
    items: ActualOrderItem[];
    // ... thêm các trường khác nếu có từ API
}

// Hàm ánh xạ phương thức thanh toán (từ code sang text hiển thị)
const mapPaymentMethod = (code: string) => {
  switch (code) {
    case 'cod': return 'Thanh toán khi nhận hàng (COD)';
    case 'momo': return 'Ví MoMo';
    case 'credit_card': return 'Thẻ ATM/Visa/Master';
    case 'bank_transfer': return 'Chuyển khoản ngân hàng';
    case 'pay_later': return 'Pay later';
    default: return code;
  }
};

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();
  const actualOrder: ActualOrderData | null = useMemo(() => {
    if (params.orderData && typeof params.orderData === 'string') {
      try {
        const data = JSON.parse(params.orderData);
        // Kiểm tra xem data có phải là đơn hàng hợp lệ không (ví dụ: có orderNumber)
        if (data && data.orderNumber) {
             return {
                orderNumber: data.orderNumber,
                createdAt: new Date(data.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }),
                totalAmount: data.totalAmount, // Sử dụng totalAmount từ API
                shippingFee: data.shippingFee || 0,
                paymentMethod: mapPaymentMethod(data.paymentMethod),
                shippingAddress: data.shippingAddress,
                items: data.items.map((item: any) => ({
                    id: item.id,
                    productName: item.productName || item.name,
                    price: item.price,
                    quantity: item.quantity,
                    // Giả định API trả về mảng images, lấy cái đầu tiên
                    image: item.product?.images?.[0] || item.image || 'https://via.placeholder.com/60',
                })),
            } as ActualOrderData;
        }
      } catch (e) {
        console.error("Lỗi parse orderData:", e);
      }
    }
    return null; // Trả về null nếu không có dữ liệu hoặc lỗi
  }, [params.orderData]);

  // Hiển thị loading hoặc lỗi nếu không có dữ liệu
  if (!actualOrder) {
      return (
          <View className="flex-1 justify-center items-center bg-gray-50">
              <Text className="text-xl font-bold text-red-600">Lỗi tải đơn hàng</Text>
              <Text className="text-gray-500 mt-2 text-center px-6">
                Không thể tải thông tin đơn hàng vừa đặt. Vui lòng kiểm tra mục "Đơn hàng của tôi".
              </Text>
              <TouchableOpacity onPress={() => router.replace('/')} className="mt-6 p-4 bg-blue-600 rounded-xl">
                  <Text className="text-white font-semibold">Trở về Trang chủ</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const orderInfo = {
    orderNumber: actualOrder.orderNumber,
    orderDate: actualOrder.createdAt,
    estimatedDelivery: 'Dự kiến: 3-5 ngày làm việc', // Có thể thêm trường này vào API nếu muốn
    total: actualOrder.totalAmount,
    paymentMethod: actualOrder.paymentMethod,
    shippingAddress: actualOrder.shippingAddress,
  };

  const orderItems = actualOrder.items.map(item => ({
    id: item.id,
    name: item.productName,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const formatPrice = (price: number) => {
  return Number(price).toLocaleString('vi-VN') + ' ₫';
};

  const handleContinueShopping = () => {
    router.push('/(customer-tabs)/mall');
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