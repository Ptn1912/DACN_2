import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Category, Product, productService } from "@/services/productService";
import { LinearGradient } from "expo-linear-gradient";

export default function SellerDashboardScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories and products in parallel
      const [categoriesResult, productsResult] = await Promise.all([
        productService.getCategories(),
        productService.getProducts({ limit: 10 }),
      ]);

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data.categories);
      }

      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data.products);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (authLoading || (loading && products.length === 0)) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const stats = [
    {
      id: 1,
      label: "Đơn hàng hôm nay",
      value: "12",
      change: "+3 từ hôm qua",
      icon: "receipt-outline",
      color: "#3B82F6",
      bgColor: "#DBEAFE",
    },
    {
      id: 2,
      label: "Doanh số hôm nay",
      value: "8.5M",
      change: "+12% từ hôm qua",
      icon: "wallet-outline",
      color: "#10B981",
      bgColor: "#D1FAE5",
    },
    {
      id: 3,
      label: "Sản phẩm",
      value: "156",
      change: "24 hết hàng",
      icon: "cube-outline",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
    },
    {
      id: 4,
      label: "Rating",
      value: "4.8",
      change: "98% khách hài lòng",
      icon: "star-outline",
      color: "#EC4899",
      bgColor: "#FCE7F3",
    },
  ];

  const quickActions = [
    {
      id: 1,
      label: "Thêm sản phẩm",
      icon: "add-circle-outline",
      color: "#2563EB",
      onPress: () => router.push('/(seller-tabs)/add-product'),
    },
    {
      id: 2,
      label: "Xem đơn hàng",
      icon: "layers-outline",
      color: "#10B981",
    },
    {
      id: 3,
      label: "Quản lý kho",
      icon: "folder-outline",
      color: "#F59E0B",
      onPress: () => router.push('/(seller-tabs)/products'),
    },
    {
      id: 4,
      label: "Chat với khách",
      icon: "chatbubble-outline",
      color: "#EC4899",
    },
  ];

  const recentOrders = [
    {
      id: 1,
      orderNumber: "DH2024100401",
      customer: "Nguyễn Văn A",
      amount: 29990000,
      status: "Chờ giao",
      time: "2 giờ trước",
      items: 1,
    },
    {
      id: 2,
      orderNumber: "DH2024100402",
      customer: "Trần Thị B",
      amount: 6490000,
      status: "Đang giao",
      time: "1 giờ trước",
      items: 2,
    },
    {
      id: 3,
      orderNumber: "DH2024100403",
      customer: "Lê Văn C",
      amount: 15990000,
      status: "Hoàn thành",
      time: "30 phút trước",
      items: 1,
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };
  if (authLoading || loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </SafeAreaView>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ giao":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "Đang giao":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "Hoàn thành":
        return { bg: "#D1FAE5", text: "#065F46" };
      default:
        return { bg: "#F3F4F6", text: "#374151" };
    }
  };

  const getDisplayName = () => {
    if (!user?.fullName) return "Người bán";
    const names = user.fullName.split(" ");
    return names; // Lấy tên (last word)
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-sm">Xin chào 👋</Text>
            <Text className="text-xl font-bold text-gray-900">
              {getDisplayName() || "Người bán"}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={26} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={26} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Thống kê ngày hôm nay
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {stats.map((stat) => (
              <TouchableOpacity
                key={stat.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                style={{ width: "48%" }}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Ionicons
                    name={stat.icon as any}
                    size={24}
                    color={stat.color}
                  />
                </View>
                <Text className="text-gray-500 text-xs mb-1">{stat.label}</Text>
                <Text className="text-gray-900 font-bold text-lg mb-2">
                  {stat.value}
                </Text>
                <Text className="text-green-600 text-xs font-medium">
                  {stat.change}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Thao tác nhanh
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="bg-white rounded-2xl p-4 mb-3 items-center border border-gray-100"
                style={{ width: "48%" }}
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: action.color + "15" }}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={28}
                    color={action.color}
                  />
                </View>
                <Text className="text-gray-900 font-semibold text-sm text-center">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Performance Banner */}
        <View className="px-4 mt-6 mb-2">
          <LinearGradient
            colors={["#3B82F6", "#06B6D4"]} // from-blue-500 to-cyan-500
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-2xl p-5"
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="trending-up" size={20} color="#fff" />
              <Text className="text-white font-bold ml-2">
                Hiệu suất cửa hàng
              </Text>
            </View>
            <Text className="text-white/90 text-sm mb-3">
              Cửa hàng của bạn đang trong top 10% bán hàng
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-white font-semibold text-sm">
                Xem chi tiết →
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Recent Orders */}
        <View className="px-4 mt-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Đơn hàng gần đây
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium text-sm">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-sm mb-1">
                    {order.orderNumber}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {order.customer} • {order.items} sản phẩm
                  </Text>
                </View>
                <View
                  className="px-3 py-1 rounded-lg"
                  style={{ backgroundColor: getStatusColor(order.status).bg }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: getStatusColor(order.status).text }}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <Text className="text-gray-600 text-xs">{order.time}</Text>
                <Text className="text-blue-600 font-bold text-sm">
                  {formatPrice(order.amount)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
