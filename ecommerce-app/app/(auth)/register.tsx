// app/(auth)/register.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
// Components
import AuthHeader from '../../components/auth/AuthHeader';
import SocialLogin from '../../components/auth/SocialLogin';
import CustomButton from '../../components/common/Button';
import CustomInput from '../../components/common/Input';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!acceptTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    setError('');
    setLoading(true);

    const result = await authService.register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      userType: 'customer', // hoặc lấy từ user selection
    });

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Thành công', 
        'Đăng ký tài khoản thành công!',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    } else {
      setError(result.error || 'Đăng ký thất bại');
      Alert.alert('Lỗi', result.error || 'Đăng ký thất bại');
    }
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
        
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <AuthHeader
            title="Tạo tài khoản"
            subtitle="Đăng ký để bắt đầu mua sắm"
            icon="person-add"
          />
          {error && (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <Text className="text-red-600 text-sm">{error}</Text>
                    </View>
                  )}
          {/* Form */}
          <View className="mt-8">
            <CustomInput
              label="Họ và tên"
              placeholder="Nhập họ tên đầy đủ"
              value={formData.fullName}
              onChangeText={(text) => updateField('fullName', text)}
              leftIcon={
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              }
            />

            <CustomInput
              label="Email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle="mt-4"
              leftIcon={
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              }
            />

            <CustomInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
              containerStyle="mt-4"
              leftIcon={
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
              }
            />

            <CustomInput
              label="Mật khẩu"
              placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
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

            <CustomInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              secureTextEntry={!showConfirmPassword}
              containerStyle="mt-4"
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              }
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              }
            />

            {/* Terms & Conditions */}
            <TouchableOpacity
              className="flex-row items-center mt-5"
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                  acceptTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              >
                {acceptTerms && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text className="text-gray-600 text-sm flex-1">
                Tôi đồng ý với{' '}
                <Text className="text-blue-600 font-medium">
                  Điều khoản dịch vụ
                </Text>{' '}
                và{' '}
                <Text className="text-blue-600 font-medium">
                  Chính sách bảo mật
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <CustomButton
              title="Đăng ký"
              onPress={handleRegister}
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

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600 text-sm">
                Đã có tài khoản?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold text-sm">
                    Đăng nhập ngay
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