// app/(tabs)/profile.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const { user, isLoading, logout } = useAuth();

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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      id: 1,
      icon: "receipt-outline",
      title: "Đơn hàng của tôi",
      subtitle: "Xem lịch sử đơn hàng",
      color: "#3B82F6",
    },
    {
      id: 2,
      icon: "heart-outline",
      title: "Sản phẩm yêu thích",
      subtitle: "Danh sách yêu thích",
      color: "#EF4444",
    },
    {
      id: 3,
      icon: "location-outline",
      title: "Địa chỉ giao hàng",
      subtitle: "Quản lý địa chỉ",
      color: "#10B981",
    },
    {
      id: 4,
      icon: "card-outline",
      title: "Phương thức thanh toán",
      subtitle: "Thẻ & Ví điện tử",
      color: "#F59E0B",
    },
    {
      id: 5,
      icon: "notifications-outline",
      title: "Thông báo",
      subtitle: "Cài đặt thông báo",
      color: "#8B5CF6",
    },
    {
      id: 6,
      icon: "settings-outline",
      title: "Cài đặt",
      subtitle: "Cài đặt tài khoản",
      color: "#6B7280",
    },
  ];

  const quickActions = [
    { id: 1, icon: "wallet-outline", title: "Ví", count: "2.5M" },
    { id: 2, icon: "gift-outline", title: "Voucher", count: "12" },
    { id: 3, icon: "star-outline", title: "Điểm", count: "850" },
  ];
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
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Tài khoản</Text>
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
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center">
              <Ionicons name="person" size={32} color="#2563EB" />
            </View>
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
            <TouchableOpacity>
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between mt-6">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="bg-white/20 rounded-xl p-3 items-center flex-1 mx-1"
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
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium text-sm">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between">
            {[
              { icon: "wallet", label: "Chờ thanh toán", count: 2 },
              { icon: "cube", label: "Đang giao", count: 1 },
              { icon: "checkmark-circle", label: "Hoàn thành", count: 15 },
              { icon: "return-down-back", label: "Trả hàng", count: 0 },
            ].map((status, index) => (
              <TouchableOpacity key={index} className="items-center flex-1">
                <View className="relative">
                  <Ionicons
                    name={status.icon as any}
                    size={28}
                    color="#2563EB"
                  />
                  {status.count > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {status.count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 text-xs mt-2 text-center">
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-4 mt-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
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
