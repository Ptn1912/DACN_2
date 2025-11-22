// app/mall.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { productService, Product } from "@/services/productService";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const HORIZ_PADDING = 16;
const GAP = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - HORIZ_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const ITEMS_PER_PAGE = 8;

export default function AllProductsScreen() {
  const { category } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  useEffect(() => {
    fetchData();
  }, [category, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const productsResult = await productService.getProducts({ 
        categoryId: category ? Number(category) : undefined,
        sortBy: sortBy,
        limit: 100,
      });

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

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const pagedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, page]);

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  };

  const toggleFav = (id: number) => {
    setFavorites((s) => ({ ...s, [id]: !s[id] }));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    
    for (let i = 0; i < full; i++) {
      stars.push(<Ionicons key={`s${i}`} name="star" size={12} color="#F59E0B" />);
    }
    
    if (half) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#F59E0B" />);
    }
    
    const emptyCount = 5 - stars.length;
    for (let i = 0; i < emptyCount; i++) {
      stars.push(<Ionicons key={`e${i}`} name="star-outline" size={12} color="#F59E0B" />);
    }
    
    return <View className="flex-row items-center">{stars}</View>;
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3"
      style={{
        width: ITEM_WIDTH,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
      activeOpacity={0.9}
      onPress={() => {
        router.push({
          pathname: '/(customer-tabs)/product-customer/[id]',
          params: { id: item.id.toString() }
        });
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: item.images[0] || 'https://via.placeholder.com/200' }}
          style={{ width: "100%", height: ITEM_WIDTH * 0.8 }}
          resizeMode="cover"
        />

        {/* Rating Badge */}
        <View className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 flex-row items-center shadow-sm">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-xs text-gray-800 ml-1 font-semibold">
            {item.rating}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          className="absolute top-2 right-2 bg-white/90 rounded-full p-2"
          onPress={() => toggleFav(item.id)}
        >
          <Ionicons
            name={favorites[item.id] ? "heart" : "heart-outline"}
            size={16}
            color="#EF4444"
          />
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text numberOfLines={2} className="text-sm font-semibold text-gray-900 mb-1">
          {item.name}
        </Text>

        <Text className="text-blue-600 font-bold text-base mb-1">
          {formatPrice(item.price)}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500 text-xs">
            Đã bán {item.soldCount}
          </Text>
          {renderStars(item.rating)}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        {/* Search Bar - Tap to open Search Screen */}
        <TouchableOpacity
          onPress={() => router.push('/search')}
          className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-3"
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text className="flex-1 ml-3 text-gray-500">
            Tìm kiếm sản phẩm...
          </Text>
          <Ionicons name="options" size={20} color="#3B82F6" />
        </TouchableOpacity>

        {/* Sort Options */}
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 font-bold text-base">
            {category ? "Sản phẩm theo danh mục" : "Tất cả sản phẩm"}
          </Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setSortBy("newest")}
              className={`px-4 py-2 rounded-xl ${
                sortBy === "newest" ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  sortBy === "newest" ? "text-white" : "text-gray-700"
                }`}
              >
                Mới nhất
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortBy("popular")}
              className={`px-4 py-2 rounded-xl ${
                sortBy === "popular" ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  sortBy === "popular" ? "text-white" : "text-gray-700"
                }`}
              >
                Bán chạy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {/* Results Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-gray-500">{products.length} sản phẩm</Text>
        </View>

        {/* Products List */}
        {products.length > 0 ? (
          <FlatList
            data={pagedData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">
              Không tìm thấy sản phẩm
            </Text>
          </View>
        )}

        {/* Pagination
        {products.length > 0 && (
          <View className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className={`px-6 py-3 rounded-xl ${
                  page === 1 ? "bg-gray-100" : "bg-blue-600"
                }`}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <Text
                  className={`font-semibold ${
                    page === 1 ? "text-gray-400" : "text-white"
                  }`}
                >
                  Trước
                </Text>
              </TouchableOpacity>

              <View className="bg-gray-100 px-4 py-2 rounded-xl">
                <Text className="font-bold text-gray-800">
                  {page} / {totalPages}
                </Text>
              </View>

              <TouchableOpacity
                className={`px-6 py-3 rounded-xl ${
                  page === totalPages ? "bg-gray-100" : "bg-blue-600"
                }`}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <Text
                  className={`font-semibold ${
                    page === totalPages ? "text-gray-400" : "text-white"
                  }`}
                >
                  Tiếp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )} */}
      </View>
    </SafeAreaView>
  );
}