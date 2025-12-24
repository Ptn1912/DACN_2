// app/(seller-tabs)/order/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { orderService, Order } from "@/services/orderService";

export default function SellerOrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const idParam = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(Number(idParam));
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        Alert.alert("Lỗi", res.error || "Không thể tải đơn hàng");
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idParam) fetchOrder();
  }, [idParam]);

  // Prisma Decimal/string safe
  const toNum = (v: any) => (v === null || v === undefined ? 0 : Number(v));
  const formatPrice = (price: any) => toNum(price).toLocaleString("vi-VN") + "đ";

  const renderStars = (rating: number) => (
    <View className="flex-row items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i + 1 <= rating ? "star" : "star-outline"}
          size={14}
          color="#F59E0B"
        />
      ))}
      <Text className="text-gray-600 text-xs ml-2">{rating}/5</Text>
    </View>
  );

  const reviews = order?.reviews ?? [];

  // Gom review theo productId để render nhanh & gọn
  const reviewsByProductId = useMemo(() => {
    const map = new Map<number, typeof reviews>();
    for (const r of reviews) {
      const arr = map.get(r.productId) ?? [];
      arr.push(r);
      map.set(r.productId, arr);
    }
    return map;
  }, [reviews]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải chi tiết...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Không tìm thấy đơn hàng</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.push('/(seller-tabs)/orders')} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#2563EB" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-xs text-gray-500">Chi tiết đơn hàng</Text>
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              #{order.orderNumber}
            </Text>
          </View>

          <TouchableOpacity
            onPress={fetchOrder}
            className="bg-white border border-gray-200 rounded-full px-3 py-2"
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh" size={16} color="#2563EB" />
              <Text className="text-blue-600 font-semibold ml-2">Tải lại</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Customer card */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold" numberOfLines={1}>
                {order.customer?.fullName || "Khách hàng"}
              </Text>
              <Text className="text-gray-500 text-xs">Thông tin giao hàng</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text className="text-gray-700 ml-2">{order.shippingPhone}</Text>
          </View>

          <View className="flex-row">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-700 ml-2 flex-1">{order.shippingAddress}</Text>
          </View>
        </View>

        {/* Items */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-gray-900 font-bold mb-3">Sản phẩm</Text>

          {order.items.map((it, idx) => {
            const itemReviews = reviewsByProductId.get(it.productId) ?? [];
            const hasReview = itemReviews.length > 0;

            return (
              <View
                key={it.id}
                className={`pb-4 ${idx !== order.items.length - 1 ? "border-b border-gray-100 mb-4" : ""}`}
              >
                <View className="flex-row">
                  <Image
                    source={{
                      uri:
                        it.image ||
                        it.product?.images?.[0] ||
                        "https://via.placeholder.com/80",
                    }}
                    className="w-16 h-16 rounded-xl bg-gray-100"
                  />

                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-semibold" numberOfLines={2}>
                      {it.productName || it.product?.name}
                    </Text>

                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-500 text-xs">SL: </Text>
                      <Text className="text-gray-700 text-xs font-semibold">
                        {it.quantity}
                      </Text>

                      <View className="mx-2 w-1 h-1 rounded-full bg-gray-300" />

                      <Text className="text-gray-500 text-xs">Tạm tính:</Text>
                      <Text className="text-red-600 text-xs font-bold ml-1">
                        {formatPrice(it.subtotal)}
                      </Text>
                    </View>

                    {/* chip review */}
                    <View className="mt-2 self-start px-3 py-1 rounded-full border"
                      style={{
                        borderColor: hasReview ? "#F59E0B" : "#E5E7EB",
                        backgroundColor: hasReview ? "#FFFBEB" : "#F9FAFB",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: hasReview ? "#B45309" : "#6B7280" }}
                      >
                        {hasReview ? "Đã có đánh giá" : "Chưa có đánh giá"}
                      </Text>
                    </View>

                    {/* review cards */}
                    {hasReview && (
                      <View className="mt-3">
                        {itemReviews.map((r) => (
                          <View
                            key={r.id}
                            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-2"
                          >
                            <View className="flex-row items-center justify-between">
                              <Text className="text-gray-900 font-bold" numberOfLines={1}>
                                {r.user?.fullName || "Người mua"}
                              </Text>
                              {renderStars(r.rating)}
                            </View>

                            {!!r.comment && (
                              <Text className="text-gray-700 mt-2 leading-5">
                                {r.comment}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Payment summary */}
        <View className="bg-white rounded-2xl p-4 mb-8 border border-gray-100">
          <Text className="text-gray-900 font-bold mb-3">Thanh toán</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Phí vận chuyển</Text>
            <Text className="text-gray-900 font-semibold">
              {formatPrice(order.shippingFee)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">Tổng tiền</Text>
            <Text className="text-gray-900 font-semibold">
              {formatPrice(order.totalAmount)}
            </Text>
          </View>

          <View className="border-t border-gray-100 pt-3 flex-row justify-between">
            <Text className="text-gray-900 font-bold">Khách trả</Text>
            <Text className="text-red-600 font-extrabold text-lg">
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}