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

    const getPaymentStatusInfo = (paymentStatus: string) => {
        const map: Record<string, { text: string; color: string; bgColor: string; icon: string }> = {
            PENDING: { text: "Chưa thanh toán", color: "#F59E0B", bgColor: "#FEF3C7", icon: "time-outline" },
            COMPLETED: { text: "Đã thanh toán", color: "#10B981", bgColor: "#D1FAE5", icon: "checkmark-circle" },
            FAILED: { text: "Thanh toán thất bại", color: "#EF4444", bgColor: "#FEE2E2", icon: "close-circle" },
            REFUNDED: { text: "Đã hoàn tiền", color: "#8B5CF6", bgColor: "#EDE9FE", icon: "return-down-back" },
        };
        return map[paymentStatus] || { text: "Chưa xác định", color: "#6B7280", bgColor: "#F3F4F6", icon: "help-circle" };
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
                        const paymentInfo = getPaymentStatusInfo(order.paymentStatus);

                        return (
                            <TouchableOpacity
                                key={order.id}
                                className="bg-white rounded-xl p-4 mx-4 mb-3 shadow-md border border-gray-100"
                                onPress={() => router.push(`(customer-tabs)/order/${order.id}`)}
                            >
                                {/* Header: Order Number & Status */}
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-gray-900 text-base">#{order.orderNumber}</Text>
                                    
                                </View>

                                {/* Payment Status Badge */}
                                <View 
                                    style={{ backgroundColor: paymentInfo.bgColor }} 
                                    className="flex-row items-center px-3 py-2 rounded-lg mb-3"
                                >
                                    <Ionicons name={paymentInfo.icon as any} size={18} color={paymentInfo.color} />
                                    <Text style={{ color: paymentInfo.color }} className="font-semibold text-sm ml-2">
                                        {paymentInfo.text}
                                    </Text>
                                </View>

                                {/* Total Amount */}
                                <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                    <Text className="text-gray-600 text-sm">Tổng tiền:</Text>
                                    <Text className="text-blue-600 font-bold text-lg">{formatPrice(order.totalAmount)}</Text>
                                </View>

                                {/* Payment Method */}
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-600 text-sm">Phương thức:</Text>
                                    <Text className="text-gray-700 text-sm font-medium">
                                        {order.paymentMethod === 'cod' ? 'COD' : 
                                         order.paymentMethod === 'momo' ? 'MoMo' : 
                                         order.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' :
                                         order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                                         order.paymentMethod}
                                    </Text>
                                </View>

                                {/* Order Date */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Ngày đặt:</Text>
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