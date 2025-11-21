// app/spaylater/register.tsx - NO BLOCKCHAIN VERSION
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSPayLater } from '@/hooks/useSPayLater';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const { register, loading } = useSPayLater();
  
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('Vietcombank');
  const [agreed, setAgreed] = useState(false);

  // Danh sách ngân hàng
  const banks = [
    'Vietcombank',
    'VietinBank',
    'BIDV',
    'Agribank',
    'Techcombank',
    'MBBank',
    'VPBank',
    'ACB',
    'SHB',
    'TPBank',
  ];

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!idNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số CMND/CCCD');
      return;
    }

    if (idNumber.length < 9 || idNumber.length > 12) {
      Alert.alert('Lỗi', 'Số CMND/CCCD không hợp lệ');
      return;
    }

    if (!bankAccount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tài khoản ngân hàng');
      return;
    }

    if (bankAccount.length < 6) {
      Alert.alert('Lỗi', 'Số tài khoản ngân hàng không hợp lệ');
      return;
    }

    if (!agreed) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    // Register
    const result = await register(bankAccount, bankName);

    if (result.success) {
      Alert.alert(
        'Thành công! 🎉',
        'Đăng ký SPayLater thành công! Bạn có hạn mức 2 triệu đồng.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/spaylater/transaction/transaction'),
          },
        ]
      );
    } else {
      Alert.alert('Lỗi', result.error || 'Đăng ký thất bại');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Đăng ký SPayLater</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Benefits Card */}
        <LinearGradient
          colors={['#3B82F6', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 rounded-2xl p-6"
        >
          <Text className="text-white text-2xl font-bold mb-4">
            Ưu đãi đặc biệt
          </Text>
          <View className="flex-row items-center mb-3">
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text className="text-white ml-3 text-base">
              Hạn mức 2.000.000 VNĐ
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text className="text-white ml-3 text-base">
              Lãi suất 0% trong 30 ngày
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text className="text-white ml-3 text-base">
              Duyệt tự động, không cần thẩm định
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text className="text-white ml-3 text-base">
              Thanh toán dễ dàng qua ngân hàng
            </Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-lg font-bold mb-4">Thông tin đăng ký</Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">
              Họ và tên <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* ID Number */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">
              CMND/CCCD <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="001234567890"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="numeric"
              maxLength={12}
            />
            <Text className="text-gray-500 text-xs mt-1">
              Nhập 9-12 số
            </Text>
          </View>

          {/* Bank Account */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">
              Số tài khoản ngân hàng <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="1234567890"
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="numeric"
            />
            <Text className="text-gray-500 text-xs mt-1">
              Tài khoản sẽ dùng để thanh toán khoản vay
            </Text>
          </View>

          {/* Bank Name */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">
              Ngân hàng <Text className="text-red-500">*</Text>
            </Text>
            <View className="border border-gray-300 rounded-lg overflow-hidden">
              {banks.map((bank, index) => (
                <TouchableOpacity
                  key={bank}
                  onPress={() => setBankName(bank)}
                  className={`px-4 py-3 flex-row justify-between items-center ${
                    index !== banks.length - 1 ? 'border-b border-gray-200' : ''
                  } ${bankName === bank ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <Text className={`text-base ${
                    bankName === bank ? 'text-blue-600 font-semibold' : 'text-gray-700'
                  }`}>
                    {bank}
                  </Text>
                  {bankName === bank && (
                    <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 rounded-lg p-4 mb-4">
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="flex-1 ml-2">
                <Text className="text-gray-700 text-sm">
                  Thông tin cá nhân của bạn sẽ được bảo mật tuyệt đối.
                  Tài khoản ngân hàng chỉ dùng để thanh toán khoản vay.
                </Text>
              </View>
            </View>
          </View>

          {/* Terms */}
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            className="flex-row items-start mb-4"
          >
            <View
              className={`w-5 h-5 rounded border-2 ${
                agreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              } items-center justify-center mr-3 mt-0.5`}
            >
              {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text className="flex-1 text-gray-700">
              Tôi đồng ý với{' '}
              <Text className="text-blue-600">Điều khoản sử dụng</Text> và{' '}
              <Text className="text-blue-600">Chính sách bảo mật</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`rounded-lg py-4 ${
              loading ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Đăng ký ngay
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View className="mx-4 my-6 bg-green-50 rounded-2xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-semibold mb-1">
                Bảo mật thông tin
              </Text>
              <Text className="text-gray-600 text-sm">
                Thông tin của bạn được mã hóa và lưu trữ an toàn.
                Chúng tôi cam kết không chia sẻ thông tin với bên thứ ba.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}