import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';

export default function PaymentPendingScreen() {
  const { orderNumber, orderData } = useLocalSearchParams();
  const [checking, setChecking] = useState(true);
  const [checkCount, setCheckCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    if (!orderNumber || typeof orderNumber !== 'string') return;

    try {
      const result = await orderService.getOrderPaymentStatus(orderNumber);
      
      if (result.success && result.paymentStatus) {
        if (result.paymentStatus === 'COMPLETED') {
          setPaymentStatus('success');
          setChecking(false);
          
          // Chuyển sang trang thành công sau 1.5s
          setTimeout(() => {
            router.replace({
              pathname: '/order_success',
              params: {
                orderData: orderData as string,
                usedPayLater: 'false',
              },
            });
          }, 1500);
        } else if (result.paymentStatus === 'FAILED') {
          setPaymentStatus('failed');
          setChecking(false);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  useEffect(() => {
    // Kiểm tra trạng thái lần đầu sau 3 giây
    const initialTimer = setTimeout(() => {
      checkPaymentStatus();
    }, 3000);

    // Kiểm tra định kỳ mỗi 5 giây (tối đa 6 lần = 30 giây)
    const interval = setInterval(() => {
      setCheckCount(prev => {
        const newCount = prev + 1;
        if (newCount <= 6) {
          checkPaymentStatus();
          return newCount;
        } else {
          // Sau 30 giây vẫn chưa có kết quả
          setChecking(false);
          clearInterval(interval);
          return newCount;
        }
      });
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [orderNumber]);

  const handleCheckManually = () => {
    setChecking(true);
    checkPaymentStatus();
  };

  const handleViewOrders = () => {
    router.replace('/orders');
  };

  const handleRetry = () => {
    Alert.alert(
      'Thử lại thanh toán',
      'Bạn có thể kiểm tra đơn hàng trong mục "Đơn hàng của tôi" và thử thanh toán lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xem đơn hàng', onPress: handleViewOrders },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {checking ? (
          <>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-900 text-xl font-bold mt-6">
              Đang chờ xác nhận thanh toán
            </Text>
            <Text className="text-gray-600 text-center mt-3">
              Vui lòng hoàn tất thanh toán trên ví MoMo
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Mã đơn hàng: {orderNumber}
            </Text>
            <View className="flex-row items-center mt-4">
              <View className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1" />
              <View className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1" />
              <View className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            </View>
            <Text className="text-gray-400 text-xs mt-4">
              Đang kiểm tra tự động...
            </Text>
          </>
        ) : paymentStatus === 'success' ? (
          <>
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={50} color="#10B981" />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              Thanh toán thành công! 🎉
            </Text>
            <Text className="text-gray-600 text-center mt-3 px-4">
              Đang chuyển đến trang chi tiết đơn hàng...
            </Text>
          </>
        ) : paymentStatus === 'failed' ? (
          <>
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="close-circle" size={50} color="#EF4444" />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              Thanh toán thất bại
            </Text>
            <Text className="text-gray-600 text-center mt-3 px-4">
              Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </Text>
            <View className="flex-row mt-6 space-x-3">
              <TouchableOpacity
                className="bg-gray-200 rounded-xl py-4 px-6"
                onPress={handleViewOrders}
              >
                <Text className="text-gray-700 font-bold text-base">
                  Xem đơn hàng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 rounded-xl py-4 px-6 ml-3"
                onPress={handleRetry}
              >
                <Text className="text-white font-bold text-base">
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="time-outline" size={40} color="#2563EB" />
            </View>
            <Text className="text-gray-900 text-xl font-bold">
              Thanh toán đang được xử lý
            </Text>
            <Text className="text-gray-600 text-center mt-3 px-4">
              Đơn hàng của bạn đã được tạo. Vui lòng kiểm tra trạng thái thanh toán trong danh sách đơn hàng.
            </Text>
            <View className="mt-6 space-y-3">
              <TouchableOpacity
                className="bg-blue-600 rounded-xl py-4 px-8"
                onPress={handleCheckManually}
              >
                <Text className="text-white font-bold text-base">
                  Kiểm tra lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-200 rounded-xl py-4 px-8 mt-3"
                onPress={handleViewOrders}
              >
                <Text className="text-gray-700 font-bold text-base">
                  Xem đơn hàng
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}