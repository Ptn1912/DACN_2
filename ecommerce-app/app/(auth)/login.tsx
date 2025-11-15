import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter, router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { authService } from '../../services/authService';
import { Alert } from 'react-native';
import { useAuth } from "../../hooks/useAuth";
// Components
import AuthHeader from "../../components/auth/AuthHeader";
import SocialLogin from "../../components/auth/SocialLogin";
import CustomButton from "../../components/common/Button";
import CustomInput from "../../components/common/Input";

export default function LoginScreen() {
  const [userType, setUserType] = useState<"customer" | "seller" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
       setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setError('');
    setLoading(true);

    const result = await authService.login({
      email,
      password,
      userType: userType!,
    });

    setLoading(false);

    if (result.success) {
      // Navigate based on user type
      await refreshUser();
      if (userType === "customer") {
        router.replace("/(customer-tabs)");
      } else {
        router.replace("/(seller-tabs)");
      }
    } else {
      setError(result.error || 'Đăng nhập thất bại');
      Alert.alert('Lỗi', result.error || 'Đăng nhập thất bại');
    }
  };
  
  if (userType === null) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
      
          {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}
          <View className="flex-1 px-6 pt-10 pb-8 justify-between">
            {/* Header */}
            <View className="items-center">
              <Image
                source={require("../../assets/logo.jpg")}
                style={{
                  width: 200,
                  height: 200,
                  alignSelf: "center",
                  marginBottom: 8,
                }}
                resizeMode="contain"
              />
              <Text className="text-gray-600 text-center text-base ">
                Chọn vai trò để bắt đầu
              </Text>
            </View>

            {/* Role Selection Cards */}
            <View className="space-y-4">
              {/* Customer Card */}
              <TouchableOpacity
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
                onPress={() => setUserType("customer")}
              >
                <View className="flex-row items-center mb-3">
                  <View className="bg-blue-500 rounded-full p-3 mr-3">
                    <Ionicons name="cart-outline" size={24} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-lg">
                      Người mua
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Mua sắm sản phẩm
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#2563EB" />
                </View>
                <Text className="text-gray-600 text-sm">
                  Truy cập để mua hàng, theo dõi đơn hàng và quản lý tài khoản
                  của bạn
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-1">
              {/* Seller Card */}
              <TouchableOpacity
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200"
                onPress={() => setUserType("seller")}
              >
                <View className="flex-row items-center mb-3">
                  <View className="bg-orange-500 rounded-full p-3 mr-3">
                    <Ionicons name="podium" size={24} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-lg">
                      Người bán
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Quản lý cửa hàng
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#EA580C" />
                </View>
                <Text className="text-gray-600 text-sm">
                  Truy cập để bán sản phẩm, quản lý kho hàng và doanh số
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="items-center">
              <Text className="text-gray-500 text-xs text-center">
                Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Login Form Screen
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16">
          {/* Back Button */}
          <TouchableOpacity className="mb-4" onPress={() => setUserType(null)}>
            <View className="flex-row items-center">
              <Ionicons name="arrow-back" size={24} color="#2563EB" />
              <Text className="text-blue-600 font-medium ml-2">Quay lại</Text>
            </View>
          </TouchableOpacity>

          {/* Header */}
          <AuthHeader
            title={
              userType === "customer"
                ? "Chào mừng trở lại!"
                : "Cửa hàng tại Ecomira"
            }
            subtitle={
              userType === "customer"
                ? "Đăng nhập để tiếp tục mua sắm"
                : "Đăng nhập tài khoản bán hàng"
            }
            icon={userType === "customer" ? "cart" : "storefront"}
          />

          {/* Form */}
          <View className="mt-10">
            <CustomInput
              label={userType === "customer" ? "Email" : "Email cửa hàng"}
              placeholder={
                userType === "customer"
                  ? "Nhập email của bạn"
                  : "Nhập email của cửa hàng"
              }
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              }
            />

            <CustomInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              containerStyle="mt-4"
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              }
            />

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mt-3">
              <Text className="text-blue-600 font-medium text-sm">
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <CustomButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              containerStyle="mt-8"
            />

            {/* Divider */}
            <View className="flex-row items-center mt-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">Hoặc</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {userType === "customer" && <SocialLogin />}

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8 mb-6">
              <Text className="text-gray-600 text-sm">
                {userType === "customer"
                  ? "Chưa có tài khoản? "
                  : "Chưa có cửa hàng? "}
              </Text>
              <Link
                href={
                  userType === "customer" ? "/register" : "/sellerRegister"
                }
                asChild
              >
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold text-sm">
                    {userType === "customer"
                      ? "Đăng ký ngay"
                      : "Đăng ký cửa hàng"}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
