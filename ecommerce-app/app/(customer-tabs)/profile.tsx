// app/(tabs)/profile.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useOrders } from "../../hooks/useOrders";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import web3Service from "@/services/ethersService";

export default function ProfileScreen() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const {
    orders,
    isLoading: ordersLoading,
    refresh: refreshOrders,
  } = useOrders(user?.id);
  const [balance, setBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
<<<<<<< HEAD
  const { cart } = useCart();
=======
  const { cart, removeFromCart, updateQuantity } = useCart();
>>>>>>> bdc11782 (Completed 24/12)

  useEffect(() => {
    if (user?.id) {
      loadBalance();
    }
  }, [user?.id]);

  const loadBalance = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingBalance(true);
      const userBalance = await web3Service.getUserBalance(user.id);
      if (userBalance) {
        setBalance(userBalance.balance);
      }
    } catch (error: any) {
      console.error("Load balance error:", error);
      // Không throw error để không làm crash app
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadBalance(), refreshOrders()]);
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  if (ordersLoading && isLoadingBalance) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const orderCounts = {
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipping: orders.filter((o) => o.status === "shipping").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const menuItems = [
    {
      id: 1,
      icon: "receipt-outline",
      title: "Đơn hàng của tôi",
      subtitle: "Xem lịch sử đơn hàng",
      color: "#3B82F6",
      route: "/(customer-tabs)/all_orders",
    },
    {
      id: 2,
      icon: "heart-outline",
      title: "Sản phẩm yêu thích",
      subtitle: "Danh sách yêu thích",
      color: "#EF4444",
      route: undefined,
    },
    {
      id: 3,
      icon: "location-outline",
      title: "Địa chỉ giao hàng",
      subtitle: "Quản lý địa chỉ",
      color: "#10B981",
      route: undefined,
    },
    {
      id: 4,
      icon: "card-outline",
      title: "Phương thức thanh toán",
      subtitle: "Thẻ & Ví điện tử",
      color: "#F59E0B",
      route: undefined,
    },
    {
      id: 5,
      icon: "notifications-outline",
      title: "Thông báo",
      subtitle: "Cài đặt thông báo",
      color: "#8B5CF6",
      route: "/(customer-tabs)/notifications",
    },
    {
      id: 6,
      icon: "settings-outline",
      title: "Cài đặt",
      subtitle: "Cài đặt tài khoản",
      color: "#6B7280",
      route: "/(customer-tabs)/settings",
    },
  ];

  const quickActions = [
    {
      id: 1,
      icon: "wallet-outline",
      title: "SPayLater",
      count: "₫ 2.5M",
      onPress: (router: any) => router.push("/spaylater"),
    },
    { id: 2, icon: "gift-outline", title: "Voucher", count: "12" },
    {
      id: 3,
      icon: "logo-bitcoin",
      title: "Điểm",
      count: balance,
      onPress: (router: any) => router.push("/(customer-tabs)/coin_transfer"),
    },
  ];
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0];
  };

  // Format user type display
  const getUserTypeDisplay = () => {
    if (user?.userType === "seller") {
      return { text: "Người bán", color: "#EA580C", bgColor: "#FFEDD5" };
    }
    return { text: "Khách hàng", color: "#2563EB", bgColor: "#DBEAFE" };
  };

  const userTypeInfo = getUserTypeDisplay();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-2 border-b border-gray-100">
        <View className="flex-row items-center justify-end mb-4">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="relative mr-4"
              onPress={() => router.push("/(customer-tabs)/cart")}
            >
              <Ionicons name="cart-outline" size={26} color="#1F2937" />
              <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {cart.length}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="relative" onPress={()=> router.push("/(customer-tabs)/inbox")}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={26}
                color="#1F2937"
              />
              <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
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
          <View className="flex-row items-center">
            {/* Avatar with Image Support */}
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="w-16 h-16 bg-white rounded-full items-center justify-center">
                <Ionicons name="person" size={32} color="#2563EB" />
              </View>
            )}
            <View className="flex-1 ml-4">
              <Text className="text-white font-bold text-xl">
                {user?.fullName || "Người dùng"}
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                {user?.email || "Chưa có email"}
              </Text>
              <Text className="text-white/80 text-sm">
                {user?.phone || "Chưa có số điện thoại"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(customer-tabs)/settings")}>
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between mt-6">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="bg-white/20 rounded-xl p-3 items-center flex-1 mx-1"
                onPress={() => action.onPress?.(router)}
              >
                <Ionicons name={action.icon as any} size={24} color="#fff" />
                <Text className="text-white font-semibold text-xs mt-2">
                  {action.title}
                </Text>
                <Text className="text-white/90 text-xs mt-1">
                  {action.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Order Status */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 font-bold text-base">
              Đơn hàng của tôi
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(customer-tabs)/all_orders")}
            >
              <Text className="text-blue-600 font-medium text-sm">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            {[
              {
                icon: "wallet",
                label: "Chờ thanh toán",
                statusKey: "confirmed",
              },
              { icon: "cube", label: "Đang giao", statusKey: "shipping" },
              {
                icon: "checkmark-circle",
                label: "Hoàn thành",
                statusKey: "delivered",
              },
              {
                icon: "return-down-back",
                label: "Trả hàng",
                statusKey: "returned",
              },
            ].map((status, index) => {
              const count =
                orderCounts[status.statusKey as keyof typeof orderCounts] ||
                orders.length;

              return (
                <TouchableOpacity
                  key={index}
                  className="items-center flex-1"
                  onPress={() =>
                    router.push(
                      `/(customer-tabs)/all_orders?status=${status.statusKey}`
                    )
                  }
                >
                  <View className="relative">
                    <Ionicons
                      name={status.icon as any}
                      size={28}
                      color="#2563EB"
                    />
                    {count > 0 && (
                      <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {count}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-600 text-xs mt-2 text-center">
                    {status.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-4 mt-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route)}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-900 font-semibold text-base">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-sm mt-0.5">
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help & Support */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-gray-900 font-bold text-base mb-4">Hỗ trợ</Text>
          <TouchableOpacity className="flex-row items-center mb-4">
            <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
            <Text className="text-gray-700 ml-3 flex-1">
              Trung tâm trợ giúp
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="chatbubbles-outline" size={24} color="#6B7280" />
            <Text className="text-gray-700 ml-3 flex-1">Liên hệ hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-4 flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-base ml-2">
            Đăng xuất
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs mb-8">
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
