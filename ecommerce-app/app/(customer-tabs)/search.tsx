// app/search.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { productService, Product, Category } from "@/services/productService";
import { debounce } from "lodash";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular" | "rating">("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  
  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "Điện thoại",
    "Laptop",
    "Tai nghe",
  ]);

  const popularSearches = [
    "iPhone 15",
    "Samsung Galaxy",
    "MacBook",
    "AirPods",
    "iPad",
    "Gaming laptop",
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await productService.getCategories();
      if (result.success && result.data) {
        setAllCategories(result.data.categories);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  // Debounced autocomplete
  const debouncedAutocomplete = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const result = await productService.autocomplete(query, 5);
        if (result.success && result.data) {
          setSuggestions(result.data.suggestions);
          setShowSuggestions(result.data.suggestions.length > 0);
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.length >= 2) {
      debouncedAutocomplete(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = async (customQuery?: string) => {
    const query = customQuery || searchQuery;
    if (!query.trim() && !selectedCategory) return;

    try {
      setSearching(true);
      setShowSuggestions(false);

      let result;
      
      if (query.trim()) {
        // Use search API
        result = await productService.searchProducts(query.trim(), 100);
        
        if (result.success && result.data) {
          let filtered = result.data.results;

          // Apply category filter
          if (selectedCategory) {
            filtered = filtered.filter(p => p.category.id === selectedCategory);
          }

          // Apply price filter
          if (priceRange.min || priceRange.max) {
            filtered = filtered.filter((p) => {
              const price = Number(p.price);
              const min = priceRange.min ? parseFloat(priceRange.min) : 0;
              const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
              return price >= min && price <= max;
            });
          }

          setProducts(filtered);
          setCategories(result.data.categories || []);

          // Save to history
          
        }
      } else {
        // Use products API with filters
        result = await productService.getProducts({
          categoryId: selectedCategory || undefined,
          minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
          maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
          sortBy,
          limit: 100,
        });

        if (result.success && result.data) {
          setProducts(result.data.products);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionPress = (suggestion: any) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    handleSearch(suggestion.name);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setProducts([]);
    setSelectedCategory(null);
    setPriceRange({ min: "", max: "" });
    setSuggestions([]);
    setShowSuggestions(false);
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

      <View className="p-3">
        <Text numberOfLines={2} className="text-sm font-semibold text-gray-900 mb-1">
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

  const renderSuggestion = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleSuggestionPress(item)}
      className="flex-row items-center p-3 border-b border-gray-100"
    >
      <Image
        source={{ uri: item.images[0] }}
        className="w-12 h-12 rounded-lg mr-3"
      />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-gray-900 font-semibold text-sm">
          {item.name}
        </Text>
        <Text className="text-blue-600 text-xs mt-1">
          {formatPrice(item.price)}
        </Text>
      </View>
      <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-2 pb-3 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch()}
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 z-50">
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Filter Bar */}
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`flex-row items-center px-4 py-2 rounded-xl ${
              showFilters ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="filter"
              size={16}
              color={showFilters ? "#fff" : "#6B7280"}
            />
            <Text
              className={`ml-2 text-sm font-semibold ${
                showFilters ? "text-white" : "text-gray-700"
              }`}
            >
              Bộ lọc
            </Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => {
                setSortBy("popular");
                if (products.length > 0) handleSearch();
              }}
              className={`px-4 py-2 rounded-xl mr-2 ${
                sortBy === "popular" ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  sortBy === "popular" ? "text-white" : "text-gray-700"
                }`}
              >
                Phổ biến
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortBy("newest");
                if (products.length > 0) handleSearch();
              }}
              className={`px-4 py-2 rounded-xl mr-2 ${
                sortBy === "newest" ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  sortBy === "newest" ? "text-white" : "text-gray-700"
                }`}
              >
                Mới nhất
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortBy("price_asc");
                if (products.length > 0) handleSearch();
              }}
              className={`px-4 py-2 rounded-xl mr-2 ${
                sortBy === "price_asc" ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  sortBy === "price_asc" ? "text-white" : "text-gray-700"
                }`}
              >
                Giá thấp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortBy("price_desc");
                if (products.length > 0) handleSearch();
              }}
              className={`px-4 py-2 rounded-xl ${
                sortBy === "price_desc" ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  sortBy === "price_desc" ? "text-white" : "text-gray-700"
                }`}
              >
                Giá cao
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-gray-900 font-bold text-base mb-3">
            Danh mục
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl mr-2 ${
                selectedCategory === null ? "bg-blue-600" : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategory === null ? "text-white" : "text-gray-700"
                }`}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {allCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl mr-2 ${
                  selectedCategory === cat.id
                    ? "bg-blue-600"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedCategory === cat.id ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-gray-900 font-bold text-base mb-3">
            Khoảng giá
          </Text>
          <View className="flex-row items-center space-x-3 mb-3">
            <TextInput
              placeholder="Từ"
              value={priceRange.min}
              onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
              keyboardType="numeric"
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
            <Text className="text-gray-500">-</Text>
            <TextInput
              placeholder="Đến"
              value={priceRange.max}
              onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
              keyboardType="numeric"
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          <TouchableOpacity
            onPress={() => handleSearch()}
            className="bg-blue-600 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-bold text-base">Áp dụng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView className="flex-1">
        {searching ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-4">Đang tìm kiếm...</Text>
          </View>
        ) : products.length > 0 ? (
          <View className="px-4 pt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 font-bold text-base">
                {products.length} sản phẩm
              </Text>
              {categories.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        handleSearch();
                      }}
                      className="bg-blue-50 rounded-lg px-3 py-1 mr-2 flex-row items-center"
                    >
                      <Ionicons name={cat.icon as any} size={14} color="#3B82F6" />
                      <Text className="text-blue-600 text-xs ml-1 font-semibold">
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View className="px-4 pt-4">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-900 font-bold text-base">
                    Tìm kiếm gần đây
                  </Text>
                  <TouchableOpacity onPress={() => setSearchHistory([])}>
                    <Text className="text-blue-600 text-sm">Xóa tất cả</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap">
                  {searchHistory.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                      className="bg-gray-100 rounded-xl px-4 py-2 mr-2 mb-2 flex-row items-center"
                    >
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-700 text-sm ml-2">{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Searches */}
            <View className="mb-6">
              <Text className="text-gray-900 font-bold text-base mb-3">
                Tìm kiếm phổ biến
              </Text>
              <View className="flex-row flex-wrap">
                {popularSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSearchQuery(term);
                      handleSearch(term);
                    }}
                    className="bg-blue-50 rounded-xl px-4 py-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Ionicons name="trending-up" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 text-sm ml-2 font-semibold">
                      {term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View>
              <Text className="text-gray-900 font-bold text-base mb-3">
                Danh mục
              </Text>
              <View className="flex-row flex-wrap">
                {allCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      handleSearch();
                    }}
                    className="w-[30%] bg-white rounded-2xl p-4 mr-2 mb-3 items-center border border-gray-100"
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={24}
                        color={cat.color}
                      />
                    </View>
                    <Text
                      className="text-xs font-semibold text-center"
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}