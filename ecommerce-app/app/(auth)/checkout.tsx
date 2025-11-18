import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { orderService, PaymentMethod } from '@/services/orderService';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../context/CartContext';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const getPaymentMethodCode = (selectedPaymentId: number): PaymentMethod => {
  switch (selectedPaymentId) {
    case 1:
      return 'cod';
    case 2:
      return 'momo';
    case 3:
      return 'credit_card';
    case 4:
      return 'bank_transfer';
    case 5:
      return 'pay_later';
    default:
      return 'cod';
  }
};

export default function CheckoutScreen() {
  const { cart, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(1);
  const [voucherCode, setVoucherCode] = useState('');
  const [note, setNote] = useState('');


  const addresses = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '456 Đường DEF, Phường GHI, Quận 3, TP.HCM',
      isDefault: false,
    },
  ];

  const paymentMethods = [
    { id: 1, name: 'Thanh toán khi nhận hàng (COD)', icon: 'cash' },
    { id: 2, name: 'Ví MoMo', icon: 'wallet' },
    { id: 3, name: 'Thẻ ATM/Visa/Master', icon: 'card' },
    { id: 4, name: 'Chuyển khoản ngân hàng', icon: 'business' },
    { id: 5, name: 'Pay layter', icon: 'wallet' },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingFee = 30000;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const handlePlaceOrder = async () => {
    try {
      if (cart.length === 0) {
        Alert.alert("Lỗi", "Giỏ hàng trống. Vui lòng thêm sản phẩm để đặt hàng.");
        return;
      }
      
      const address = addresses.find((a) => a.id === selectedAddress);
      if (!address) {
        Alert.alert("Lỗi", "Vui lòng chọn địa chỉ giao hàng hợp lệ.");
        return;
      }
      
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const body = {
        customerId: 1, // ⚠ TODO: lấy từ user login
        items,
        shippingName: address.name,
        shippingPhone: address.phone,
        shippingAddress: address.address,
        paymentMethod: getPaymentMethodCode(selectedPayment),
        note,
      };
      const result = await orderService.createOrder(body);

      if (!result.success || !result.data) {
        // Xử lý lỗi trả về từ service
        Alert.alert("Đặt hàng thất bại", result.error || "Không thể tạo đơn hàng. Vui lòng thử lại.");
        return;
      }
      
      // 3. THÀNH CÔNG
      clearCart();
      
      // Chuyển sang màn hình thành công và truyền dữ liệu đơn hàng
      router.push({
        pathname: "/order_success",
        // Chuyển đối tượng đơn hàng thành chuỗi JSON an toàn
        params: { 
          orderData: JSON.stringify(result.data) 
        },
      });

    } catch (error) {
      console.error("Lỗi không mong muốn:", error);
      Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra. Vui lòng kiểm tra kết nối mạng.");
    }
};

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 ml-4">
          Thanh toán
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#2563EB" />
              <Text className="text-gray-900 font-bold text-base ml-2">
                Địa chỉ giao hàng
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium text-sm">Thay đổi</Text>
            </TouchableOpacity>
          </View>

          {addresses
            .filter((addr) => addr.id === selectedAddress)
            .map((addr) => (
              <View key={addr.id} className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-900 font-semibold">
                    {addr.name} | {addr.phone}
                  </Text>
                  {addr.isDefault && (
                    <View className="bg-blue-100 px-2 py-1 rounded">
                      <Text className="text-blue-600 text-xs font-medium">
                        Mặc định
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 text-sm">{addr.address}</Text>
              </View>
            ))}
        </View>

        {/* Products */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="cart" size={20} color="#2563EB" />
            <Text className="text-gray-900 font-bold text-base ml-2">
              Sản phẩm ({cart.length})
            </Text>
          </View>

          {cart.map((item) => (
            <View key={item.id} className="flex-row mb-4 pb-4 border-b border-gray-100">
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
        </View>

        {/* Voucher */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="pricetag" size={20} color="#2563EB" />
            <Text className="text-gray-900 font-bold text-base ml-2">
              Mã giảm giá
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="ticket-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Nhập mã giảm giá"
                value={voucherCode}
                onChangeText={setVoucherCode}
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity className="bg-blue-600 rounded-xl py-3 px-6 ml-3">
              <Text className="text-white font-semibold">Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="card" size={20} color="#2563EB" />
            <Text className="text-gray-900 font-bold text-base ml-2">
              Phương thức thanh toán
            </Text>
          </View>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center p-4 rounded-xl mb-3 border ${
                selectedPayment === method.id
                  ? 'bg-blue-50 border-blue-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  selectedPayment === method.id
                    ? 'border-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedPayment === method.id && (
                  <View className="w-3 h-3 bg-blue-600 rounded-full" />
                )}
              </View>
              <Ionicons
                name={method.icon as any}
                size={24}
                color={selectedPayment === method.id ? '#2563EB' : '#6B7280'}
              />
              <Text
                className={`ml-3 font-medium ${
                  selectedPayment === method.id
                    ? 'text-blue-600'
                    : 'text-gray-700'
                }`}
              >
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="create" size={20} color="#2563EB" />
            <Text className="text-gray-900 font-bold text-base ml-2">
              Ghi chú đơn hàng
            </Text>
          </View>
          <TextInput
            placeholder="Thêm ghi chú cho đơn hàng (tùy chọn)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Price Summary */}
        <View className="bg-white mt-2 px-4 py-4 mb-24">
          <Text className="text-gray-900 font-bold text-base mb-4">
            Chi tiết thanh toán
          </Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Tạm tính</Text>
            <Text className="text-gray-900 font-medium">
              {formatPrice(subtotal)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Phí vận chuyển</Text>
            <Text className="text-gray-900 font-medium">
              {formatPrice(shippingFee)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Giảm giá</Text>
            <Text className="text-green-600 font-medium">
              -{formatPrice(discount)}
            </Text>
          </View>
          <View className="border-t border-gray-200 pt-3 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-bold text-lg">
                Tổng thanh toán
              </Text>
              <Text className="text-blue-600 font-bold text-xl">
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-gray-500 text-sm">Tổng thanh toán</Text>
            <Text className="text-blue-600 font-bold text-xl">
              {formatPrice(total)}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 px-8"
            onPress={handlePlaceOrder}
          >
            <Text className="text-white font-semibold text-base">
              Đặt hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}