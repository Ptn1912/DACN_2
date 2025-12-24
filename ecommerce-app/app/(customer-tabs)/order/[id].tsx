import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { getOrderById, cancelOrder, requestReturn, confirmDelivered } from "@/services/orderService";
import { reviewService } from "@/services/reviewService";


export default function OrderDetailScreen() {
  const route = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  const [openReviewFor, setOpenReviewFor] = useState<number | null>(null); // productId đang mở form
  const [reviewDraft, setReviewDraft] = useState<Record<number, { rating: number; comment: string }>>({});
  const [reviewSubmitting, setReviewSubmitting] = useState<Record<number, boolean>>({});
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());
  const myUserId = user?.id ? Number(user.id) : null;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(Number(orderId));
      setOrder(data);

      const uid = myUserId;
      const reviewed = new Set<number>(
        (data?.reviews || [])
          .filter((r: any) => Number(r.userId) === uid)
          .map((r: any) => Number(r.productId))
      );
      setReviewedProductIds(reviewed);
      setOpenReviewFor((cur) => (cur && reviewed.has(cur) ? null : cur));
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && myUserId) fetchOrder();
  }, [orderId, myUserId]);

  const getStatusInfo = (status: string) => {
    const map: Record<string, { text: string; color: string }> = {
      pending: { text: "Chờ thanh toán", color: "#F59E0B" },
      confirmed: { text: "Đã xác nhận", color: "#3B82F6" },
      preparing: { text: "Đang chuẩn bị", color: "#8B5CF6" },
      shipping: { text: "Đang giao", color: "#06B6D4" },
      delivered: { text: "Hoàn thành", color: "#10B981" },
      cancelled: { text: "Đã hủy", color: "#EF4444" },
      returned: { text: "Đã trả hàng", color: "#6B7280" },
    };
    return map[status] || { text: status, color: "#000" };
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

  const getDraft = (productId: number) => {
    return reviewDraft[productId] || { rating: 5, comment: "" };
  };

  const setDraft = (productId: number, data: Partial<{ rating: number; comment: string }>) => {
    setReviewDraft((prev) => ({
      ...prev,
      [productId]: { ...getDraft(productId), ...data },
    }));
  };

  const submitReview = async (productId: number) => {
    if (!user?.id) return;
    if (!order?.id) return;

    const { rating, comment } = getDraft(productId);
    if (rating < 1 || rating > 5) {
      Alert.alert("Lỗi", "Số sao phải từ 1 đến 5");
      return;
    }

    try {
      setReviewSubmitting((p) => ({ ...p, [productId]: true }));

      await reviewService.createReview({
        productId,
        orderId: order.id,
        userId: user.id,
        rating,
        comment,
      });

      Alert.alert("Thành công", "Đã gửi đánh giá!");
      setReviewedProductIds((prev) => new Set([...Array.from(prev), productId]));
      setOpenReviewFor(null);

      fetchOrder();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Lỗi", e?.response?.data?.error || "Không thể gửi đánh giá");
    } finally {
      setReviewSubmitting((p) => ({ ...p, [productId]: false }));
    }
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  };
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.push('/(customer-tabs)/all_orders')}>
            <Ionicons name="chevron-back" size={28} color="#2563EB" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Chi tiết đơn #{order.id}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Status */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-1">Trạng thái</Text>
          <Text style={{ color: statusInfo.color }} className="font-bold text-lg">
            {statusInfo.text}
          </Text>
        </View>

        {/* Products */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-2">Sản phẩm</Text>

          {order.items.map((item: any) => {
            const hasReviewed =
              !!myUserId &&
              (order?.reviews || []).some(
                (r: any) =>
                  Number(r.productId) === Number(item.productId) &&
                  Number(r.userId) === Number(myUserId)
              );

            const isOpen = openReviewFor === Number(item.productId);

            return (
              <View key={item.id} className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Image
                    source={{ uri: item.image || item.product?.images?.[0] }}
                    className="w-16 h-16 rounded-lg"
                  />

                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">
                      {item.productName || item.product?.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">Số lượng: {item.quantity}</Text>
                  </View>

                  <Text className="text-red-600 font-bold">
                    {formatPrice(item.subtotal)}
                  </Text>
                </View>

                {order.status === "delivered" && (
                  <View className="mt-2">
                    {hasReviewed ? (
                      <View className="bg-green-50 border border-green-200 rounded-xl p-3 flex-row items-center">
                        <Ionicons name="checkmark-circle" size={18} color="#059669" />
                        <Text className="text-green-700  ml-2">
                          Bạn đã đánh giá sản phẩm này
                        </Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          className={`rounded-xl py-2.5 items-center ${isOpen ? "bg-gray-300" : "bg-yellow-500"
                            }`}
                          onPress={() =>
                            setOpenReviewFor(isOpen ? null : Number(item.productId))
                          }
                          activeOpacity={0.9}
                        >
                          <Text
                            className={`font-bold ${isOpen ? "text-gray-800" : "text-white"
                              }`}
                          >
                            {isOpen ? "Đóng đánh giá" : "⭐ Đánh giá"}
                          </Text>
                        </TouchableOpacity>

                        {isOpen && (
                          <View className="mt-3 bg-white rounded-2xl p-4 border border-gray-200">
                            <Text className="text-gray-900 font-bold mb-2">Chọn số sao</Text>

                            <View className="flex-row items-center mb-3">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const star = i + 1;
                                const draft = getDraft(Number(item.productId));

                                return (
                                  <TouchableOpacity
                                    key={star}
                                    onPress={() =>
                                      setDraft(Number(item.productId), { rating: star })
                                    }
                                    className="mr-1"
                                  >
                                    <Ionicons
                                      name={star <= draft.rating ? "star" : "star-outline"}
                                      size={28}
                                      color={star <= draft.rating ? "#F59E0B" : "#D1D5DB"}
                                    />
                                  </TouchableOpacity>
                                );
                              })}

                              <Text className="ml-2 text-gray-500 text-xs">
                                {getDraft(Number(item.productId)).rating}/5
                              </Text>
                            </View>

                            <Text className="text-gray-900 font-bold mb-2">Nhận xét</Text>

                            <TextInput
                              value={getDraft(Number(item.productId)).comment}
                              onChangeText={(t) =>
                                setDraft(Number(item.productId), { comment: t })
                              }
                              placeholder="Chia sẻ cảm nhận..."
                              multiline
                              className="border border-gray-200 rounded-xl p-3 text-gray-900"
                              style={{ minHeight: 90, textAlignVertical: "top" }}
                            />

                            <TouchableOpacity
                              className={`mt-4 rounded-xl py-3 items-center ${reviewSubmitting[Number(item.productId)]
                                  ? "bg-gray-300"
                                  : "bg-blue-600"
                                }`}
                              disabled={!!reviewSubmitting[Number(item.productId)]}
                              onPress={async () => {
                                const stillReviewed =
                                  !!myUserId &&
                                  (order?.reviews || []).some(
                                    (r: any) =>
                                      Number(r.productId) === Number(item.productId) &&
                                      Number(r.userId) === Number(myUserId)
                                  );
                                if (stillReviewed) {
                                  setOpenReviewFor(null);
                                  return Alert.alert("Thông báo", "Bạn đã đánh giá sản phẩm này rồi.");
                                }
                                await submitReview(Number(item.productId));
                              }}
                              activeOpacity={0.9}
                            >
                              <Text className="text-white font-bold">
                                {reviewSubmitting[Number(item.productId)]
                                  ? "Đang gửi..."
                                  : "Gửi đánh giá"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500">Tổng tiền sản phẩm</Text>
            <Text className="text-gray-900 font-bold">{formatPrice(order.totalAmount - order.shippingFee)}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500">Phí vận chuyển</Text>
            <Text className="text-gray-900 font-bold">{formatPrice(order.shippingFee)}</Text>
          </View>
          <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
            <Text className="font-bold text-gray-700">Tổng thanh toán</Text>
            <Text className="font-bold text-red-600">{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mb-8">
          {/* pending → chỉ được hủy */}
          {order.status === "pending" && (
            <TouchableOpacity
              className="bg-red-500 rounded-xl py-3 items-center mb-2"
              onPress={handleCancel}
              disabled={updating}
            >
              <Text className="text-white font-bold">Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {/* shipping → chỉ được nhận hàng hoặc trả hàng */}
          {order.status === "shipping" && (
            <>
              <TouchableOpacity
                className="bg-green-600 rounded-xl py-3 items-center mb-2"
                onPress={handleConfirmDelivered}
                disabled={updating}
              >
                <Text className="text-white font-bold">Đã nhận hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-yellow-500 rounded-xl py-3 items-center"
                onPress={handleReturn}
                disabled={updating}
              >
                <Text className="text-white font-bold">Yêu cầu trả hàng</Text>
              </TouchableOpacity>
            </>
          )}

          {/* delivered → chỉ cho trả hàng (nếu bạn cho phép trả sau khi đã giao) */}
          {order.status === "delivered" && (
            <TouchableOpacity
              className="bg-yellow-500 rounded-xl py-3 items-center"
              onPress={handleReturn}
              disabled={updating}
            >
              <Text className="text-white font-bold">Yêu cầu trả hàng</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}