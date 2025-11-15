// app/(tabs)/orders.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Order, OrderStatus, orderService } from '@/services/orderService';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await orderService.getOrders({
        userId: user.id,
        userType: 'customer',
        ...(activeFilter !== 'all' && { status: activeFilter }),
        limit: 100,
      });

      if (result.success && result.data) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = (orderId: number) => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            const result = await orderService.cancelOrder(orderId);
            if (result.success) {
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
              fetchOrders();
            } else {
              Alert.alert('Lỗi', result.error || 'Không thể hủy đơn hàng');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: OrderStatus) => {
    const statusMap = {
      pending: {
        text: 'Chờ xác nhận',
        color: '#F59E0B',
        bg: '#FEF3C7',
        icon: 'time-outline' as const,
      },
      confirmed: {
        text: 'Đã xác nhận',
        color: '#3B82F6',
        bg: '#DBEAFE',
        icon: 'checkmark-circle' as const,
      },
      preparing: {
        text: 'Đang chuẩn bị',
        color: '#8B5CF6',
        bg: '#EDE9FE',
        icon: 'cube-outline' as const,
      },
      shipping: {
        text: 'Đang giao',
        color: '#06B6D4',
        bg: '#CFFAFE',
        icon: 'car-outline' as const,
      },
      delivered: {
        text: 'Đã giao',
        color: '#10B981',
        bg: '#D1FAE5',
        icon: 'checkmark-done-circle' as const,
      },
      cancelled: {
        text: 'Đã hủy',
        color: '#EF4444',
        bg: '#FEE2E2',
        icon: 'close-circle' as const,
      },
      returned: {
        text: 'Đã trả hàng',
        color: '#6B7280',
        bg: '#F3F4F6',
        icon: 'return-down-back' as const,
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    shipping: orders.filter((o) => o.status === 'shipping').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-4 pb-6"
      >
        <Text className="text-white text-2xl font-bold mb-1">
          Đơn hàng của tôi
        </Text>
        <Text className="text-blue-100 text-sm">
          {stats.all} đơn hàng
        </Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View className="px-4 -mt-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            className="mr-3"
          >
            <LinearGradient
              colors={
                activeFilter === 'all'
                  ? ['#3B82F6', '#2563EB']
                  : ['#FFFFFF', '#FFFFFF']
              }
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 100 }}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  activeFilter === 'all' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                Tất cả
              </Text>
              <Text
                className={`font-bold text-lg ${
                  activeFilter === 'all' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {stats.all}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('pending')}
            className="mr-3"
          >
            <LinearGradient
              colors={
                activeFilter === 'pending'
                  ? ['#F59E0B', '#D97706']
                  : ['#FFFFFF', '#FFFFFF']
              }
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 100 }}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  activeFilter === 'pending' ? 'text-orange-100' : 'text-gray-500'
                }`}
              >
                Chờ xác nhận
              </Text>
              <Text
                className={`font-bold text-lg ${
                  activeFilter === 'pending' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {stats.pending}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('shipping')}
            className="mr-3"
          >
            <LinearGradient
              colors={
                activeFilter === 'shipping'
                  ? ['#06B6D4', '#0891B2']
                  : ['#FFFFFF', '#FFFFFF']
              }
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 100 }}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  activeFilter === 'shipping' ? 'text-cyan-100' : 'text-gray-500'
                }`}
              >
                Đang giao
              </Text>
              <Text
                className={`font-bold text-lg ${
                  activeFilter === 'shipping' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {stats.shipping}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('delivered')}
            className="mr-3"
          >
            <LinearGradient
              colors={
                activeFilter === 'delivered'
                  ? ['#10B981', '#059669']
                  : ['#FFFFFF', '#FFFFFF']
              }
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 100 }}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  activeFilter === 'delivered' ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                Đã giao
              </Text>
              <Text
                className={`font-bold text-lg ${
                  activeFilter === 'delivered' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {stats.delivered}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length > 0 ? (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);

            return (
              <TouchableOpacity
                key={order.id}
                className="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-gray-100"
                onPress={() => router.push(`/order/${order.id}`)}
                activeOpacity={0.7}
              >
                {/* Order Header */}
                <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: statusInfo.bg }}
                    >
                      <Ionicons
                        name={statusInfo.icon}
                        size={20}
                        color={statusInfo.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold text-base">
                        {order.orderNumber}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-0.5">
                        {formatDate(order.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: statusInfo.bg }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: statusInfo.color }}
                    >
                      {statusInfo.text}
                    </Text>
                  </View>
                </View>

                {/* Order Items */}
                <View className="mb-3">
                  {order.items.slice(0, 2).map((item, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Image
                        source={{ uri: item.image || item.product.images[0] }}
                        className="w-12 h-12 rounded-xl"
                        resizeMode="cover"
                      />
                      <View className="flex-1 ml-3">
                        <Text
                          className="text-gray-900 font-medium text-sm"
                          numberOfLines={1}
                        >
                          {item.productName}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          x{item.quantity}
                        </Text>
                      </View>
                      <Text className="text-blue-600 font-bold text-sm">
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                  ))}
                  {order.items.length > 2 && (
                    <Text className="text-gray-500 text-xs text-center mt-1">
                      +{order.items.length - 2} sản phẩm khác
                    </Text>
                  )}
                </View>

                {/* Order Total */}
                <View className="pt-3 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 text-sm">
                      Tổng tiền ({order.items.length} sản phẩm):
                    </Text>
                    <Text className="text-blue-600 font-bold text-lg">
                      {formatPrice(order.totalAmount)}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  {order.status === 'pending' && (
                    <View className="flex-row mt-3">
                      <TouchableOpacity
                        onPress={() => handleCancelOrder(order.id)}
                        className="flex-1 bg-red-50 rounded-xl py-3 items-center mr-2"
                      >
                        <Text className="text-red-600 font-semibold">
                          Hủy đơn
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.push(`/order/${order.id}`)}
                        className="flex-1 bg-blue-600 rounded-xl py-3 items-center ml-2"
                      >
                        <Text className="text-white font-semibold">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {order.status === 'delivered' && (
                    <TouchableOpacity
                      onPress={() => router.push(`/order/${order.id}`)}
                      className="mt-3 bg-blue-600 rounded-xl py-3 items-center"
                    >
                      <Text className="text-white font-semibold">
                        Đánh giá
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="items-center justify-center py-16">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              Chưa có đơn hàng
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6">
              Bạn chưa có đơn hàng nào
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                className="px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-bold">
                  Mua sắm ngay
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}