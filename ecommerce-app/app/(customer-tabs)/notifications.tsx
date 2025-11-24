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
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!user) return; // nếu user null, thoát luôn

    try {
      setLoading(true);
      const response = await notificationService.getNotifications(user.id);
      setNotifications(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Đánh dấu tất cả',
      'Đánh dấu tất cả thông báo là đã đọc?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            if (!user) return;

            try {
              setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));

              await notificationService.markAllAsRead(user.id);
            } catch (err) {
              console.error("Failed to mark all as read:", err);
            }
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
          onPress: async () => {
            try {
              setNotifications(prev => prev.filter(n => n.id !== id));
              await notificationService.deleteNotification(id);
            } catch (err) {
              console.error("Failed to delete notification:", err);
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 1. Đánh dấu là đã đọc
    await markAsRead(notification.id);

    if (notification.actionUrl) {
      Alert.alert('Đã đọc', `Thông báo về "${notification.title}" đã được đánh dấu là đã đọc.`);
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  function getNotificationColors(color?: string): [string, string] {
    const base = color || '#3B82F6';
    return [base, base + 'CC'];
  }

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
        colors={["#3B82F6", "#9333EA"]} // blue-500 to purple-600
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
              className={`mr-3 px-4 py-2.5 rounded-xl flex-row items-center ${filter === btn.key
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
                className={`ml-2 font-semibold ${filter === btn.key
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
              className={`mb-3 rounded-2xl overflow-hidden ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-2 border-blue-200'
                }`}
              activeOpacity={0.7}
            >
              <View className="p-4">
                <View className="flex-row">
                  {/* Icon */}
                  <View className="mr-3">
                    <LinearGradient
                      colors={getNotificationColors(notification.color)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-12 h-12 rounded-xl items-center justify-center"
                    >
                      <Ionicons
                        name={notification.icon as keyof typeof Ionicons.glyphMap || 'notifications-outline'}
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