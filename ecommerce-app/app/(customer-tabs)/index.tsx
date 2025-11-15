// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { productService, Product, Category } from "@/services/productService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("vi-VN") + " ₫";
  };
  const getDisplayName = () => {
    if (!user?.fullName) return "Người dùng";
    const names = user.fullName.split(" ");
    return names; // Lấy tên (last word)
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center space-x-4">
          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-1">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row">
            <TouchableOpacity
              className="relative mr-4"
              onPress={() => router.push("/(customer-tabs)/cart")}
            >
              <Ionicons name="cart-outline" size={26} color="#1F2937" />
              <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">5</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="relative">
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner */}
        <View className="px-4 mt-4">
          <LinearGradient
            colors={["#3B82F6", "#9333EA"]} // blue-500 to purple-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              marginHorizontal: 14,
              marginTop: 6,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <Text className="text-white text-2xl font-bold mb-2">
              Flash Sale 50%
            </Text>
            <Text className="text-white/90 text-base mb-3">
              Ưu đãi có hạn - Mua ngay!
            </Text>
            <TouchableOpacity className="bg-white rounded-lg py-2 px-5 self-start">
              <Text className="text-blue-600 font-semibold">Xem ngay</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Categories */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Danh mục</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {categories.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className="items-center mb-4"
                  style={{ width: "30%" }}
                  onPress={() => {
                    // TODO: Navigate to category products
                    console.log("Category:", category.name);
                  }}
                >
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: category.color + "20" }}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={28}
                      color={category.color}
                    />
                  </View>
                  <Text className="text-gray-700 text-sm text-center">
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2">
                Đang tải danh mục...
              </Text>
            </View>
          )}
        </View>

        {/* Products */}
        <View className="px-4 mt-4 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Sản phẩm nổi bật
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {products.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  className="bg-white rounded-2xl p-3 mb-4 border border-gray-100"
                  style={{ width: "48%" }}
                  onPress={() => {
                    router.push({
                      pathname: "/product-customer/[id]",
                      params: { id: product.id.toString() },
                    });
                  }}
                >
                  <Image
                    source={{
                      uri:
                        product.images[0] || "https://via.placeholder.com/150",
                    }}
                    className="w-full h-32 rounded-xl mb-3"
                    resizeMode="cover"
                  />
                  <Text
                    className="text-gray-900 font-semibold text-sm mb-1"
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {product.rating} | Đã bán {product.soldCount}
                    </Text>
                  </View>
                  <Text className="text-blue-600 font-bold text-base">
                    {formatPrice(product.price)}
                  </Text>

                  {/* Stock indicator */}
                  {product.stock < 10 && (
                    <View className="mt-2">
                      <Text className="text-red-500 text-xs">
                        Chỉ còn {product.stock} sản phẩm
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2">
                Chưa có sản phẩm
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
