import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { products, reviewsList } from "../data/products";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const product = products.find((p) => String(p.id) === String(id));
    const productReviews = product
        ? reviewsList.filter((r) => r.productId === product.id)
        : [];

    const [currentImage, setCurrentImage] = useState(0);

    if (!product) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-600 text-base">Không tìm thấy sản phẩm.</Text>
            </SafeAreaView>
        );
    }

    const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

    // Carousel ảnh sản phẩm
    const renderImage = ({ item, index }: { item: any; index: number }) => (
        <Image
            key={index}
            source={item}
            style={{ width, height: 300 }}
            resizeMode="cover"
        />
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-6 border-b border-gray-100 bg-white z-10">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-gray-800">Chi tiết sản phẩm</Text>
                <TouchableOpacity>
                    <Ionicons name="cart-outline" size={22} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Carousel ảnh */}
                <FlatList
                    data={product.images || [product.image]}
                    renderItem={renderImage}
                    keyExtractor={(_, idx) => idx.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                        const slide = Math.round(e.nativeEvent.contentOffset.x / width);
                        setCurrentImage(slide);
                    }}
                />
                {/* Indicator */}
                <View className="flex-row justify-center mt-2 mb-4">
                    {(product.images || [product.image]).map((_, idx) => (
                        <View
                            key={idx}
                            className={`w-2 h-2 rounded-full mx-1 ${idx === currentImage ? "bg-blue-600" : "bg-gray-300"
                                }`}
                        />
                    ))}
                </View>

                {/* Nội dung */}
                <View className="px-4 pb-24">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">{product.name}</Text>
                    <Text className="text-2xl font-extrabold text-blue-600 mb-3">{formatPrice(product.price)}</Text>

                    {/* Rating & sold */}
                    <View className="flex-row items-center mb-3">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const filled = i < Math.floor(product.rating);
                            const half = i === Math.floor(product.rating) && product.rating % 1 >= 0.5;
                            return (
                                <Ionicons
                                    key={i}
                                    name={filled ? "star" : half ? "star-half" : "star-outline"}
                                    size={16}
                                    color="#F59E0B"
                                />
                            );
                        })}
                        <Text className="text-gray-700 ml-2">{product.rating} ({product.reviews} đánh giá)</Text>
                        <Text className="text-gray-500 ml-4">Đã bán {product.sold}</Text>
                    </View>

                    <View className="h-px bg-gray-200 my-3" />

                    {/* Thông tin cửa hàng */}
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="storefront-outline" size={20} color="#3B82F6" />
                        <Text className="ml-2 text-gray-800 font-medium">{product.shopName}</Text>
                    </View>

                    <View className="h-px bg-gray-200 my-3" />

                    {/* Mô tả sản phẩm */}
                    <Text className="text-base font-semibold text-gray-800 mb-2">Mô tả sản phẩm</Text>
                    <Text className="text-gray-600 leading-6">
                        {product.description || "Sản phẩm chất lượng cao, thiết kế tinh tế, hiệu năng ổn định."}
                    </Text>
                </View>

                {/* Đánh giá & Bình luận */}
                <View className="mt-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Đánh giá & Bình luận</Text>

                    {productReviews.length > 0 ? (
                        productReviews.map((r, index) => (
                            <View key={r.id || index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <View className="flex-row items-center mb-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Ionicons
                                            key={i}
                                            name={i < r.rating ? "star" : "star-outline"}
                                            size={14}
                                            color="#F59E0B"
                                        />
                                    ))}
                                    <Text className="ml-2 text-gray-700 font-medium">{r.userName}</Text>
                                </View>
                                <Text className="text-gray-600 text-sm">{r.comment}</Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500">Chưa có đánh giá nào.</Text>
                    )}
                </View>
            </ScrollView>

            {/* Nút Thêm vào giỏ hàng */}
            <View className="absolute bottom-0 left-0 w-full px-4 py-3 border-t border-gray-200 bg-white">
                <TouchableOpacity
                    className="bg-blue-600 rounded-xl py-4 items-center justify-center shadow-lg"
                    activeOpacity={0.8}
                    onPress={() => alert("Đã thêm vào giỏ hàng 🛒")}
                >
                    <Text className="text-white text-base font-semibold">Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
