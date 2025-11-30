// app/(seller-tabs)/edit-product.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Category, productService, Product } from '@/services/productService';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '@/utils/uploadImage';

interface ImageItem {
  uri: string;
  cloudinaryUrl?: string;
  uploading?: boolean;
  error?: boolean;
}

export default function EditProductScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  
  // UI state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
    }
  };

  const fetchProduct = async () => {
    if (!id) {
      Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
      router.back();
      return;
    }

    try {
      setLoadingProduct(true);
      const result = await productService.getProductById(parseInt(id));
      
      if (result.success && result.data && result.data.products.length > 0) {
        const product = result.data.products[0];
        
        // Check if user owns this product
        if (product.seller.id !== user?.id) {
          Alert.alert('Lỗi', 'Bạn không có quyền chỉnh sửa sản phẩm này');
          router.back();
          return;
        }

        setOriginalProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setSelectedCategory(product.category.id);
        
        // Set existing images
        const existingImages: ImageItem[] = product.images.map(url => ({
          uri: url,
          cloudinaryUrl: url,
        }));
        setImages(existingImages);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
        router.back();
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
      router.back();
    } finally {
      setLoadingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await productService.getCategories();
      if (result.success && result.data) {
        setCategories(result.data.categories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const pickImages = async () => {
    const remainingSlots = 5 - images.length;
    
    if (remainingSlots <= 0) {
      Alert.alert('Thông báo', 'Tối đa 5 ảnh cho mỗi sản phẩm');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedAssets = result.assets.slice(0, remainingSlots);
      
      const newImages: ImageItem[] = selectedAssets.map(asset => ({
        uri: asset.uri,
        uploading: true,
      }));
      
      setImages(prev => [...prev, ...newImages]);
      setUploadingCount(selectedAssets.length);

      const uploadPromises = selectedAssets.map(async (asset) => {
        try {
          const uploadResult = await uploadImageToCloudinary(asset.uri);
          
          if (uploadResult.success && uploadResult.url) {
            setImages(prevImages => 
              prevImages.map(img => 
                img.uri === asset.uri 
                  ? { ...img, cloudinaryUrl: uploadResult.url, uploading: false }
                  : img
              )
            );
            return { success: true, uri: asset.uri };
          } else {
            setImages(prevImages => 
              prevImages.map(img => 
                img.uri === asset.uri 
                  ? { ...img, uploading: false, error: true }
                  : img
              )
            );
            return { success: false, uri: asset.uri, error: uploadResult.error };
          }
        } catch (error) {
          setImages(prevImages => 
            prevImages.map(img => 
              img.uri === asset.uri 
                ? { ...img, uploading: false, error: true }
                : img
            )
          );
          return { success: false, uri: asset.uri };
        }
      });

      const results = await Promise.all(uploadPromises);
      setUploadingCount(0);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0 && failCount === 0) {
        Alert.alert('Thành công', `Đã tải lên ${successCount} ảnh thành công`);
      } else if (successCount > 0 && failCount > 0) {
        Alert.alert(
          'Hoàn thành một phần', 
          `${successCount} ảnh thành công, ${failCount} ảnh thất bại`
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải lên ảnh. Vui lòng thử lại');
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const retryFailedImage = async (index: number) => {
    const image = images[index];
    if (!image || !image.error) return;

    setImages(prev => 
      prev.map((img, i) => 
        i === index ? { ...img, uploading: true, error: false } : img
      )
    );

    try {
      const uploadResult = await uploadImageToCloudinary(image.uri);
      
      if (uploadResult.success && uploadResult.url) {
        setImages(prev => 
          prev.map((img, i) => 
            i === index 
              ? { ...img, cloudinaryUrl: uploadResult.url, uploading: false }
              : img
          )
        );
        Alert.alert('Thành công', 'Đã tải ảnh lên thành công');
      } else {
        setImages(prev => 
          prev.map((img, i) => 
            i === index ? { ...img, uploading: false, error: true } : img
          )
        );
        Alert.alert('Lỗi', uploadResult.error || 'Không thể tải ảnh lên');
      }
    } catch (error) {
      setImages(prev => 
        prev.map((img, i) => 
          i === index ? { ...img, uploading: false, error: true } : img
        )
      );
      Alert.alert('Lỗi', 'Đã có lỗi khi tải ảnh lên');
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return false;
    }
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 ảnh sản phẩm');
      return false;
    }
    
    const uploadingImages = images.filter(img => img.uploading);
    if (uploadingImages.length > 0) {
      Alert.alert('Thông báo', 'Vui lòng đợi ảnh tải lên hoàn tất');
      return false;
    }
    
    const failedImages = images.filter(img => img.error || !img.cloudinaryUrl);
    if (failedImages.length > 0) {
      Alert.alert('Lỗi', 'Một số ảnh chưa được tải lên. Vui lòng thử lại hoặc xóa ảnh lỗi.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm');
      return;
    }

    setLoading(true);

    try {
      const imageUrls = images
        .filter(img => img.cloudinaryUrl)
        .map(img => img.cloudinaryUrl!);

      const result = await productService.updateProduct(
        parseInt(id),
        {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          stock: Number(stock),
          categoryId: selectedCategory!,
          images: imageUrls,
        }
      );

      if (result.success) {
        Alert.alert(
          'Thành công',
          'Sản phẩm đã được cập nhật',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể cập nhật sản phẩm');
      }
    } catch (error) {
      console.error('Update product error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const formatPriceInput = (text: string) => {
    const numbers = text.replace(/[^0-9]/g, '');
    setPrice(numbers);
  };

  const formatPrice = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN');
  };

  if (loadingProduct) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4 text-base">Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Chỉnh sửa sản phẩm
            </Text>
            <Text className="text-gray-500 text-sm mt-0.5">
              Cập nhật thông tin sản phẩm
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Images Section */}
          <View className="px-4 pt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-900">
                Hình ảnh sản phẩm *
              </Text>
              {uploadingCount > 0 && (
                <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-blue-600 text-xs font-semibold ml-2">
                    Đang tải {uploadingCount} ảnh...
                  </Text>
                </View>
              )}
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Add Image Button */}
              <TouchableOpacity
                onPress={pickImages}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mr-3 bg-gray-50"
                disabled={images.length >= 5}
              >
                <Ionicons 
                  name="images-outline" 
                  size={28} 
                  color={images.length >= 5 ? "#D1D5DB" : "#9CA3AF"} 
                />
                <Text className={`text-xs mt-1 ${images.length >= 5 ? 'text-gray-400' : 'text-gray-500'}`}>
                  Chọn ảnh
                </Text>
                <Text className="text-gray-400 text-xs">
                  {images.length}/5
                </Text>
              </TouchableOpacity>

              {/* Image Previews */}
              {images.map((item, index) => (
                <View key={index} className="mr-3 relative">
                  <Image
                    source={{ uri: item.uri }}
                    className="w-24 h-24 rounded-xl"
                    resizeMode="cover"
                  />
                  
                  {/* Uploading Overlay */}
                  {item.uploading && (
                    <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="text-white text-xs mt-1">Đang tải...</Text>
                    </View>
                  )}
                  
                  {/* Error Overlay */}
                  {item.error && !item.uploading && (
                    <View className="absolute inset-0 bg-red-500/80 rounded-xl items-center justify-center">
                      <Ionicons name="alert-circle" size={24} color="#fff" />
                      <TouchableOpacity
                        onPress={() => retryFailedImage(index)}
                        className="bg-white px-2 py-1 rounded-full mt-1"
                      >
                        <Text className="text-red-600 text-xs font-bold">Thử lại</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Success Check */}
                  {item.cloudinaryUrl && !item.uploading && !item.error && (
                    <View className="absolute top-1 left-1 bg-green-500 rounded-full w-6 h-6 items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                  
                  {/* Remove Button */}
                  {!item.uploading && (
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                  
                  {/* Main Image Badge */}
                  {index === 0 && !item.uploading && !item.error && (
                    <View className="absolute bottom-1 left-1 bg-blue-600 px-2 py-0.5 rounded">
                      <Text className="text-white text-xs font-medium">Chính</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            <Text className="text-gray-500 text-xs mt-2">
              Tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện. Chạm để chọn nhiều ảnh cùng lúc.
            </Text>
          </View>

          {/* Product Name */}
          <View className="px-4 mt-6">
            <Text className="text-base font-bold text-gray-900 mb-2">
              Tên sản phẩm *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="VD: iPhone 15 Pro Max 256GB"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category */}
          <View className="px-4 mt-6">
            <Text className="text-base font-bold text-gray-900 mb-3">
              Danh mục *
            </Text>
            
            {loadingCategories ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={`mr-3 px-4 py-3 rounded-xl border-2 ${
                      selectedCategory === category.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={18}
                          color={category.color}
                        />
                      </View>
                      <Text
                        className={`font-semibold ${
                          selectedCategory === category.id
                            ? 'text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {category.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Price & Stock */}
          <View className="px-4 mt-6">
            <View className="flex-row space-x-3">
              {/* Price */}
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-2">
                  Giá bán *
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <TextInput
                    value={formatPrice(price)}
                    onChangeText={formatPriceInput}
                    placeholder="0"
                    keyboardType="numeric"
                    className="flex-1 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text className="text-gray-500 ml-2">đ</Text>
                </View>
              </View>

              {/* Stock */}
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-2">
                  Số lượng *
                </Text>
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <TextInput
                    value={stock}
                    onChangeText={setStock}
                    placeholder="0"
                    keyboardType="numeric"
                    className="flex-1 text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Ionicons name="cube-outline" size={20} color="#9CA3AF" />
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="px-4 mt-6">
            <Text className="text-base font-bold text-gray-900 mb-2">
              Mô tả sản phẩm
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả chi tiết về sản phẩm..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            <Text className="text-gray-500 text-xs mt-2">
              Mô tả chi tiết giúp sản phẩm bán chạy hơn
            </Text>
          </View>

          {/* Info Card */}
          <View className="px-4 mt-6">
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                padding: 16,
              }}
            >
              <View className="flex-row items-start">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Ionicons name="information-circle-outline" size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold mb-1">
                    Đang chỉnh sửa sản phẩm
                  </Text>
                  <Text className="text-white/90 text-sm">
                    Các thay đổi sẽ được cập nhật ngay lập tức trên cửa hàng của bạn
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
            >
              <Text className="text-gray-700 font-semibold">Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || uploadingCount > 0}
              className={`flex-2 bg-blue-600 rounded-xl py-4 items-center ${
                loading || uploadingCount > 0 ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ flex: 2 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text className="text-white font-semibold ml-2">
                    Cập nhật sản phẩm
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}