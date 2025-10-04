import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import AuthHeader from '../../components/auth/AuthHeader';
import SocialLogin from '../../components/auth/SocialLogin';
import CustomButton from '../../components/common/Button';
import CustomInput from '../../components/common/Input';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log('Login:', { email, password });
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16">
          {/* Header */}
          <AuthHeader
            title="Chào mừng trở lại!"
            subtitle="Đăng nhập để tiếp tục mua sắm"
          />

          {/* Form */}
          <View className="mt-10">
            <CustomInput
              label="Email"
              placeholder="Nhập email của bạn"
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
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              }
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
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

            {/* Social Login */}
            <SocialLogin />

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8 mb-6">
              <Text className="text-gray-600 text-sm">
                Chưa có tài khoản?{' '}
              </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold text-sm">
                    Đăng ký ngay
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