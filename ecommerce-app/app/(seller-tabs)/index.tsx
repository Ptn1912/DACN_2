import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Category, Product, productService } from "@/services/productService";
import { LinearGradient } from "expo-linear-gradient";
import { aiService } from "@/services/aiService";

export default function SellerDashboardScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    totalSold: 0,
    averageRating: 0,
  });

  const fetchAiRecommendation = async () => {
    setIsAiLoading(true);

    const result = await aiService.getBusinessRecommendation(user!.id);

    if (result.success) {
      setAiRecommendation(result.data);
    } else {
      setAiRecommendation(result.error);
    }

    setIsAiLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user?.id) return;

      // Fetch categories và products của seller
      const [categoriesResult, productsResult] = await Promise.all([
        productService.getCategories(),
        productService.getProducts({ 
          sellerId: user.id,
          limit: 100 // Lấy tất cả để tính stats
        }),
      ]);

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data.categories);
      }

      if (productsResult.success && productsResult.data) {
        const allProducts = productsResult.data.products;
        setProducts(allProducts);

        // Tính toán stats từ dữ liệu thực
        const totalProducts = allProducts.length;
        const inStockProducts = allProducts.filter(p => p.stock > 0).length;
        const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;
        const totalSold = allProducts.reduce((sum, p) => sum + p.soldCount, 0);
        const averageRating = totalProducts > 0
          ? allProducts.reduce((sum, p) => sum + p.rating, 0) / totalProducts
          : 0;

        setStats({
          totalProducts,
          inStockProducts,
          outOfStockProducts,
          totalSold,
          averageRating,
        });
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

  const dashboardStats = [
    {
      id: 1,
      label: "Tổng sản phẩm",
      value: stats.totalProducts.toString(),
      change: `${stats.outOfStockProducts} hết hàng`,
      icon: "cube-outline",
      color: "#3B82F6",
      bgColor: "#DBEAFE",
    },
    {
      id: 2,
      label: "Đã bán",
      value: stats.totalSold.toString(),
      change: `${stats.inStockProducts} còn hàng`,
      icon: "checkmark-circle-outline",
      color: "#10B981",
      bgColor: "#D1FAE5",
    },
    {
      id: 3,
      label: "Còn trong kho",
      value: stats.inStockProducts.toString(),
      change: `${stats.totalProducts} tổng`,
      icon: "folder-outline",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
    },
    {
      id: 4,
      label: "Đánh giá TB",
      value: stats.averageRating.toFixed(1),
      change: "Trên 5 sao",
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
      onPress: () => router.push('/(seller-tabs)/orders'),
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
      label: "Thống kê",
      icon: "analytics-outline",
      color: "#EC4899",
      onPress: () => {}, // Có thể thêm trang thống kê sau
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const getDisplayName = () => {
    if (!user?.fullName) return "Người bán";
    const names = user.fullName.split(" ");
    return names[names.length - 1];
  };

  // Lấy top 5 sản phẩm bán chạy nhất
  const topProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  // Lấy sản phẩm sắp hết hàng (stock < 10)
  const lowStockProducts = products
    .filter(p => p.stock > 0 && p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-sm">Xin chào 👋</Text>
            <Text className="text-xl font-bold text-gray-900">
              {getDisplayName()}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={26} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="chatbubble-outline" size={26} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Thống kê tổng quan
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {dashboardStats.map((stat) => (
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
                <Text className="text-gray-600 text-xs font-medium">
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
                onPress={action.onPress}
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
        {stats.averageRating >= 4.0 && (
          <View className="px-4 mt-6 mb-2">
            <LinearGradient
              colors={["#3B82F6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl p-5"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="trophy" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">
                  Hiệu suất tốt
                </Text>
              </View>
              <Text className="text-white/90 text-sm mb-3">
                Đánh giá trung bình {stats.averageRating.toFixed(1)}/5.0 - Tiếp tục phát huy!
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-white font-semibold text-sm">
                  Xem chi tiết →
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Sắp hết hàng
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(seller-tabs)/products')}>
                <Text className="text-blue-600 font-medium text-sm">
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            {lowStockProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-sm mb-1">
                      {product.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {product.category.name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="bg-orange-100 px-3 py-1 rounded-lg">
                      <Text className="text-orange-800 text-xs font-semibold">
                        Còn {product.stock}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">
                      {formatPrice(product.price)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Top Products */}
        {topProducts.length > 0 && (
          <View className="px-4 mt-6 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Sản phẩm bán chạy
              </Text>
              <TouchableOpacity onPress={() => router.push('/(seller-tabs)/products')}>
                <Text className="text-blue-600 font-medium text-sm">
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            {topProducts.map((product, index) => (
              <TouchableOpacity
                key={product.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-sm mb-1">
                      {product.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {/* {product.rating ? product.rating.toFixed(1) : '0.0'} •  */}
                        Đã bán {product.soldCount || 0}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-blue-600 font-bold text-sm">
                      {formatPrice(product.price)}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      Kho: {product.stock}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <View className="px-4 py-12 items-center">
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4 text-center">
              Chưa có sản phẩm nào
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Thêm sản phẩm đầu tiên để bắt đầu bán hàng
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(seller-tabs)/add-product')}
              className="bg-blue-600 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-semibold">
                Thêm sản phẩm
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {/* AI Chatbot Button */}
      <TouchableOpacity
        onPress={() => router.push('/(seller-tabs)/chatAI')}
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          backgroundColor: "#FAFAFA",
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 10,
        }}
      >
        <Image
          source={require('@/assets/chatbot.png')} 
          style={{ width: 50, height: 50 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}