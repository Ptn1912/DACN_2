// app/spaylater/transaction/[id]/payment.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSPayLater } from '@/hooks/useSPayLater';
import { spaylaterService } from '@/services/spaylaterService';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const { makePayment, transactions, customer } = useSPayLater();
  
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  
  const transaction = transactions.find(t => t.id === parseInt(id as string));

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const remainingAmount = transaction 
    ? spaylaterService.getRemainingAmount(transaction)
    : 0;

  const handlePayment = async () => {
    if (!transaction) {
      Alert.alert('Lỗi', 'Không tìm thấy giao dịch');
      return;
    }

    const payAmount = parseFloat(amount.replace(/[^0-9]/g, ''));

    if (!payAmount || payAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (payAmount > remainingAmount) {
      Alert.alert(
        'Lỗi',
        `Số tiền không được vượt quá ${formatPrice(remainingAmount)}`
      );
      return;
    }

    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn muốn thanh toán ${formatPrice(payAmount)}?\n\nSố tiền sẽ được trừ từ tài khoản ngân hàng ${customer?.bankName} (${customer?.bankAccount})`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setLoading(true);
            const result = await makePayment(transaction.id, payAmount);
            setLoading(false);

            if (result.success) {
              Alert.alert('Thành công! 🎉', result.message || 'Thanh toán thành công', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } else {
              Alert.alert('Lỗi', result.error || 'Thanh toán thất bại');
            }
          },
        },
      ]
    );
  };

  const handlePayFull = () => {
    setAmount(remainingAmount.toString());
  };

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Thanh toán</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Transaction Info */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-lg font-bold mb-4">Thông tin giao dịch</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Mã đơn hàng</Text>
              <Text className="font-semibold">
                {transaction.order?.orderNumber || `#${transaction.id}`}
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

            <View className="flex-row justify-between py-2">
              <Text className="text-gray-900 font-bold">Còn lại</Text>
              <Text className="font-bold text-blue-600 text-lg">
                {formatPrice(remainingAmount)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-t border-gray-200">
              <Text className="text-gray-600">Hạn thanh toán</Text>
              <Text className={`font-semibold ${
                spaylaterService.isOverdue(transaction.dueDate) 
                  ? 'text-red-600' 
                  : 'text-gray-900'
              }`}>
                {new Date(transaction.dueDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Amount */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-lg font-bold mb-4">Số tiền thanh toán</Text>

          <TextInput
            className="border-2 border-blue-500 rounded-lg px-4 py-4 text-2xl font-bold text-center"
            placeholder="0"
            value={amount}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setAmount(cleaned);
            }}
            keyboardType="numeric"
          />

          <View className="flex-row items-center justify-between mt-3">
            <TouchableOpacity
              onPress={handlePayFull}
              className="bg-blue-50 px-4 py-2 rounded-lg"
            >
              <Text className="text-blue-600 font-semibold">
                Thanh toán đủ
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-500">
              Tối đa: {formatPrice(remainingAmount)}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-lg font-bold mb-4">Phương thức thanh toán</Text>

          <View className="border border-gray-300 rounded-lg overflow-hidden">
            <TouchableOpacity
              onPress={() => setPaymentMethod('bank_transfer')}
              className={`px-4 py-4 flex-row items-center border-b border-gray-200 ${
                paymentMethod === 'bank_transfer' ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <Ionicons
                name="card-outline"
                size={24}
                color={paymentMethod === 'bank_transfer' ? '#3B82F6' : '#666'}
              />
              <View className="flex-1 ml-3">
                <Text
                  className={`font-semibold ${
                    paymentMethod === 'bank_transfer'
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  Chuyển khoản ngân hàng
                </Text>
                <Text className="text-gray-500 text-sm">
                  {customer?.bankName} - {customer?.bankAccount}
                </Text>
              </View>
              {paymentMethod === 'bank_transfer' && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('momo')}
              className={`px-4 py-4 flex-row items-center ${
                paymentMethod === 'momo' ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <Ionicons
                name="wallet-outline"
                size={24}
                color={paymentMethod === 'momo' ? '#3B82F6' : '#666'}
              />
              <View className="flex-1 ml-3">
                <Text
                  className={`font-semibold ${
                    paymentMethod === 'momo' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Ví MoMo
                </Text>
                <Text className="text-gray-500 text-sm">Thanh toán qua ví điện tử</Text>
              </View>
              {paymentMethod === 'momo' && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning */}
        {spaylaterService.isOverdue(transaction.dueDate) && (
          <View className="bg-red-50 mx-4 mt-4 rounded-2xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={24} color="#EF4444" />
              <View className="flex-1 ml-3">
                <Text className="text-red-900 font-semibold mb-1">
                  Giao dịch đã quá hạn
                </Text>
                <Text className="text-red-700 text-sm">
                  Bạn đã bị tính phí trễ hạn 5%. Vui lòng thanh toán ngay để tránh
                  ảnh hưởng đến hạn mức tín dụng.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Button */}
        <View className="mx-4 mt-4 mb-6">
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className={`rounded-lg py-4 ${
              loading || !amount || parseFloat(amount) <= 0
                ? 'bg-gray-300'
                : 'bg-blue-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Xác nhận thanh toán
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}