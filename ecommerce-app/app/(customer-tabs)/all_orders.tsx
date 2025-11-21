import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";

export default function BuyerOrdersScreen() {
    const { user } = useAuth();
    const { orders, isLoading, error, refresh } = useOrders(user?.id);
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = useCallback(async () => {
        await refresh();
    }, [refresh]);

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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 mt-4">Đang tải đơn hàng...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-red-500">{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}
            >
                <Text className="text-gray-900 text-2xl px-4 py-4 justify-center">Đơn hàng của tôi ({orders.length})</Text>

                {orders.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-900 font-bold text-lg mt-4">Chưa có đơn hàng nào</Text>
                        <Text className="text-gray-500 text-sm mt-2 text-center">
                            Các đơn hàng mới sẽ xuất hiện ở đây.
                        </Text>
                    </View>
                ) : (
                    orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);

                        return (
                            <TouchableOpacity
                                key={order.id}
                                className="bg-white rounded-xl p-4 mx-4 mb-3 shadow-md border border-gray-100"
                                onPress={() => router.push(`(customer-tabs)/order/${order.id}`)} // dẫn tới trang chi tiết đơn hàng
                            >
                                <View className="flex-row justify-between mb-2">
                                    <Text className="font-bold text-gray-900">#{order.id}</Text>
                                    <Text style={{ color: statusInfo.color }} className="font-semibold">
                                        {statusInfo.text}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-500 text-sm">Tổng tiền:</Text>
                                    <Text className="text-red-600 font-bold">{formatPrice(order.totalAmount)}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500 text-sm">Ngày đặt:</Text>
                                    <Text className="text-gray-700 text-sm">{formatDate(order.createdAt)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}
