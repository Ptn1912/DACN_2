import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { getOrderById, cancelOrder, requestReturn, confirmDelivered } from "@/services/orderService";
import { LinearGradient } from "expo-linear-gradient";

export default function OrderDetailScreen() {
  const route = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(Number(orderId));
      setOrder(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && user?.id) fetchOrder();
  }, [orderId, user?.id]);

  const getStatusInfo = (status: string) => {
    const map: Record<string, { text: string; color: string; bgColor: string; icon: string }> = {
      pending: { text: "Chờ thanh toán", color: "#F59E0B", bgColor: "#FEF3C7", icon: "time-outline" },
      confirmed: { text: "Đã xác nhận", color: "#3B82F6", bgColor: "#DBEAFE", icon: "checkmark-circle-outline" },
      preparing: { text: "Đang chuẩn bị", color: "#8B5CF6", bgColor: "#EDE9FE", icon: "cube-outline" },
      shipping: { text: "Đang giao", color: "#06B6D4", bgColor: "#CFFAFE", icon: "car-outline" },
      delivered: { text: "Hoàn thành", color: "#10B981", bgColor: "#D1FAE5", icon: "checkmark-done-circle-outline" },
      cancelled: { text: "Đã hủy", color: "#EF4444", bgColor: "#FEE2E2", icon: "close-circle-outline" },
      returned: { text: "Đã trả hàng", color: "#6B7280", bgColor: "#F3F4F6", icon: "return-down-back-outline" },
    };
    return map[status] || { text: status, color: "#000", bgColor: "#F3F4F6", icon: "help-circle-outline" };
  };

  const getPaymentStatusInfo = (paymentStatus: string) => {
    const map: Record<string, { text: string; color: string; bgColor: string; icon: string }> = {
      PENDING: { text: "Chưa thanh toán", color: "#F59E0B", bgColor: "#FEF3C7", icon: "time-outline" },
      COMPLETED: { text: "Đã thanh toán", color: "#10B981", bgColor: "#D1FAE5", icon: "checkmark-circle" },
      FAILED: { text: "Thanh toán thất bại", color: "#EF4444", bgColor: "#FEE2E2", icon: "close-circle" },
      REFUNDED: { text: "Đã hoàn tiền", color: "#8B5CF6", bgColor: "#EDE9FE", icon: "return-down-back" },
    };
    return map[paymentStatus] || { text: "Chưa xác định", color: "#6B7280", bgColor: "#F3F4F6", icon: "help-circle" };
  };

  const getPaymentMethodText = (method: string) => {
    const map: Record<string, string> = {
      cod: "Thanh toán khi nhận hàng (COD)",
      momo: "Ví MoMo",
      credit_card: "Thẻ tín dụng/ATM",
      bank_transfer: "Chuyển khoản ngân hàng",
      spaylater: "Trả sau (SPayLater)",
    };
    return map[method] || method;
  };

  const handleCancel = async () => {
    Alert.alert("Hủy đơn", "Bạn có chắc muốn hủy đơn hàng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdating(true);
            await cancelOrder(order.id);
            fetchOrder();
          } catch (err) {
            console.log(err);
            Alert.alert("Lỗi", "Không thể hủy đơn hàng");
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const handleReturn = async () => {
    Alert.alert("Yêu cầu trả hàng", "Bạn có muốn yêu cầu trả hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdating(true);
            await requestReturn(order.id);
            fetchOrder();
          } catch (err) {
            console.log(err);
            Alert.alert("Lỗi", "Không thể gửi yêu cầu trả hàng");
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const handleConfirmDelivered = () => {
    Alert.alert("Xác nhận", "Bạn đã nhận được hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdating(true);
            await confirmDelivered(order.id);
            fetchOrder();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xác nhận");
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải chi tiết đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Không tìm thấy đơn hàng</Text>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.push("/(customer-tabs)/all_orders")}>
            <Ionicons name="chevron-back" size={28} color="#2563EB" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Order Number Card */}
        <LinearGradient
                  colors={["#3B82F6", "#9333EA"]} // blue-500 to purple-600
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    marginHorizontal: 16,
                    marginTop: 16,
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
        <View className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 mb-4">
          <Text className="text-white text-sm opacity-90 mb-1">Mã đơn hàng</Text>
          <Text className="text-white text-2xl font-bold">#{order.orderNumber}</Text>
          <Text className="text-white text-xs opacity-80 mt-2">{formatDate(order.createdAt)}</Text>
        </View>
</LinearGradient>
        {/* Status Card */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-3">Trạng thái đơn hàng</Text>
          
          {/* Payment Status */}
          <View 
            style={{ backgroundColor: paymentInfo.bgColor }} 
            className="flex-row items-center px-4 py-3 rounded-lg"
          >
            <Ionicons name={paymentInfo.icon as any} size={24} color={paymentInfo.color} />
            <View className="flex-1 ml-3">
              <Text className="text-gray-600 text-xs">Thanh toán</Text>
              <Text style={{ color: paymentInfo.color }} className="font-bold text-base">
                {paymentInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Info */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={20} color="#3B82F6" />
            <Text className="font-semibold text-gray-700 ml-2">Thông tin giao hàng</Text>
          </View>
          
          <View className="bg-gray-50 rounded-lg p-3">
            <View className="flex-row items-start mb-2">
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text className="text-gray-900 font-medium ml-2">{order.shippingName}</Text>
            </View>
            <View className="flex-row items-start mb-2">
              <Ionicons name="call-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{order.shippingPhone}</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="navigate-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 flex-1">{order.shippingAddress}</Text>
            </View>
          </View>
        </View>

        {/* Products */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="cart" size={20} color="#3B82F6" />
            <Text className="font-semibold text-gray-700 ml-2">Sản phẩm ({order.items.length})</Text>
          </View>
          
          {order.items.map((item: any, index: number) => (
            <View 
              key={item.id} 
              className={`flex-row items-center py-3 ${index !== order.items.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <Image 
                source={{ uri: item.image || item.product?.images[0] }} 
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium mb-1" numberOfLines={2}>
                  {item.productName || item.product?.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {formatPrice(item.price)} x {item.quantity}
                </Text>
              </View>
              <Text className="text-blue-600 font-bold ml-2">{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center mb-2">
            <Ionicons name="card" size={20} color="#3B82F6" />
            <Text className="font-semibold text-gray-700 ml-2">Phương thức thanh toán</Text>
          </View>
          <Text className="text-gray-900 font-medium">{getPaymentMethodText(order.paymentMethod)}</Text>
        </View>

        {/* Order Note */}
        {order.note && (
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document-text" size={20} color="#3B82F6" />
              <Text className="font-semibold text-gray-700 ml-2">Ghi chú</Text>
            </View>
            <Text className="text-gray-600 italic">{order.note}</Text>
          </View>
        )}

        {/* Summary */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-3">Chi tiết thanh toán</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Tổng tiền sản phẩm</Text>
            <Text className="text-gray-900 font-medium">{formatPrice(order.totalAmount - order.shippingFee)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Phí vận chuyển</Text>
            <Text className="text-gray-900 font-medium">{formatPrice(order.shippingFee)}</Text>
          </View>
          
          <View className="border-t border-gray-200 pt-3 flex-row justify-between">
            <Text className="font-bold text-gray-900 text-lg">Tổng thanh toán</Text>
            <Text className="font-bold text-blue-600 text-xl">{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mb-8">
          {/* pending → chỉ được hủy */}
          {order.status === "pending" && (
            <TouchableOpacity
              className="bg-red-500 rounded-xl py-4 items-center flex-row justify-center mb-2"
              onPress={handleCancel}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                  <Text className="text-white font-bold text-base ml-2">Hủy đơn hàng</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* shipping → chỉ được nhận hàng hoặc trả hàng */}
          {order.status === "shipping" && (
            <>
              <TouchableOpacity
                className="bg-green-600 rounded-xl py-4 items-center flex-row justify-center mb-2"
                onPress={handleConfirmDelivered}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text className="text-white font-bold text-base ml-2">Đã nhận hàng</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-yellow-500 rounded-xl py-4 items-center flex-row justify-center"
                onPress={handleReturn}
                disabled={updating}
              >
                <Ionicons name="return-down-back" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">Yêu cầu trả hàng</Text>
              </TouchableOpacity>
            </>
          )}

          {/* delivered → chỉ cho trả hàng */}
          {order.status === "delivered" && (
            <TouchableOpacity
              className="bg-yellow-500 rounded-xl py-4 items-center flex-row justify-center"
              onPress={handleReturn}
              disabled={updating}
            >
              <Ionicons name="return-down-back" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Yêu cầu trả hàng</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}