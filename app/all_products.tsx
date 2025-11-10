import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { products } from "./data/products"; // import data

const { width } = Dimensions.get("window");
const HORIZ_PADDING = 16;
const GAP = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - HORIZ_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const ITEMS_PER_PAGE = 8;

export default function AllProductsScreen() {
  const { query, showAll, category } = useLocalSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>(String(query ?? ""));
  const [filtered, setFiltered] = useState(products);
  const [page, setPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Lọc khi thay đổi query, showAll, category từ params
  useEffect(() => {
    let filteredData = products;

    if (showAll === "true") {
      filteredData = products;
    } else if (category) {
      filteredData = products.filter(
        (p) => p.category.toLowerCase() === String(category).toLowerCase()
      );
    } else if (query) {
      filteredData = products.filter((p) =>
        p.name.toLowerCase().includes(String(query).toLowerCase())
      );
    }

    setFiltered(filteredData);
    setPage(1);
  }, [query, showAll, category]);

  // Lọc theo searchQuery khi nhập text
  useEffect(() => {
    const q = (searchQuery ?? "").trim().toLowerCase();

    if (q.length > 0) {
      setFiltered(products.filter((p) => p.name.toLowerCase().includes(q)));
    } else if (query) {
      const qp = String(query).trim().toLowerCase();
      setFiltered(products.filter((p) => p.name.toLowerCase().includes(qp)));
    } else if (category) {
      setFiltered(products.filter((p) => p.category.toLowerCase() === String(category).toLowerCase()));
    } else {
      setFiltered(products);
    }
    setPage(1);
  }, [query, searchQuery, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const pagedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const toggleFav = (id: number) => {
    setFavorites((s) => ({ ...s, [id]: !s[id] }));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    for (let i = 0; i < full; i++)
      stars.push(<Ionicons key={`s${i}`} name="star" size={12} color="#F59E0B" />);
    if (half) stars.push(<Ionicons key="half" name="star-half" size={12} color="#F59E0B" />);
    const emptyCount = 5 - stars.length;
    for (let i = 0; i < emptyCount; i++)
      stars.push(<Ionicons key={`e${i}`} name="star-outline" size={12} color="#F59E0B" />);
    return <View className="flex-row items-center space-x-1">{stars}</View>;
  };

  const renderItem = ({ item }: { item: typeof products[number] }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden border border-gray-100"
      style={{
        width: ITEM_WIDTH,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/product/[id]" as any,
          params: { id: String(item.id) },
        })
      }
    >
      <View className="relative">
        <Image
          source={item.image}
          style={{ width: "100%", height: ITEM_WIDTH * 0.8, borderRadius: 12 }}
          resizeMode="cover"
        />

        {/* Badge rating */}
        <View className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 flex-row items-center shadow-sm">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-xs text-gray-800 ml-1">{item.rating.toFixed(1)}</Text>
          <Text className="text-xs text-gray-400 ml-1">({item.reviews})</Text>
        </View>

        {/* Favourite button */}
        <TouchableOpacity className="absolute top-2 right-2 p-1" onPress={() => toggleFav(item.id)}>
          <Ionicons
            name={favorites[item.id] ? "heart" : "heart-outline"}
            size={18}
            color="#EF4444"
          />
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text numberOfLines={2} className="text-sm font-semibold text-gray-900 mb-1">
          {item.name}
        </Text>

        <Text className="text-blue-600 font-extrabold mb-1">{formatPrice(item.price)}</Text>

        <Text className="text-gray-500 text-xs mb-2">Đã bán {item.sold}</Text>

        <View className="flex-row items-center justify-between">
          <Text numberOfLines={1} className="text-xs text-gray-500">
            {item.shopName}
          </Text>
          <View className="flex-row items-center">{renderStars(item.rating)}</View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header back + search */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3 w-9 h-9 rounded-lg items-center justify-center" onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#111" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold">
            Kết quả cho: “{searchQuery || query || category || "Tất cả sản phẩm"}”
          </Text>
          <Text className="text-sm text-gray-500">{filtered.length} sản phẩm</Text>
        </View>

        <FlatList
          data={pagedData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{ justifyContent: "space-between", paddingBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Pagination */}
        <View className="flex-row items-center justify-between mt-3 mb-6">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${page === 1 ? "bg-gray-100" : "bg-white"}`}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Text className={`${page === 1 ? "text-gray-400" : "text-gray-800"}`}>Trước</Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600 mr-2">Trang</Text>
            <View className="bg-gray-100 px-3 py-1 rounded-lg">
              <Text className="font-semibold text-gray-800">{page} / {totalPages}</Text>
            </View>
          </View>

          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${page === totalPages ? "bg-gray-100" : "bg-white"}`}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <Text className={`${page === totalPages ? "text-gray-400" : "text-gray-800"}`}>Tiếp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
