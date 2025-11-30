// app/spaylater/transaction/[id]/index.tsx - Updated with payment button logic
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSPayLater } from '@/hooks/useSPayLater';
import { spaylaterService } from '@/services/spaylaterService';
import { LinearGradient } from 'expo-linear-gradient';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { transactions, loading } = useSPayLater();
  
  const transaction = transactions.find(t => t.id === parseInt(id as string));

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return { bg: 'bg-green-100', text: 'text-green-600', icon: 'checkmark-circle' };
      case 'OVERDUE':
        return { bg: 'bg-red-100', text: 'text-red-600', icon: 'alert-circle' };
      case 'PARTIALLY_PAID':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'time' };
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'hourglass' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'PARTIALLY_PAID':
        return 'Trả một phần';
      case 'PENDING':
        return 'Chờ thanh toán';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-gray-600 mt-4">Không tìm thấy giao dịch</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(transaction.status);
  const remainingAmount = spaylaterService.getRemainingAmount(transaction);
  const daysRemaining = spaylaterService.getDaysRemaining(new Date(transaction.dueDate));
  const isOverdue = spaylaterService.isOverdue(new Date(transaction.dueDate));
  const isDueSoon = spaylaterService.isDueSoon(new Date(transaction.dueDate));
  const canPayNow = transaction.status !== 'PAID' && daysRemaining <= 7;
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.push('/(customer-tabs)/profile')}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold ml-4">Chi tiết giao dịch</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
            <Text className={`text-xs font-semibold ${statusColor.text}`}>
              {getStatusText(transaction.status)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <LinearGradient
          colors={
            isOverdue
              ? ['#EF4444', '#DC2626']
              : transaction.status === 'PAID'
              ? ['#10B981', '#059669']
              : ['#3B82F6', '#9333EA']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 rounded-2xl p-6"
        >
          <Text className="text-white text-sm mb-2">
            {transaction.status === 'PAID' ? 'Đã thanh toán' : 'Số tiền còn lại'}
          </Text>
          <Text className="text-white text-4xl font-bold mb-4">
            {transaction.status === 'PAID'
              ? formatPrice(transaction.amount)
              : formatPrice(remainingAmount)}
          </Text>
          {transaction.status !== 'PAID' && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text className="text-white ml-2">
                {isOverdue
                  ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                  : `Còn ${daysRemaining} ngày`}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Transaction Details */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-lg font-bold mb-4">Thông tin chi tiết</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Mã đơn hàng</Text>
              <Text className="font-semibold">
                {transaction.order?.orderNumber || `#${transaction.id}`}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Ngày mua</Text>
              <Text className="font-semibold">
                {new Date(transaction.purchaseDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Hạn thanh toán</Text>
              <Text className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                {new Date(transaction.dueDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Số tiền gốc</Text>
              <Text className="font-semibold">{formatPrice(transaction.amount)}</Text>
            </View>

            {transaction.lateFee > 0 && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-red-600">Phí trễ hạn (5%)</Text>
                <Text className="font-semibold text-red-600">
                  {formatPrice(transaction.lateFee)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Đã thanh toán</Text>
              <Text className="font-semibold text-green-600">
                {formatPrice(transaction.paidAmount)}
              </Text>
            </View>

            {transaction.status !== 'PAID' && (
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-900 font-bold">Còn phải trả</Text>
                <Text className="font-bold text-blue-600 text-lg">
                  {formatPrice(remainingAmount)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Progress */}
        {transaction.status !== 'PAID' && transaction.paidAmount > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">Tiến độ thanh toán</Text>
            
            <View className="mb-2">
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-500"
                  style={{
                    width: `${(Number(transaction.paidAmount) / 
                      (Number(transaction.amount) + Number(transaction.lateFee))) * 100}%`,
                  }}
                />
              </View>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600 text-sm">
                Đã trả: {formatPrice(transaction.paidAmount)}
              </Text>
              <Text className="text-gray-600 text-sm">
                {Math.round((Number(transaction.paidAmount) / 
                  (Number(transaction.amount) + Number(transaction.lateFee))) * 100)}%
              </Text>
            </View>
          </View>
        )}

        {/* Warning if overdue or due soon */}
        {isOverdue && transaction.status !== 'PAID' && (
          <View className="bg-red-50 mx-4 mt-4 rounded-2xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={24} color="#EF4444" />
              <View className="flex-1 ml-3">
                <Text className="text-red-900 font-semibold mb-1">
                  Giao dịch đã quá hạn
                </Text>
                <Text className="text-red-700 text-sm">
                  Bạn đã bị tính phí trễ hạn 5% ({formatPrice(transaction.lateFee)}).
                  Vui lòng thanh toán ngay để tránh ảnh hưởng đến hạn mức tín dụng.
                </Text>
              </View>
            </View>
          </View>
        )}

        {isDueSoon && !isOverdue && transaction.status !== 'PAID' && (
          <View className="bg-yellow-50 mx-4 mt-4 rounded-2xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-yellow-900 font-semibold mb-1">
                  Sắp đến hạn thanh toán
                </Text>
                <Text className="text-yellow-700 text-sm">
                  Còn {daysRemaining} ngày đến hạn thanh toán. Vui lòng thanh toán đúng hạn để tránh phí trễ hạn.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {transaction.status !== 'PAID' && (
          <View className="mx-4 mt-4 mb-6">
            {canPayNow ? (
              <TouchableOpacity
                onPress={() => router.push(`/spaylater/transaction/${transaction.id}/payment`)}
                className="bg-blue-500 rounded-lg py-4 mb-3"
              >
                <Text className="text-white text-center font-bold text-base">
                  {isOverdue ? 'Thanh toán ngay (Quá hạn)' : isDueSoon ? 'Thanh toán ngay' : 'Thanh toán'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 rounded-lg py-4 mb-3">
                <Text className="text-gray-500 text-center font-semibold">
                  Chưa đến hạn thanh toán (còn {daysRemaining} ngày)
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="border border-gray-300 rounded-lg py-4"
            >
              <Text className="text-gray-700 text-center font-semibold">
                Liên hệ hỗ trợ
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {transaction.status === 'PAID' && (
          <View className="mx-4 mt-4 mb-6">
            <View className="bg-green-50 rounded-2xl p-6 items-center">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="text-green-900 font-bold text-lg mt-4">
                Đã thanh toán đầy đủ
              </Text>
              <Text className="text-green-700 text-center mt-2">
                Cảm ơn bạn đã thanh toán đúng hạn!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}