// app/(customer-tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { uploadImageToCloudinary } from '@/utils/uploadImage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);
  useEffect(() => {
  const checkToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔑 Token:', token ? 'EXISTS' : 'MISSING');
  };
  checkToken();
}, []);
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh để upload avatar'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      console.log('🖼️ Uploading avatar...', uri);

      // Sử dụng hàm uploadImageToCloudinary có sẵn
      const result = await uploadImageToCloudinary(uri);

      if (result.success && result.url) {
        setAvatar(result.url);
        Alert.alert('Thành công', 'Upload ảnh thành công');
        console.log('✅ Avatar uploaded:', result.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      Alert.alert('Lỗi', error.message || 'Upload ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate
      if (!fullName.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tên đầy đủ');
        return;
      }

      // Validate password if changing
      if (newPassword || confirmPassword) {
        if (!currentPassword) {
          Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
          return;
        }

        if (newPassword.length < 8) {
          Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự');
          return;
        }

        if (newPassword !== confirmPassword) {
          Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
          return;
        }
      }

      setIsLoading(true);

      const updateData: any = {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        avatar: avatar || null,
      };

      // Add password if changing
      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const result = await userService.updateProfile(updateData);

      if (result.success) {
        // Update local storage
        await AsyncStorage.setItem('userData', JSON.stringify(result.data));
        
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }

        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        Alert.alert('Thành công', result.message || 'Cập nhật thông tin thành công');
        router.push('/(customer-tabs)/profile');
      } else {
        Alert.alert('Lỗi', result.error || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Cài đặt tài khoản
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="bg-white px-4 py-6 mb-4">
          <Text className="text-gray-900 font-semibold text-base mb-4">
            Ảnh đại diện
          </Text>
          
          <View className="items-center">
            <View className="relative">
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="person" size={48} color="#3B82F6" />
                </View>
              )}
              
              <TouchableOpacity
                onPress={pickImage}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white"
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-500 text-sm mt-3">
              Nhấn vào biểu tượng camera để thay đổi
            </Text>
          </View>
        </View>

        {/* Personal Info */}
        <View className="bg-white px-4 py-6 mb-4">
          <Text className="text-gray-900 font-semibold text-base mb-4">
            Thông tin cá nhân
          </Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Họ và tên <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900"
            />
          </View>

          {/* Email (Read-only) */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              value={user?.email}
              editable={false}
              className="bg-gray-100 px-4 py-3 rounded-xl text-gray-500"
            />
          </View>

          {/* Phone */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Số điện thoại
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900"
            />
          </View>
        </View>

        {/* Change Password */}
        <View className="bg-white px-4 py-6 mb-4">
          <Text className="text-gray-900 font-semibold text-base mb-4">
            Đổi mật khẩu
          </Text>

          {/* Current Password */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Mật khẩu hiện tại
            </Text>
            <View className="relative">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showCurrentPassword}
                className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Mật khẩu mới
            </Text>
            <View className="relative">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                secureTextEntry={!showNewPassword}
                className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Xác nhận mật khẩu mới
            </Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirmPassword}
                className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading || isUploading}
            className={`py-4 rounded-xl items-center ${
              isLoading || isUploading ? 'bg-blue-300' : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Lưu thay đổi
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}