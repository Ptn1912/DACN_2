// app/spaylater/index.tsx (Landing/Entry point)
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSPayLater } from '@/hooks/useSPayLater';
import { LinearGradient } from 'expo-linear-gradient';

export default function SPayLaterIndex() {
  const { loading, isRegistered } = useSPayLater();

  // Auto redirect nếu đã đăng ký
  useEffect(() => {
    if (!loading && isRegistered) {
      router.replace('/spaylater/transaction');
    }
  }, [loading, isRegistered]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Đang kiểm tra...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-4 pt-8">
          <Text className="text-4xl font-bold text-gray-900 mb-4">
            Mua ngay,{'\n'}Trả sau
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Thanh toán linh hoạt với SPayLater. Mua sắm thoải mái, trả góp 0% lãi suất.
          </Text>

          {/* Credit Card Preview */}
          <LinearGradient
            colors={['#FF6B4A', '#FF5733']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6 mb-8"
          >
            <View className="mb-6">
              <Text className="text-white text-sm opacity-80">Hạn mức khả dụng</Text>
              <Text className="text-white text-4xl font-bold mt-2">
                2,000,000 ₫
              </Text>
            </View>
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white text-xs opacity-80">Lãi suất</Text>
                <Text className="text-white text-xl font-bold">0%</Text>
              </View>
              <View>
                <Text className="text-white text-xs opacity-80">Thời gian</Text>
                <Text className="text-white text-xl font-bold">30 ngày</Text>
              </View>
              <View>
                <Ionicons name="card" size={40} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Benefits */}
        <View className="px-4 mb-8">
          <Text className="text-2xl font-bold mb-6">Ưu điểm nổi bật</Text>

          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="flash" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 mb-1">
                  Duyệt nhanh chóng
                </Text>
                <Text className="text-gray-600">
                  Chỉ cần 2 phút để đăng ký và sử dụng ngay
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 mb-1">
                  An toàn tuyệt đối
                </Text>
                <Text className="text-gray-600">
                  Thông tin được mã hóa và bảo mật cao nhất
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="gift" size={24} color="#9333EA" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 mb-1">
                  0% lãi suất
                </Text>
                <Text className="text-gray-600">
                  Không tính lãi trong 30 ngày đầu tiên
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-yellow-100 w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="wallet" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 mb-1">
                  Hạn mức linh hoạt
                </Text>
                <Text className="text-gray-600">
                  Bắt đầu từ 2 triệu, có thể tăng lên 10 triệu
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View className="px-4 mb-8 bg-gray-50 py-8">
          <Text className="text-2xl font-bold mb-6">Cách sử dụng</Text>

          <View className="space-y-4">
            <View className="flex-row">
              <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Đăng ký</Text>
                <Text className="text-gray-600 mt-1">
                  Điền thông tin cơ bản và liên kết tài khoản ngân hàng
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Mua sắm</Text>
                <Text className="text-gray-600 mt-1">
                  Chọn sản phẩm và thanh toán bằng SPayLater
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Trả sau</Text>
                <Text className="text-gray-600 mt-1">
                  Thanh toán trong vòng 30 ngày với lãi suất 0%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View className="px-4 mb-8">
          <Text className="text-2xl font-bold mb-6">Câu hỏi thường gặp</Text>

          <View className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            <View className="p-4 border-b border-gray-200">
              <Text className="font-semibold text-gray-900 mb-2">
                Ai có thể sử dụng SPayLater?
              </Text>
              <Text className="text-gray-600">
                Tất cả khách hàng đã đăng ký tài khoản và từ 18 tuổi trở lên
              </Text>
            </View>

            <View className="p-4 border-b border-gray-200">
              <Text className="font-semibold text-gray-900 mb-2">
                Có mất phí đăng ký không?
              </Text>
              <Text className="text-gray-600">
                Hoàn toàn miễn phí, không có bất kỳ chi phí ẩn nào
              </Text>
            </View>

            <View className="p-4">
              <Text className="font-semibold text-gray-900 mb-2">
                Điều gì xảy ra nếu quá hạn?
              </Text>
              <Text className="text-gray-600">
                Sẽ có phí phạt 5% trên số tiền gốc nếu thanh toán quá 30 ngày
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={() => router.push('/spaylater/register')}
          className="bg-blue-500 rounded-xl py-4 mb-3"
        >
          <Text className="text-white text-center font-bold text-lg">
            Đăng ký ngay
          </Text>
        </TouchableOpacity>
        <Text className="text-center text-gray-500 text-sm">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <Text className="text-blue-600">Điều khoản sử dụng</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}