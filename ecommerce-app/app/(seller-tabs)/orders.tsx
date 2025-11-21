// app/(tabs)/orders.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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


  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await orderService.getOrders({
        userId: user.id,
        userType: 'seller',
        ...(activeFilter !== 'all' && { status: activeFilter }),
        limit: 100,
      });

      if (result.success && result.data) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      Alert.alert('Lỗi', 'Không thể tải đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const stats = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  const filterTabs = useMemo(() => ([
    { key: 'all' as const, text: 'Tất cả', count: stats.all, colors: ['#3B82F6', '#2563EB'], textInactive: 'text-gray-500', textActive: 'text-blue-100', bgActive: 'text-white' },
    { key: 'pending' as const, text: 'Chờ xác nhận', count: stats.pending, colors: ['#F59E0B', '#D97706'], textInactive: 'text-gray-500', textActive: 'text-orange-100', bgActive: 'text-white' },
    { key: 'confirmed' as const, text: 'Đã xác nhận', count: stats.confirmed, colors: ['#3B82F6', '#2563EB'], textInactive: 'text-gray-500', textActive: 'text-blue-100', bgActive: 'text-white' },
    { key: 'shipping' as const, text: 'Đang giao', count: stats.shipping, colors: ['#06B6D4', '#0891B2'], textInactive: 'text-gray-500', textActive: 'text-cyan-100', bgActive: 'text-white' },
    { key: 'delivered' as const, text: 'Đã giao', count: stats.delivered, colors: ['#10B981', '#059669'], textInactive: 'text-gray-500', textActive: 'text-green-100', bgActive: 'text-white' },
    { key: 'cancelled' as const, text: 'Đã hủy', count: stats.cancelled, colors: ['#EF4444', '#B91C1C'], textInactive: 'text-gray-500', textActive: 'text-red-100', bgActive: 'text-white' },
  ]), [stats]);

  const handleUpdateStatus = (orderId: number, targetStatus: OrderStatus, successMessage: string, updateFunction: (id: number) => Promise<{ success: boolean; error?: string }>) => {
    Alert.alert(
      'Xác nhận hành động',
      `Bạn có chắc muốn chuyển đơn hàng này sang trạng thái "${getStatusInfo(targetStatus).text}"?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: getStatusInfo(targetStatus).text,
          style: 'default',
          onPress: async () => {
            const result = await updateFunction(orderId);
            if (result.success) {
              Alert.alert('Thành công', successMessage);
              fetchOrders();
            } else {
              Alert.alert('Lỗi', result.error || 'Không thể thực hiện hành động này.');
            }
          },
        },
      ]
    );
  };

  const handleConfirmOrder = (orderId: number) => {
    console.log('Order ID passed to handleUpdateStatus:', orderId);
    handleUpdateStatus(orderId, 'confirmed', 'Đã xác nhận đơn hàng thành công.', (id) => orderService.confirmOrder(id));
  };

  // Nút Hủy đơn
  const handleCancelOrder = (orderId: number) => {
    handleUpdateStatus(orderId, 'cancelled', 'Đã hủy đơn hàng thành công.', (id) => orderService.cancelOrder(id));
  };

  // Nút Chuẩn bị xong/Bắt đầu giao (Confirmed/Preparing -> Shipping) - Giả định API
  const handleShipOrder = (orderId: number) => {
    // Tùy thuộc vào business logic, API này có thể là 'shipOrder'
    // Giả định orderService có hàm shipOrder
    handleUpdateStatus(orderId, 'shipping', 'Đơn hàng đã được chuyển sang trạng thái Đang giao.', (id) => orderService.shipOrder(id));
  };

  // Hiển thị Loading toàn màn hình khi mới vào
  if (loading && orders.length === 0 && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => {
  return Number(price).toLocaleString('vi-VN') + ' ₫';
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
          Đơn hàng của Shop
        </Text>
        <Text className="text-blue-100 text-sm">
          Bạn có tổng cộng **{stats.all}** đơn hàng cần xử lý
        </Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View className="px-4 -mt-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              className="mr-3"
            >
              <LinearGradient
                colors={
                  (activeFilter === tab.key 
                    ? tab.colors 
                    : ['#FFFFFF', '#FFFFFF']) as [string, string, ...string[]]
                }
                className="px-5 py-4 rounded-2xl shadow-md border border-gray-100"
                style={{ minWidth: 120, elevation: activeFilter === tab.key ? 5 : 2 }} // Elevation cho Android shadow
              >
                <Text
                  className={`text-xs font-medium mb-1 ${activeFilter === tab.key ? tab.textActive : tab.textInactive
                    }`}
                >
                  {tab.text}
                </Text>
                <Text
                  className={`font-bold text-lg ${activeFilter === tab.key ? tab.bgActive : 'text-gray-900'
                    }`}
                >
                  {tab.count}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {/* --- DANH SÁCH ĐƠN HÀNG --- */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {orders.length > 0 ? (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const isPending = order.status === 'pending';
            const isConfirmed = order.status === 'confirmed' || order.status === 'preparing';
            const isShipped = order.status === 'shipping';
            const isDelivered = order.status === 'delivered';

            return (
              <TouchableOpacity
                key={order.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-md border border-gray-100"
                onPress={() => router.push(`/(seller-tabs)/order/[id]`)}
                activeOpacity={0.8}
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
                        #{order.orderNumber}
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

                {/* Order Items Summary */}
                <View className="mb-3">
                  {order.items.slice(0, 2).map((item, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Image
                        source={{ uri: item.image || item.product.images[0] || 'https://via.placeholder.com/50' }}
                        className="w-12 h-12 rounded-lg border border-gray-200"
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
                    <Text className="text-gray-500 text-xs text-center mt-1 italic">
                      +{order.items.length - 2} sản phẩm khác
                    </Text>
                  )}
                </View>

                {/* Order Total */}
                <View className="pt-3 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 text-sm">
                      Tổng tiền ({order.items.length} SP):
                    </Text>
                    <Text className="text-red-600 font-bold text-xl">
                      {formatPrice(order.totalAmount)}
                    </Text>
                  </View>

                  {/* Action Buttons - Tối ưu cho người bán */}
                  <View className="flex-row mt-3">
                    {/* Hành động chính cho trạng thái Chờ xác nhận */}
                    {isPending && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleCancelOrder(order.id)}
                          className="flex-1 bg-red-50 rounded-xl py-3 items-center mr-2 border border-red-200"
                        >
                          <Text className="text-red-600 font-semibold">
                            ❌ Hủy đơn
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleConfirmOrder(order.id)}
                          className="flex-1 bg-green-600 rounded-xl py-3 items-center ml-2"
                        >
                          <Text className="text-white font-semibold">
                            ✅ Xác nhận đơn
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Hành động chính cho trạng thái Đã xác nhận/Đang chuẩn bị */}
                    {isConfirmed && (
                      <TouchableOpacity
                        onPress={() => handleShipOrder(order.id)}
                        className="flex-1 bg-cyan-600 rounded-xl py-3 items-center"
                      >
                        <Text className="text-white font-semibold">
                          🚀 Bắt đầu Giao hàng
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Nếu không có hành động chính, hiển thị chi tiết */}
                    {!isPending && !isConfirmed && !isDelivered && (
                      <TouchableOpacity
                        onPress={() => router.push(`/(seller-tabs)/order/[id]`)}
                        className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
                      >
                        <Text className="text-white font-semibold">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Nút đánh giá (Giữ lại cho trường hợp người bán muốn xem đánh giá) */}
                    {isDelivered && (
                      <TouchableOpacity
                        onPress={() => router.push(`/(seller-tabs)/order/[id]`)} // Giả định có trang đánh giá
                        className="flex-1 bg-yellow-600 rounded-xl py-3 items-center"
                      >
                        <Text className="text-white font-semibold">
                          ⭐ Xem Đánh giá
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
              Chưa có đơn hàng nào
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6">
              Các đơn hàng mới sẽ xuất hiện ở đây.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(seller-tabs)/products')}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                className="px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-bold">
                  ➕ Quản lý Sản phẩm
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