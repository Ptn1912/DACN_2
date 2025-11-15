// app/(tabs)/notifications.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Types
type NotificationType = 'order' | 'promotion' | 'system' | 'review' | 'message';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  color: string;
  actionUrl?: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Simulate API call - Replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'Đơn hàng mới',
          message: 'Bạn có 1 đơn hàng mới #12345 cần xác nhận',
          time: '5 phút trước',
          isRead: false,
          icon: 'cart',
          color: '#3B82F6',
          actionUrl: '/orders/12345',
        },
        {
          id: '2',
          type: 'promotion',
          title: 'Flash Sale đang diễn ra',
          message: 'Giảm giá đến 50% cho hơn 1000 sản phẩm. Nhanh tay kẻo lỡ!',
          time: '1 giờ trước',
          isRead: false,
          icon: 'pricetag',
          color: '#F59E0B',
        },
        {
          id: '3',
          type: 'order',
          title: 'Đơn hàng đã giao',
          message: 'Đơn hàng #12344 đã được giao thành công',
          time: '2 giờ trước',
          isRead: true,
          icon: 'checkmark-circle',
          color: '#10B981',
          actionUrl: '/orders/12344',
        },
        {
          id: '4',
          type: 'review',
          title: 'Đánh giá mới',
          message: 'Khách hàng đã đánh giá 5⭐ cho sản phẩm iPhone 15 Pro',
          time: '3 giờ trước',
          isRead: true,
          icon: 'star',
          color: '#F59E0B',
        },
        {
          id: '5',
          type: 'system',
          title: 'Cập nhật hệ thống',
          message: 'Phiên bản 2.0 đã có mặt với nhiều tính năng mới',
          time: '1 ngày trước',
          isRead: true,
          icon: 'information-circle',
          color: '#8B5CF6',
        },
        {
          id: '6',
          type: 'message',
          title: 'Tin nhắn mới',
          message: 'Bạn có 3 tin nhắn chưa đọc từ khách hàng',
          time: '1 ngày trước',
          isRead: true,
          icon: 'chatbubble',
          color: '#EC4899',
        },
        {
          id: '7',
          type: 'order',
          title: 'Đơn hàng đã hủy',
          message: 'Đơn hàng #12343 đã được hủy bởi khách hàng',
          time: '2 ngày trước',
          isRead: true,
          icon: 'close-circle',
          color: '#EF4444',
          actionUrl: '/orders/12343',
        },
        {
          id: '8',
          type: 'promotion',
          title: 'Mã giảm giá mới',
          message: 'Bạn nhận được mã giảm 100K cho đơn hàng tiếp theo',
          time: '3 ngày trước',
          isRead: true,
          icon: 'gift',
          color: '#F59E0B',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Đánh dấu tất cả',
      'Đánh dấu tất cả thông báo là đã đọc?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => {
            setNotifications(prev =>
              prev.map(notif => ({ ...notif, isRead: true }))
            );
          },
        },
      ]
    );
  };

  const deleteNotification = (id: string) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có chắc muốn xóa thông báo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      // Navigate to action URL
      // router.push(notification.actionUrl);
      Alert.alert('Thông báo', `Chuyển đến: ${notification.actionUrl}`);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filterButtons = [
    { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
    { key: 'order', label: 'Đơn hàng', icon: 'cart-outline' },
    { key: 'promotion', label: 'Khuyến mãi', icon: 'pricetag-outline' },
    { key: 'system', label: 'Hệ thống', icon: 'settings-outline' },
  ];

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4 text-base">Đang tải thông báo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">
              Thông báo
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
            </Text>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-white/20 rounded-2xl px-4 py-2.5"
            >
              <Text className="text-white font-semibold text-sm">
                Đọc tất cả
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row -mx-4 px-4"
        >
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              onPress={() => setFilter(btn.key as any)}
              className={`mr-3 px-4 py-2.5 rounded-xl flex-row items-center ${
                filter === btn.key
                  ? 'bg-white'
                  : 'bg-white/20'
              }`}
            >
              <Ionicons
                name={btn.icon as any}
                size={18}
                color={filter === btn.key ? '#3B82F6' : '#FFF'}
              />
              <Text
                className={`ml-2 font-semibold ${
                  filter === btn.key
                    ? 'text-blue-600'
                    : 'text-white'
                }`}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Notifications List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              className={`mb-3 rounded-2xl overflow-hidden ${
                notification.isRead ? 'bg-white' : 'bg-blue-50 border-2 border-blue-200'
              }`}
              activeOpacity={0.7}
            >
              <View className="p-4">
                <View className="flex-row">
                  {/* Icon */}
                  <View className="mr-3">
                    <LinearGradient
                      colors={[notification.color, notification.color + 'CC']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-12 h-12 rounded-xl items-center justify-center"
                    >
                      <Ionicons
                        name={notification.icon as any}
                        size={24}
                        color="#FFF"
                      />
                    </LinearGradient>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text className="text-gray-900 font-bold text-base flex-1">
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View className="w-2.5 h-2.5 bg-blue-600 rounded-full ml-2 mt-1" />
                      )}
                    </View>
                    
                    <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                      {notification.message}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1">
                          {notification.time}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        className="p-1"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-8 mb-4">
              <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              Không có thông báo
            </Text>
            <Text className="text-gray-500 text-sm text-center px-8">
              {filter === 'all' 
                ? 'Bạn chưa có thông báo nào' 
                : `Không có thông báo ${filterButtons.find(b => b.key === filter)?.label.toLowerCase()}`
              }
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Floating Action Button */}
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={markAllAsRead}
          className="absolute bottom-6 right-6"
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="checkmark-done" size={24} color="#fff" />
          </LinearGradient>
          {/* Badge */}
          <View className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}