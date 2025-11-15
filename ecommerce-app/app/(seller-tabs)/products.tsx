// app/(seller-tabs)/products.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Product, productService } from '@/services/productService';

export default function ManageProductsScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'lowStock' | 'outOfStock'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, activeFilter, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productService.getProducts({ limit: 100 });
      
      if (result.success && result.data) {
        // Filter only seller's products
        const sellerProducts = result.data.products.filter(
          (p) => p.seller.id === user?.id
        );
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter((p) => p.stock > 0);
        break;
      case 'lowStock':
        filtered = filtered.filter((p) => p.stock > 0 && p.stock < 10);
        break;
      case 'outOfStock':
        filtered = filtered.filter((p) => p.stock === 0);
        break;
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { 
        text: 'Hết hàng', 
        color: '#EF4444', 
        bg: '#FEE2E2',
        icon: 'close-circle' as const
      };
    } else if (stock < 10) {
      return { 
        text: 'Sắp hết', 
        color: '#F59E0B', 
        bg: '#FEF3C7',
        icon: 'warning' as const
      };
    }
    return { 
      text: 'Còn hàng', 
      color: '#10B981', 
      bg: '#D1FAE5',
      icon: 'checkmark-circle' as const
    };
  };

  const stats = {
    total: products.length,
    active: products.filter((p) => p.stock > 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4 text-base">Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }
  const handleEditProduct = (product: Product) => {
  router.push({
    pathname: '/edit-product',
    params: { id: product.id }
  });
};

  const handleDeleteProduct = async (productId: number) => {
  Alert.alert(
    'Xóa sản phẩm',
    'Bạn có chắc muốn xóa sản phẩm này?',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const result = await productService.deleteProduct(productId);
          if (result.success) {
            Alert.alert('Thành công', 'Đã xóa sản phẩm');
            fetchProducts(); // Refresh list
          } else {
            Alert.alert('Lỗi', result.error || 'Không thể xóa sản phẩm');
          }
        },
      },
    ]
  );
};
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">
              Quản lý sản phẩm
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              {stats.total} sản phẩm trong cửa hàng
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(seller-tabs)/add-product')}
            className="bg-white rounded-2xl px-5 py-3 flex-row items-center shadow-lg"
          >
            <Ionicons name="add-circle" size={22} color="#3B82F6" />
            <Text className="text-blue-600 font-bold ml-2">Thêm</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 ml-3 text-gray-900 text-base"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View className="px-4 -mt-3">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            className="mr-3"
          >
            <LinearGradient
              colors={activeFilter === 'all' ? ['#3B82F6', '#2563EB'] : ['#FFFFFF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 110 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons 
                  name="cube" 
                  size={20} 
                  color={activeFilter === 'all' ? '#FFF' : '#3B82F6'} 
                />
                <View 
                  className={`px-2 py-0.5 rounded-full ${
                    activeFilter === 'all' ? 'bg-white/20' : 'bg-blue-50'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    activeFilter === 'all' ? 'text-white' : 'text-blue-600'
                  }`}>
                    {stats.total}
                  </Text>
                </View>
              </View>
              <Text className={`text-xs font-medium ${
                activeFilter === 'all' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                Tất cả
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('active')}
            className="mr-3"
          >
            <LinearGradient
              colors={activeFilter === 'active' ? ['#10B981', '#059669'] : ['#FFFFFF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 110 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={activeFilter === 'active' ? '#FFF' : '#10B981'} 
                />
                <View 
                  className={`px-2 py-0.5 rounded-full ${
                    activeFilter === 'active' ? 'bg-white/20' : 'bg-green-50'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    activeFilter === 'active' ? 'text-white' : 'text-green-600'
                  }`}>
                    {stats.active}
                  </Text>
                </View>
              </View>
              <Text className={`text-xs font-medium ${
                activeFilter === 'active' ? 'text-green-100' : 'text-gray-500'
              }`}>
                Còn hàng
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('lowStock')}
            className="mr-3"
          >
            <LinearGradient
              colors={activeFilter === 'lowStock' ? ['#F59E0B', '#D97706'] : ['#FFFFFF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 110 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons 
                  name="warning" 
                  size={20} 
                  color={activeFilter === 'lowStock' ? '#FFF' : '#F59E0B'} 
                />
                <View 
                  className={`px-2 py-0.5 rounded-full ${
                    activeFilter === 'lowStock' ? 'bg-white/20' : 'bg-orange-50'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    activeFilter === 'lowStock' ? 'text-white' : 'text-orange-600'
                  }`}>
                    {stats.lowStock}
                  </Text>
                </View>
              </View>
              <Text className={`text-xs font-medium ${
                activeFilter === 'lowStock' ? 'text-orange-100' : 'text-gray-500'
              }`}>
                Sắp hết
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('outOfStock')}
            className="mr-3"
          >
            <LinearGradient
              colors={activeFilter === 'outOfStock' ? ['#EF4444', '#DC2626'] : ['#FFFFFF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-5 py-4 rounded-2xl shadow-sm"
              style={{ minWidth: 110 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={activeFilter === 'outOfStock' ? '#FFF' : '#EF4444'} 
                />
                <View 
                  className={`px-2 py-0.5 rounded-full ${
                    activeFilter === 'outOfStock' ? 'bg-white/20' : 'bg-red-50'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    activeFilter === 'outOfStock' ? 'text-white' : 'text-red-600'
                  }`}>
                    {stats.outOfStock}
                  </Text>
                </View>
              </View>
              <Text className={`text-xs font-medium ${
                activeFilter === 'outOfStock' ? 'text-red-100' : 'text-gray-500'
              }`}>
                Hết hàng
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Products List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            
            return (
              <TouchableOpacity
                key={product.id}
                className="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-gray-100"
                onPress={() => {
                  router.push(`/product/${product.id}`);
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  {/* Product Image with Badge */}
                  <View className="relative">
                    <Image
                      source={{ uri: product.images[0] || 'https://via.placeholder.com/100' }}
                      className="w-24 h-24 rounded-2xl"
                      resizeMode="cover"
                    />
                    {/* Stock Badge */}
                    <View 
                      className="absolute -top-2 -right-2 px-2 py-1 rounded-full flex-row items-center"
                      style={{ backgroundColor: stockStatus.bg }}
                    >
                      <Ionicons name={stockStatus.icon} size={12} color={stockStatus.color} />
                      <Text 
                        className="text-xs font-bold ml-1"
                        style={{ color: stockStatus.color }}
                      >
                        {product.stock}
                      </Text>
                    </View>
                  </View>

                  {/* Product Info */}
                  <View className="flex-1 ml-4">
                    <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={2}>
                      {product.name}
                    </Text>
                    
                    {/* Price */}
                    <View className="flex-row items-center mb-2">
                      <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-3 py-1.5 rounded-xl"
                      >
                        <Text className="text-white font-bold text-sm">
                          {formatPrice(product.price)}
                        </Text>
                      </LinearGradient>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row items-center">
                      <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded-lg mr-2">
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text className="text-orange-600 text-xs font-semibold ml-1">
                          {product.rating}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg">
                        <Ionicons name="cart" size={12} color="#6B7280" />
                        <Text className="text-gray-600 text-xs font-semibold ml-1">
                          Đã bán {product.soldCount}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View className="mt-2">
                      <View 
                        className="px-2.5 py-1 rounded-full self-start flex-row items-center"
                        style={{ backgroundColor: stockStatus.bg }}
                      >
                        <Ionicons name={stockStatus.icon} size={12} color={stockStatus.color} />
                        <Text 
                          className="text-xs font-bold ml-1"
                          style={{ color: stockStatus.color }}
                        >
                          {stockStatus.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-3 mr-2 bg-blue-50 rounded-xl"
                    onPress={() => {
                      handleEditProduct(product);
                    }}
                  >
                    <Ionicons name="create" size={18} color="#3B82F6" />
                    <Text className="text-blue-600 font-bold text-sm ml-2">Chỉnh sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-3 bg-red-50 rounded-xl"
                    onPress={() => handleDeleteProduct(product.id)}
                  >
                    <Ionicons name="trash" size={18} color="#EF4444" />
                    <Text className="text-red-600 font-bold text-sm ml-2">Xóa</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="items-center justify-center py-16">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6 px-8">
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Hãy thêm sản phẩm đầu tiên vào cửa hàng của bạn'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={() => router.push('/(seller-tabs)/add-product')}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-8 py-4 rounded-2xl flex-row items-center shadow-lg"
                >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text className="text-white font-bold text-base ml-2">
                    Thêm sản phẩm đầu tiên
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}