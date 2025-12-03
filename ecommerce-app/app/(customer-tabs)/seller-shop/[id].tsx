// app/seller-shop/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { productService, Product } from "@/services/productService";
import { LinearGradient } from "expo-linear-gradient";
import { useChat } from '@/hooks/useChat'; // Thêm import
import { useAuth } from '@/hooks/useAuth'; // Thêm import

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

interface SellerInfo {
  id: number;
  fullName: string;
  totalProducts: number;
  totalSold: number;
  rating: number;
  joinedDate: string;
}

export default function SellerShopScreen() {
  const { id } = useLocalSearchParams(); // Sử dụng id thay vì sellerId
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular">("newest");
  const [selectedTab, setSelectedTab] = useState<"all" | "bestseller" | "new">("all");

  // Thêm hooks cho chat
  const { startNewConversation } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    fetchSellerData();
  }, [id]); // Sử dụng id

  useEffect(() => {
    applySortAndFilter();
  }, [products, sortBy, selectedTab]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);

      // Fetch all products and filter by seller
      const result = await productService.getProducts({ limit: 100 });

      if (result.success && result.data) {
        const sellerProducts = result.data.products.filter(
          (p) => p.seller.id === Number(id) // Sử dụng id
        );

        setProducts(sellerProducts);

        // Calculate seller info from products
        if (sellerProducts.length > 0) {
          const totalSold = sellerProducts.reduce((sum, p) => sum + p.soldCount, 0);
          const avgRating =
            sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length;

          setSellerInfo({
            id: Number(id), // Sử dụng id
            fullName: sellerProducts[0].seller.fullName,
            totalProducts: sellerProducts.length,
            totalSold,
            rating: parseFloat(avgRating.toFixed(1)),
            joinedDate: new Date(sellerProducts[0].createdAt).toLocaleDateString("vi-VN"),
          });
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
  if (!user) {
    Alert.alert(
      "Đăng nhập required",
      "Vui lòng đăng nhập để chat với người bán",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => router.push("/(auth)/login") }
      ]
    );
    return;
  }

  if (!sellerInfo) return;

  try {
    const conversation = await startNewConversation(
      sellerInfo.id.toString(),
      sellerInfo.fullName,
      `Xin chào, tôi quan tâm đến cửa hàng của bạn`
    );
    
    // Chuyển đến chat screen với conversationId
    router.push({
      pathname: '/(customer-tabs)/chat',
      params: { conversationId: conversation.id }
    });
    
  } catch (error) {
    console.error('Error starting conversation:', error);
    Alert.alert("Lỗi", "Không thể bắt đầu trò chuyện");
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerData();
    setRefreshing(false);
  };

  const applySortAndFilter = () => {
    let filtered = [...products];

    // Apply tab filter
    switch (selectedTab) {
      case "bestseller":
        filtered = filtered.filter((p) => p.soldCount > 50);
        break;
      case "new":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filtered = filtered.filter(
          (p) => new Date(p.createdAt) > oneMonthAgo
        );
        break;
      case "all":
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "popular":
        filtered.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("vi-VN") + " ₫";
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-100"
      style={{ width: ITEM_WIDTH }}
      onPress={() => {
        router.push({
          pathname: "/(customer-tabs)/product-customer/[id]",
          params: { id: item.id.toString() },
        });
      }}
    >
      <Image
        source={{ uri: item.images[0] || "https://via.placeholder.com/200" }}
        style={{ width: "100%", height: ITEM_WIDTH * 0.8 }}
        resizeMode="cover"
      />

      <View className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 flex-row items-center">
        <Ionicons name="star" size={12} color="#F59E0B" />
        <Text className="text-xs text-gray-800 ml-1 font-semibold">
          {item.rating}
        </Text>
      </View>

      {item.soldCount > 100 && (
        <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-bold">HOT</Text>
        </View>
      )}

      <View className="p-3">
        <Text
          numberOfLines={2}
          className="text-sm font-semibold text-gray-900 mb-1"
        >
          {item.name}
        </Text>

        <Text className="text-blue-600 font-bold text-base mb-1">
          {formatPrice(item.price)}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500 text-xs">Đã bán {item.soldCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!sellerInfo) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="storefront-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-900 text-lg font-bold mt-4">
          Không tìm thấy cửa hàng
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push('/(customer-tabs)/mall')}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl">Cửa hàng</Text>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="share-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Seller Info Card */}
        <LinearGradient
          colors={["#3B82F6", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 rounded-3xl p-6"
        >
          <View className="flex-row items-center mb-4">
            <View className="bg-white rounded-full p-4 mr-4">
              <Ionicons name="storefront" size={32} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-xl mb-1">
                {sellerInfo.fullName}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#FCD34D" />
                <Text className="text-white/90 text-sm ml-1">
                  {sellerInfo.rating} • Tham gia {sellerInfo.joinedDate}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-white/10 rounded-2xl p-4">
            <View className="flex-1 items-center border-r border-white/20">
              <Text className="text-white/80 text-xs mb-1">Sản phẩm</Text>
              <Text className="text-white font-bold text-lg">
                {sellerInfo.totalProducts}
              </Text>
            </View>
            <View className="flex-1 items-center border-r border-white/20">
              <Text className="text-white/80 text-xs mb-1">Đã bán</Text>
              <Text className="text-white font-bold text-lg">
                {sellerInfo.totalSold}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-white/80 text-xs mb-1">Đánh giá</Text>
              <Text className="text-white font-bold text-lg">
                {sellerInfo.rating}
              </Text>
            </View>
          </View>

          <View className="flex-row mt-4 space-x-3">
            {/* Cập nhật nút Chat ngay */}
            <TouchableOpacity 
              onPress={handleChat}
              className="flex-1 bg-white rounded-2xl py-3 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={18} color="#3B82F6" />
                <Text className="text-blue-600 font-bold text-sm ml-2">
                  Chat ngay
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white/20 rounded-2xl py-3 items-center">
              <View className="flex-row items-center">
                <Ionicons name="add-outline" size={18} color="#fff" />
                <Text className="text-white font-bold text-sm ml-2">
                  Theo dõi
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Phần còn lại giữ nguyên */}
        {/* Tabs */}
        <View className="px-4 mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            <TouchableOpacity
              onPress={() => setSelectedTab("all")}
              className={`px-6 py-2 rounded-xl mr-2 ${
                selectedTab === "all" ? "bg-blue-600" : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === "all" ? "text-white" : "text-gray-700"
                }`}
              >
                Tất cả ({products.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab("bestseller")}
              className={`px-6 py-2 rounded-xl mr-2 ${
                selectedTab === "bestseller" ? "bg-blue-600" : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === "bestseller" ? "text-white" : "text-gray-700"
                }`}
              >
                Bán chạy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab("new")}
              className={`px-6 py-2 rounded-xl ${
                selectedTab === "new" ? "bg-blue-600" : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === "new" ? "text-white" : "text-gray-700"
                }`}
              >
                Mới nhất
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Sort Options */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold text-base">
              {filteredProducts.length} sản phẩm
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setSortBy("newest")}
                className={`px-4 py-1.5 rounded-xl mr-2 ${
                  sortBy === "newest" ? "bg-blue-100" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "newest" ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  Mới nhất
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("popular")}
                className={`px-4 py-1.5 rounded-xl mr-2 ${
                  sortBy === "popular" ? "bg-blue-100" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "popular" ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  Phổ biến
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("price_asc")}
                className={`px-4 py-1.5 rounded-xl mr-2 ${
                  sortBy === "price_asc" ? "bg-blue-100" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "price_asc" ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  Giá thấp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSortBy("price_desc")}
                className={`px-4 py-1.5 rounded-xl ${
                  sortBy === "price_desc" ? "bg-blue-100" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === "price_desc" ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  Giá cao
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <View className="px-4 pb-6">
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">
              Không có sản phẩm nào
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}