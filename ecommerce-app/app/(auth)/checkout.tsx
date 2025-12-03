import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Linking } from 'react-native';
import React, { useState, useEffect } from "react";
import { momoService } from '../../services/momoService';
import { orderService, PaymentMethod } from "@/services/orderService";
import ethersService from "@/services/ethersService";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useCart } from "@/context/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useSPayLater } from "@/hooks/useSPayLater";
import { UserAddress } from "@/services/orderService";
import walletService from "@/services/walletService";

const getPaymentMethodCode = (selectedPaymentId: number): PaymentMethod => {
  switch (selectedPaymentId) {
    case 1:
      return "cod";
    case 2:
      return "momo";
    case 3:
      return "credit_card";
    case 4:
      return "bank_transfer";
    case 5:
      return "spaylater";
    default:
      return "cod";
  }
};

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const { cart, buyNowCart, clearCart, clearBuyNowCart } = useCart();
  const { user } = useAuth();
  const isBuyNowMode = params.mode === 'buyNow';
  const [selectedPayment, setSelectedPayment] = useState(1);
  const [voucherCode, setVoucherCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    customer,
    loading: loadingSPayLater,
    createTransaction,
    isRegistered,
  } = useSPayLater();
  const [spaylaterAdvancePayment, setSpaylaterAdvancePayment] = useState(0);

  // Coin states
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [coinToUse, setCoinToUse] = useState<number>(0);
  const [loadingCoin, setLoadingCoin] = useState(false);
  const [userPrivateKey, setUserPrivateKey] = useState<string>("");

  // Shipping address state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [hasAddress, setHasAddress] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const activeCart = isBuyNowMode ? buyNowCart : cart;
  const clearActiveCart = isBuyNowMode ? clearBuyNowCart : clearCart;
  // Load coin balance
  useEffect(() => {
    const loadCoinBalance = async () => {
      if (!user) return;
      
      setLoadingCoin(true);
      try {
        // Get user's coin balance
        const balanceData = await ethersService.getUserBalance(user.id);
        if (balanceData) {
          const balance = parseFloat(balanceData.balance);
          setCoinBalance(balance);
          console.log('💰 User coin balance:', balance);
        }

        // Get user's private key for transaction
        const privateKey = await walletService.getUserPrivateKey(user.id);
        if (privateKey) {
          setUserPrivateKey(privateKey);
        }
      } catch (error) {
        console.error("Error loading coin balance:", error);
      } finally {
        setLoadingCoin(false);
      }
    };

    loadCoinBalance();
  }, [user]);

  // Load address from last order
  useEffect(() => {
    const loadAddress = async () => {
      if (!user) return;
      setLoadingAddress(true);
      try {
        const lastAddress = await orderService.getLastShippingAddress(user.id);
        if (lastAddress) {
          setShippingName(lastAddress.shippingName);
          setShippingPhone(lastAddress.shippingPhone);
          setShippingAddress(lastAddress.shippingAddress);
          setHasAddress(true);
        }
      } catch (error) {
        console.error("Error loading address:", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadAddress();
  }, [user]);

  const paymentMethods = [
    { id: 1, name: "Thanh toán khi nhận hàng (COD)", icon: "cash" },
    { id: 2, name: "Ví MoMo", icon: "wallet" },
    { id: 3, name: "Thẻ ATM/Visa/Master", icon: "card" },
    { id: 4, name: "Chuyển khoản ngân hàng", icon: "business" },
    { id: 5, name: "Pay later", icon: "wallet" },
  ];

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("vi-VN") + " ₫";
  };

  const subtotal = activeCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingFee = 30000;
  const discount = 0;
  // Tính toán giảm giá từ coin (1 COIN = 1000 VND)
  const coinDiscount = coinToUse * 1000;
  const total = Math.max(0, subtotal + shippingFee - discount - coinDiscount);

  useEffect(() => {
    if (selectedPayment === 5 && customer) {
      setSpaylaterAdvancePayment(0);
    } else {
      setSpaylaterAdvancePayment(0);
    }
  }, [selectedPayment, total, customer]);

  const finalTotal = selectedPayment === 5 ? 0 : total;
  // Handle coin usage
  const handleUseMaxCoin = () => {
    const maxCoinCanUse = Math.min(
      coinBalance,
      Math.floor((subtotal + shippingFee - discount) / 1000)
    );
    setCoinToUse(maxCoinCanUse);
  };

  const handleCoinInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const maxCoinCanUse = Math.min(
      coinBalance,
      Math.floor((subtotal + shippingFee - discount) / 1000)
    );
    
    if (numValue > maxCoinCanUse) {
      Alert.alert(
        "Thông báo",
        `Số coin tối đa có thể sử dụng là ${maxCoinCanUse} COIN`
      );
      setCoinToUse(maxCoinCanUse);
    } else {
      setCoinToUse(numValue);
    }
  };

  const validateShippingInfo = () => {
    if (!shippingName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên người nhận");
      return false;
    }
    if (!shippingPhone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return false;
    }
    if (!shippingAddress.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ giao hàng");
      return false;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(shippingPhone.replace(/\s/g, ""))) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const handleSaveAddress = () => {
    if (validateShippingInfo()) {
      setHasAddress(true);
      setShowAddressModal(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (activeCart.length === 0) {
        Alert.alert(
          "Lỗi",
          "Giỏ hàng trống. Vui lòng thêm sản phẩm để đặt hàng."
        );
        return;
      }

      if (!user) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt hàng.");
        router.push("/login");
        return;
      }

      // Kiểm tra nếu chọn Pay Later nhưng chưa đăng ký
      if (selectedPayment === 5 && !isRegistered) {
        Alert.alert(
          "Chưa đăng ký Pay Later",
          "Bạn cần đăng ký SPayLater trước khi sử dụng. Bạn có muốn đăng ký ngay không?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đăng ký ngay",
              onPress: () => router.push("/spaylater/register"),
            },
          ]
        );
        return;
      }

      // Kiểm tra hạn mức khả dụng nếu chọn Pay Later
      if (selectedPayment === 5 && customer) {
        if (total > customer.availableCredit) {
          Alert.alert(
            "Hạn mức không đủ",
            `Đơn hàng ${formatPrice(
              total
            )} vượt quá hạn mức khả dụng của bạn (${formatPrice(
              customer.availableCredit
            )}).`
          );
          return;
        }
      }

      if (!hasAddress || !shippingName || !shippingPhone || !shippingAddress) {
        Alert.alert(
          "Thông tin giao hàng",
          "Vui lòng cung cấp đầy đủ thông tin giao hàng để tiếp tục.",
          [
            {
              text: "Nhập thông tin",
              onPress: () => setShowAddressModal(true),
            },
          ]
        );
        return;
      }

      // Kiểm tra nếu sử dụng coin
      if (coinToUse > 0) {
        if (coinToUse > coinBalance) {
          Alert.alert("Lỗi", "Số dư coin không đủ");
          return;
        }
        if (!userPrivateKey) {
          Alert.alert("Lỗi", "Không tìm thấy thông tin ví của bạn");
          return;
        }
      }

      setLoading(true);

      // Nếu sử dụng coin, chuyển coin cho contract owner (system)
      if (coinToUse > 0) {
        try {
          console.log('💸 Transferring', coinToUse, 'COIN to system...');
          // Get contract owner ID (giả sử owner ID = 1, bạn có thể điều chỉnh)
          const SYSTEM_OWNER_ID = 1;
          
          const transferResult = await ethersService.transferCoins(
            user.id,
            SYSTEM_OWNER_ID,
            coinToUse,
            userPrivateKey
          );

          if (!transferResult.success) {
            Alert.alert(
              "Lỗi thanh toán Coin",
              transferResult.error || "Không thể chuyển coin. Vui lòng thử lại."
            );
            return;
          }

          console.log('✅ Coin transferred successfully');
          
          // Cập nhật lại số dư coin
          const newBalance = await ethersService.getUserBalance(user.id);
          if (newBalance) {
            setCoinBalance(parseFloat(newBalance.balance));
          }
        } catch (error) {
          console.error('❌ Coin transfer error:', error);
          Alert.alert(
            "Lỗi",
            "Có lỗi xảy ra khi thanh toán bằng coin. Vui lòng thử lại."
          );
          return;
        }
      }

      const items = activeCart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const body = {
        customerId: user.id,
        items,
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: getPaymentMethodCode(selectedPayment),
        note: note.trim(),
        advancePaymentAmount: 0,
        coinDiscount: coinDiscount, // Thêm giảm giá coin
      };

      // Tạo đơn hàng
      const result = await orderService.createOrder(body);

      if (!result.success || !result.data) {
        Alert.alert(
          "Đặt hàng thất bại",
          result.error || "Không thể tạo đơn hàng. Vui lòng thử lại."
        );
        return;
      }

      console.log("Order created:", result.data);
      if (selectedPayment === 2) {
  try {
    console.log('Starting MoMo payment for order:', result.data.orderNumber);
    
    const momoResponse = await momoService.createPayment({
      orderId: result.data.orderNumber,
      amount: total,
      orderInfo: `Thanh toán đơn hàng ${result.data.orderNumber}`,
    });

    console.log('MoMo service response:', momoResponse);

    if (momoResponse.success && momoResponse.payUrl) {
      // Chuyển đến màn hình WebView
      router.push({
        pathname: '/momo_web',
        params: {
          payUrl: momoResponse.payUrl,
          orderNumber: result.data.orderNumber,
          orderData: JSON.stringify(result.data),
        },
      });
    } else {
      Alert.alert(
        "Lỗi thanh toán",
        momoResponse.message || "Không thể tạo yêu cầu thanh toán MoMo"
      );
    }
  } catch (error) {
    console.error("MoMo payment error:", error);
    Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo thanh toán MoMo");
  }
  return;
}
      // Nếu chọn Pay Later, tạo transaction trong SPayLater
      if (selectedPayment === 5 && result.data.id) {
        const transactionResult = await createTransaction(
          result.data.id,
          total
        );

        // IMPORTANT: Only create transaction if remainingAmount > 0
        if (!transactionResult.success) {
          
          console.log("Transaction result:", transactionResult);

          if (!transactionResult.success) {
            // Nếu tạo transaction thất bại, thông báo cho user
            Alert.alert(
              "Cảnh báo",
              `Đơn hàng đã được tạo nhưng có lỗi khi tạo giao dịch Pay Later: ${transactionResult.error}\n\nVui lòng liên hệ hỗ trợ.`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    clearCart();
                    router.push({
                      pathname: "/order_success",
                      params: {
                        orderData: JSON.stringify(result.data),
                        usedPayLater: "true",
                      },
                    });
                  },
                },
              ]
            );
            return;
          }
        }
      }

      clearActiveCart();

      router.push({
        pathname: "/order_success",
        params: {
          orderData: JSON.stringify(result.data),
          usedPayLater: selectedPayment === 5 ? "true" : "false",
          usedCoin: coinToUse > 0 ? "true" : "false",
          coinAmount: coinToUse.toString(),
        },
      });
    } catch (error) {
      console.error("Lỗi không mong muốn:", error);
      Alert.alert(
        "Lỗi",
        "Có lỗi hệ thống xảy ra. Vui lòng kiểm tra kết nối mạng."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl text-gray-900 ">Thanh toán</Text>
        <View style={{ width: 24 }} />
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
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text className="text-blue-600 font-medium text-sm">
                {hasAddress ? "Thay đổi" : "Thêm địa chỉ"}
              </Text>
            </TouchableOpacity>
          </View>

          {hasAddress ? (
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 font-semibold">
                  {shippingName} | {shippingPhone}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">{shippingAddress}</Text>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-blue-50 rounded-xl p-4 border-2 border-dashed border-blue-300"
              onPress={() => setShowAddressModal(true)}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
                <Text className="text-blue-600 font-semibold ml-2">
                  Thêm địa chỉ giao hàng
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Products */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="cart" size={20} color="#2563EB" />
            <Text className="text-gray-900 font-bold text-base ml-2">
              Sản phẩm ({activeCart.length})
            </Text>
          </View>

          {activeCart.map((item) => (
            <View
              key={item.id}
              className="flex-row mb-4 pb-4 border-b border-gray-100"
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
        </View>
        {/* Coin Payment Section */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="wallet" size={20} color="#F59E0B" />
              <Text className="text-gray-900 font-bold text-base ml-2">
                Sử dụng Coin
              </Text>
            </View>
            {loadingCoin ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
              <Text className="text-amber-600 font-semibold">
                {coinBalance.toFixed(0)} COIN
              </Text>
            )}
          </View>

          <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <Text className="text-amber-800 text-xs mb-3">
              💰 1 COIN = 1,000₫ | Tối đa: {Math.min(
                coinBalance,
                Math.floor((subtotal + shippingFee - discount) / 1000)
              )} COIN
            </Text>

            <View className="flex-row items-center space-x-2">
              <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 py-1 border border-amber-300">
                <Ionicons name="cash-outline" size={20} color="#F59E0B" />
                <TextInput
                  placeholder="Nhập số coin"
                  value={coinToUse.toString()}
                  onChangeText={handleCoinInputChange}
                  keyboardType="numeric"
                  className="flex-1 ml-3 text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-amber-600 font-semibold">COIN</Text>
              </View>
              
              <TouchableOpacity
                className="bg-amber-500 rounded-xl py-3 px-4"
                onPress={handleUseMaxCoin}
              >
                <Text className="text-white font-semibold text-xs">Tối đa</Text>
              </TouchableOpacity>
            </View>

            {coinToUse > 0 && (
              <View className="mt-3 pt-3 border-t border-amber-200">
                <View className="flex-row justify-between">
                  <Text className="text-amber-700 font-medium">
                    Giảm giá từ Coin:
                  </Text>
                  <Text className="text-green-600 font-bold">
                    -{formatPrice(coinDiscount)}
                  </Text>
                </View>
              </View>
            )}
          </View>
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
            <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
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
                  ? "bg-blue-50 border-blue-600"
                  : "bg-gray-50 border-gray-200"
              }`}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  selectedPayment === method.id
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selectedPayment === method.id && (
                  <View className="w-3 h-3 bg-blue-600 rounded-full" />
                )}
              </View>
              <Ionicons
                name={method.icon as any}
                size={24}
                color={selectedPayment === method.id ? "#2563EB" : "#6B7280"}
              />
              <Text
                className={`ml-3 font-medium ${
                  selectedPayment === method.id
                    ? "text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SPayLater Info */}
        {selectedPayment === 5 && customer && (
          <View className="mt-4 mx-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Text className="text-blue-800 font-semibold mb-2">
              🎉 Mua Trước - Trả Sau
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-sm">Hạn mức Tín dụng:</Text>
              {loadingSPayLater ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text className="text-blue-700 font-bold text-sm">
                  {formatPrice(customer.creditLimit)}
                </Text>
              )}
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-sm">Hạn mức Khả dụng:</Text>
              {loadingSPayLater ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text className="text-blue-700 font-bold text-sm">
                  {formatPrice(customer.availableCredit)}
                </Text>
              )}
            </View>

            <View className="border-t border-blue-200 pt-3 mt-3">
              <View className="bg-white rounded-lg p-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700 font-medium">Trả ngay:</Text>
                  <Text className="text-green-600 font-bold text-lg">0 ₫</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700 font-medium">
                    Trả sau (30 ngày):
                  </Text>
                  <Text className="text-orange-600 font-bold text-lg">
                    {formatPrice(total)}
                  </Text>
                </View>
              </View>

              <Text className="text-blue-600 text-xs mt-2 text-center">
                💡 Bạn không cần trả gì bây giờ. Sau 30 ngày, vui lòng thanh
                toán {formatPrice(total)}
              </Text>
            </View>

            {total > customer.availableCredit && (
              <View className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text className="text-red-600 text-sm">
                  ⚠️ Đơn hàng vượt quá hạn mức khả dụng của bạn!
                </Text>
              </View>
            )}
          </View>
        )}

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
          {selectedPayment === 5 && spaylaterAdvancePayment > 0 && (
            <View className="flex-row justify-between mb-3">
              <Text className="text-red-500">Ứng trước Pay Later</Text>
              <Text className="text-red-600 font-medium">
                -{formatPrice(spaylaterAdvancePayment)}
              </Text>
            </View>
          )}

          <View className="border-t border-gray-200 pt-3 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-bold text-lg">
                {selectedPayment === 5 ? "Trả sau 30 ngày" : "Tổng thanh toán"}
              </Text>
              <Text className="text-blue-600 font-bold text-xl">
                {selectedPayment === 5
                  ? formatPrice(total)
                  : formatPrice(finalTotal)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-gray-500 text-sm">
              {selectedPayment === 5 ? "Trả sau 30 ngày" : "Tổng thanh toán"}
            </Text>
            <Text className="text-blue-600 font-bold text-xl">
              {selectedPayment === 5
                ? formatPrice(total)
                : formatPrice(finalTotal)}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-xl py-4 px-8 ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {selectedPayment === 5 ? "Mua ngay, trả sau" : "Đặt hàng"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="bg-white rounded-t-3xl px-4 pt-6 pb-8"
            style={{ maxHeight: "80%" }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Thông tin giao hàng
              </Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Họ tên người nhận <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Nhập họ tên"
                  value={shippingName}
                  onChangeText={setShippingName}
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Số điện thoại <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Nhập số điện thoại"
                  value={shippingPhone}
                  onChangeText={setShippingPhone}
                  keyboardType="phone-pad"
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">
                  Địa chỉ giao hàng <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={shippingAddress}
                  onChangeText={setShippingAddress}
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className="bg-blue-600 rounded-xl py-4 items-center"
                onPress={handleSaveAddress}
              >
                <Text className="text-white font-bold text-base">
                  Lưu địa chỉ
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
