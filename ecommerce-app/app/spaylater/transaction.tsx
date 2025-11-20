// app/spaylater/transaction.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSPayLater } from "@/hooks/useSPayLater";
import { spaylaterService } from "@/services/spaylaterService";

const { width } = Dimensions.get("window");

interface Voucher {
  id: number;
  title: string;
  subtitle: string;
  code: string;
  expiry: string;
  limitedQuantity?: boolean;
}

export default function SPayLaterDashboard() {
  const {
    loading,
    customer,
    transactions = [], // Default to empty array
    availableCredit = 0,
    usedCredit = 0,
    creditLimit = 2000000,
    refresh,
  } = useSPayLater();

  const [refreshing, setRefreshing] = useState(false);
  
  const vouchers: Voucher[] = [
    {
      id: 1,
      title: "Giảm tối đa ₫50k",
      subtitle: "Đơn tối thiểu ₫45k",
      code: "Freeship 15.11",
      expiry: "Còn 13 giờ",
      limitedQuantity: true,
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("vi-VN") + " ₫";
  };

  // Tính toán thông tin thanh toán - với safe checks
  const upcomingPayments = transactions.filter(
    (t) => t.status === "PENDING" || t.status === "PARTIALLY_PAID"
  );

  const nextPayment =
    upcomingPayments.length > 0
      ? upcomingPayments.reduce((prev, curr) =>
          new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev
        )
      : null;

  const totalDue = upcomingPayments.reduce((sum, t) => {
    return sum + spaylaterService.getRemainingAmount(t);
  }, 0);

  if (loading && !customer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF5733" />
          <Text className="mt-4 text-gray-600">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#FF6B4A", "#FF5733"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-4 pb-8 rounded-2xl"
      >
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.push('/(customer-tabs)/profile')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">SPayLater</Text>
          <TouchableOpacity onPress={() => console.log("Settings Pressed")}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Credit Display */}
        <View className="items-center">
          <Text className="text-white text-base mb-2">Số dư khả dụng</Text>
          <Text className="text-white text-5xl font-bold mb-2">
            {formatPrice(availableCredit)}
          </Text>
          {/* <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push("/spaylater/credit-info")}
          > */}
            <Text className="text-white text-sm">
              Tổng hạn mức {formatPrice(creditLimit)}
            </Text>
           
          {/* </TouchableOpacity> */}
        </View>
      </LinearGradient>

      {/* Installment Card */}
      <View className="mx-4 -mt-6 mb-4">
        <TouchableOpacity
          className="bg-white rounded-2xl p-4 shadow-lg"
          activeOpacity={0.8}
          onPress={() => {
            if (nextPayment) {
              router.push(`/spaylater/transaction/${nextPayment.id}`);
              // kienphan
            } else {
              // router.push("/spaylater/test");
            }
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-900 font-bold text-lg">
              {formatPrice(totalDue)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
          <Text className="text-gray-500 text-sm">
            {nextPayment
              ? `Hóa đơn ${new Date(
                  nextPayment.purchaseDate
                ).getDate()}, hạn thanh toán đến ngày ${new Date(
                  nextPayment.dueDate
                ).getDate()}`
              : "Chưa có hóa đơn nào"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Quick Actions */}
        <View className="mx-4 mb-4">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="items-center flex-1"
                onPress={() => console.log("router.push(\"/spaylater/history\")")}
              >
                <View className="bg-red-50 p-3 rounded-xl mb-2">
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#FF5733"
                  />
                </View>
                <Text className="text-gray-700 text-xs text-center">
                  Hóa đơn của tôi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center flex-1"
                onPress={() => console.log("router.push(\"/spaylater/history\")")}
              >
                <View className="bg-red-50 p-3 rounded-xl mb-2">
                  <Ionicons name="wallet-outline" size={24} color="#FF5733" />
                </View>
                <Text className="text-gray-700 text-xs text-center">
                  Giao dịch
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-around">
              <TouchableOpacity
                className="items-center flex-1"
              >
                <View className="bg-blue-50 p-3 rounded-xl mb-2">
                  <Ionicons
                    name="storefront-outline"
                    size={24}
                    color="#3B82F6"
                  />
                </View>
                <Text className="text-gray-700 text-xs text-center">
                  Thanh Toán tại{"\n"}Cửa Hàng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center flex-1"
              >
                <View className="bg-blue-50 p-3 rounded-xl mb-2">
                  <Ionicons
                    name="phone-portrait-outline"
                    size={24}
                    color="#3B82F6"
                  />
                </View>
                <Text className="text-gray-700 text-xs text-center">
                  Nạp Thẻ & Dịch Vụ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center flex-1"
                onPress={() => router.push("/spaylater/vouchers")}
              >
                <View className="relative">
                  <View className="bg-red-50 p-3 rounded-xl mb-2">
                    <Ionicons name="gift-outline" size={24} color="#FF5733" />
                  </View>
                  <View className="absolute -top-1 -right-1 bg-red-500 px-1.5 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-bold">Hot</Text>
                  </View>
                </View>
                <Text className="text-gray-700 text-xs text-center">
                  Gói Voucher{"\n"}1.000.000Đ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Banner */}
        <View className="mx-4 mb-4">
          <Image
            source={require("@/assets/spaylater-banner.jpg")}
            style={{ width: width - 32, height: (width - 32) * 0.4 }}
            className="rounded-2xl"
            resizeMode="cover"
          />
        </View>

        {/* Vouchers Section */}
        <View className="mx-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold text-lg">Mã ưu đãi</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/spaylater/vouchers")}
            >
              <Text className="text-gray-500 text-sm mr-1">Xem thêm</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {vouchers.map((voucher) => (
            <View
              key={voucher.id}
              className="bg-white rounded-2xl p-4 mb-3 flex-row"
            >
              {/* Left Side - Free Ship Icon */}
              <LinearGradient
                colors={["#00D4AA", "#00B894"]}
                className="w-24 rounded-xl items-center justify-center mr-4"
              >
                {voucher.limitedQuantity && (
                  <View className="absolute top-2 left-2 bg-yellow-400 px-2 py-0.5 rounded">
                    <Text className="text-xs font-bold text-gray-800">
                      Số lượng có hạn
                    </Text>
                  </View>
                )}
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold mb-1">
                    FREE
                  </Text>
                  <Text className="text-white text-xl font-bold">SHIP</Text>
                  <View className="mt-2 border-t border-white/30 pt-2 w-full">
                    <Text className="text-white text-xs text-center font-semibold">
                      Mã vận chuyển
                    </Text>
                    <Text className="text-white text-xs text-center">
                      Tất cả hình thức{"\n"}thanh toán
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Right Side - Voucher Details */}
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-1">
                  {voucher.title}
                </Text>
                <Text className="text-gray-600 text-sm mb-2">
                  {voucher.subtitle}
                </Text>
                <View className="border border-red-500 rounded px-2 py-1 self-start mb-2">
                  <Text className="text-red-500 text-xs font-semibold">
                    {voucher.code}
                  </Text>
                </View>
                <Text className="text-red-500 text-xs mb-3">
                  Sắp hết hạn: {voucher.expiry}
                </Text>

                <View className="flex-row items-center justify-between">
                  <TouchableOpacity>
                    <Text className="text-blue-600 text-sm font-semibold">
                      Điều Kiện
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-white border border-red-500 px-4 py-2 rounded-lg">
                    <Text className="text-red-500 font-semibold">
                      Dùng Ngay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <View className="mx-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 font-bold text-lg">
                Giao dịch gần đây
              </Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/spaylater/transaction/${transaction.id}")}
              >
                <Text className="text-gray-500 text-sm mr-1">Xem tất cả</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-4">
              {transactions.slice(0, 3).map((transaction, index) => {
                const daysRemaining = spaylaterService.getDaysRemaining(
                  new Date(transaction.dueDate)
                );
                const isOverdue = spaylaterService.isOverdue(
                  new Date(transaction.dueDate)
                );
                const remainingAmount =
                  spaylaterService.getRemainingAmount(transaction);

                return (
                  <TouchableOpacity
                    key={transaction.id}
                    onPress={() =>
                      router.push(`/spaylater/transaction/${transaction.id}`)
                    }
                    className={`py-3 ${
                      index !== transactions.slice(0, 3).length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-gray-900 font-semibold flex-1">
                        Đơn hàng #
                        {transaction.order?.orderNumber || transaction.id}
                      </Text>
                      <Text className="text-gray-900 font-bold">
                        {formatPrice(remainingAmount)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-500 text-xs">
                        {new Date(transaction.purchaseDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isOverdue ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        {transaction.status === "PAID"
                          ? "Đã thanh toán"
                          : isOverdue
                          ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                          : `Còn ${daysRemaining} ngày`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Zero Interest Section */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold text-lg">
              Sản phẩm 0% Lãi 0% Phí
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/shop")}
            >
              <Text className="text-gray-500 text-sm mr-1">Xem thêm</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-white rounded-2xl p-8"
            onPress={() => router.push("/shop")}
          >
            <View className="items-center">
              <Ionicons name="pricetag-outline" size={48} color="#FF5733" />
              <Text className="text-gray-900 font-semibold mt-3 mb-1">
                Khám phá sản phẩm trả góp 0%
              </Text>
              <Text className="text-gray-500 text-center text-sm">
                Hàng nghìn sản phẩm với ưu đãi đặc biệt
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
