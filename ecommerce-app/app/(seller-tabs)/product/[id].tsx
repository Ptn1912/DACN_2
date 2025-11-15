// app/product/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Product, productService } from '@/services/productService';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const result = await productService.getProductById(Number(id));
      
      if (result.success && result.data) {
        setProduct(result.data.products[0]);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
        router.back();
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem sản phẩm ${product?.name} - Giá: ${formatPrice(product?.price || 0)}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock === 0) {
      Alert.alert('Thông báo', 'Sản phẩm đã hết hàng');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert('Thông báo', `Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }

    Alert.alert(
      'Thêm vào giỏ hàng',
      `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
      [{ text: 'OK' }]
    );
    // TODO: Implement add to cart API
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.stock === 0) {
      Alert.alert('Thông báo', 'Sản phẩm đã hết hàng');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert('Thông báo', `Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }

    Alert.alert(
      'Mua ngay',
      'Chuyển đến trang thanh toán?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: () => {
          // TODO: Navigate to checkout
          Alert.alert('Thông báo', 'Tính năng đang phát triển');
        }}
      ]
    );
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert('Thông báo', 'Đã đạt số lượng tối đa trong kho');
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  };

  const getStockStatus = () => {
    if (!product) return { text: '', color: '', bg: '' };
    
    if (product.stock === 0) {
      return { text: 'Hết hàng', color: '#EF4444', bg: '#FEE2E2' };
    } else if (product.stock < 10) {
      return { text: `Chỉ còn ${product.stock} sản phẩm`, color: '#F59E0B', bg: '#FEF3C7' };
    }
    return { text: `Còn ${product.stock} sản phẩm`, color: '#10B981', bg: '#D1FAE5' };
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-900 text-lg font-bold mt-4">
          Không tìm thấy sản phẩm
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(seller-tabs)/products')}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={{ opacity: headerOpacity }}
        className="absolute top-0 left-0 right-0 z-10"
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-4 px-4"
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-base flex-1 mx-4" numberOfLines={1}>
              {product.name}
            </Text>
            <TouchableOpacity
              onPress={handleShare}
              className="bg-white/20 rounded-full p-2"
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Fixed Header Buttons (Initially visible) */}
      <View className="absolute top-12 left-0 right-0 z-10 px-4 flex-row justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity
            onPress={handleShare}
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg mr-2"
          >
            <Ionicons name="share-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Yêu thích', 'Tính năng đang phát triển')}
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-lg"
          >
            <Ionicons name="heart-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Carousel */}
        <View className="bg-gray-50">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          >
            {product.images.map((image, index) => (
              <View key={index} style={{ width }}>
                <Image
                  source={{ uri: image }}
                  style={{ width, height: width }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
            {product.images.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pt-4">
          {/* Category Badge */}
          <View className="flex-row items-center mb-3">
            <LinearGradient
              colors={[product.category.color + '20', product.category.color + '10']}
              className="px-3 py-1.5 rounded-full flex-row items-center"
            >
              <Ionicons
                name={product.category.icon as any}
                size={14}
                color={product.category.color}
              />
              <Text
                className="text-xs font-semibold ml-1"
                style={{ color: product.category.color }}
              >
                {product.category.name}
              </Text>
            </LinearGradient>
          </View>

          {/* Product Name */}
          <Text className="text-gray-900 text-2xl font-bold mb-3">
            {product.name}
          </Text>

          {/* Rating & Sold */}
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-xl mr-3">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-orange-600 font-bold text-sm ml-1">
                {product.rating}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="cart-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 font-medium text-sm ml-1">
                Đã bán {product.soldCount}
              </Text>
            </View>
          </View>

          {/* Price Card */}
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-5 mb-4"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/80 text-sm font-medium mb-1">
                  Giá bán
                </Text>
                <Text className="text-white text-3xl font-bold">
                  {formatPrice(product.price)}
                </Text>
              </View>
              <View
                className="px-4 py-2 rounded-2xl"
                style={{ backgroundColor: stockStatus.bg }}
              >
                <Text
                  className="text-xs font-bold text-center"
                  style={{ color: stockStatus.color }}
                >
                  {stockStatus.text}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Seller Info */}
          <View className="bg-gray-50 rounded-3xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-blue-100 rounded-full p-3 mr-3">
                  <Ionicons name="storefront" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {product.seller.fullName}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Người bán
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                className="bg-white rounded-2xl px-4 py-2 border border-gray-200"
              >
                <Text className="text-blue-600 font-semibold text-sm">
                  Xem shop
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantity Selector */}
          <View className="bg-gray-50 rounded-3xl p-4 mb-4">
            <Text className="text-gray-900 font-bold text-base mb-3">
              Số lượng
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                <TouchableOpacity
                  onPress={decreaseQuantity}
                  className="p-3"
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? '#D1D5DB' : '#3B82F6'}
                  />
                </TouchableOpacity>
                <View className="px-6 py-3 border-x border-gray-200">
                  <Text className="text-gray-900 font-bold text-base">
                    {quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={increaseQuantity}
                  className="p-3"
                  disabled={product.stock === 0 || quantity >= product.stock}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={product.stock === 0 || quantity >= product.stock ? '#D1D5DB' : '#3B82F6'}
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-sm">
                Tối đa: {product.stock}
              </Text>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View className="bg-gray-50 rounded-3xl p-4 mb-4">
              <Text className="text-gray-900 font-bold text-base mb-3">
                Mô tả sản phẩm
              </Text>
              <Text className="text-gray-700 text-sm leading-6">
                {product.description}
              </Text>
            </View>
          )}

          {/* Product Details */}
          <View className="bg-gray-50 rounded-3xl p-4 mb-4">
            <Text className="text-gray-900 font-bold text-base mb-3">
              Thông tin chi tiết
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Danh mục</Text>
                <Text className="text-gray-900 font-semibold text-sm">
                  {product.category.name}
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Tình trạng</Text>
                <Text
                  className="font-semibold text-sm"
                  style={{ color: stockStatus.color }}
                >
                  {stockStatus.text}
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-gray-600 text-sm">Đánh giá</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-900 font-semibold text-sm ml-1">
                    {product.rating} / 
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="h-24" />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 bg-blue-100 rounded-2xl py-4 items-center ${
              product.stock === 0 ? 'opacity-50' : ''
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name="cart-outline" size={22} color="#3B82F6" />
              <Text className="text-blue-600 font-bold text-base ml-2">
                Giỏ hàng
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1"
          >
            <LinearGradient
              colors={product.stock === 0 ? ['#D1D5DB', '#9CA3AF'] : ['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl py-4 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="flash" size={22} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Mua ngay
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}