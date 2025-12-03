import React, { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '@/services/orderService';

export default function MoMoPaymentScreen() {
  const { payUrl, orderNumber, orderData } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        backHandler.remove();
      };
    }, [])
  );

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('Navigation URL:', url);

    // Kiểm tra callback thành công từ MoMo
    if (url.includes('resultCode=0') || 
        url.includes('ecommerceapp://pending') ||
        url.includes('payment/callback')) {
      
      console.log('Payment success detected!');
      handlePaymentSuccess();
      return;
    }

    // Kiểm tra lỗi thanh toán
    if (url.includes('resultCode=') && !url.includes('resultCode=0')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const message = urlParams.get('message') || 'Giao dịch không thành công';
      
      Alert.alert(
        'Thanh toán thất bại',
        message,
        [
          {
            text: 'Đóng',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const handlePaymentSuccess = async () => {
  if (processingPayment) return;
  
  setProcessingPayment(true);
  setLoading(true);

  try {
    // Cập nhật trạng thái thanh toán của đơn hàng
    if (orderNumber && typeof orderNumber === 'string') {
      console.log('Updating order payment status:', orderNumber);
      
      const updateResult = await orderService.updateOrderPaymentStatus(
        orderNumber,
        'COMPLETED'
      );

      if (updateResult.success) {
        console.log('Payment status updated successfully');
      } else {
        console.error('Failed to update payment status:', updateResult.error);
      }
    }

    // Chuyển đến trang order success
    setTimeout(() => {
      router.replace({
        pathname: '/(auth)/order_success',
        params: {
          orderData: orderData as string,
        },
      });
    }, 500);

  } catch (error) {
    console.error('Error processing payment success:', error);
    // Vẫn chuyển đến order success dù có lỗi
    router.replace({
      pathname: '/(auth)/order_success',
      params: {
        orderData: orderData as string,
      },
    });
  } finally {
    setProcessingPayment(false);
  }
};

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('Không thể tải trang thanh toán');
    setLoading(false);
  };

  const handleBackPress = () => {
    Alert.alert(
      'Hủy thanh toán',
      'Bạn có chắc muốn hủy giao dịch này? Đơn hàng đã được tạo và bạn có thể thanh toán sau.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        {
          text: 'Hủy',
          onPress: () => {
            router.replace('/(auth)/checkout');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // ✅ NÚT TEST: Giả lập thanh toán thành công
  const handleTestPaymentSuccess = async () => {
  console.log('🔵 Test button pressed');
  console.log('📦 orderNumber:', orderNumber);
  
  if (!orderNumber) {
    Alert.alert('Lỗi', 'Không tìm thấy mã đơn hàng');
    return;
  }
  
  Alert.alert(
    'Test Mode',
    `Cập nhật trạng thái thanh toán cho đơn hàng ${orderNumber}?`,
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          console.log('🟢 User confirmed test payment');
          setProcessingPayment(true);
          
          try {
            console.log('📝 Calling API with orderNumber:', orderNumber);
            
            // ✅ Truyền orderNumber (string) thay vì id
            const updateResult = await orderService.updateOrderPaymentStatus(
              orderNumber as string,
              'COMPLETED'
            );

            console.log('📊 API Response:', updateResult);

            if (updateResult.success) {
              console.log('✅ Payment status updated successfully');
              
              // Chuyển hướng sau 200ms
              setTimeout(() => {
                console.log('🚀 Navigating to order_success...');
                router.replace({
                  pathname: '/(auth)/order_success',
                  params: {
                    orderData: orderData as string,
                  },
                });
              }, 200);
            } else {
              console.error('❌ Update failed:', updateResult.error);
              setProcessingPayment(false);
              Alert.alert('Lỗi', updateResult.error || 'Không thể cập nhật trạng thái');
            }
          } catch (error) {
            console.error('💥 Exception:', error);
            setProcessingPayment(false);
            Alert.alert('Lỗi', 'Có lỗi xảy ra: ' + error);
          }
        },
      },
    ]
  );
};
  if (!payUrl) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Ionicons name="warning" size={60} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          Lỗi thanh toán
        </Text>
        <Text className="text-gray-600 mt-2 text-center px-6">
          Không tìm thấy link thanh toán
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-600 rounded-xl py-3 px-8"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleBackPress} className="flex-row items-center">
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-pink-100 rounded-full items-center justify-center mr-2">
              <Text className="text-pink-600 font-bold text-lg">M</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Thanh toán MoMo
            </Text>
          </View>

          <TouchableOpacity onPress={() => webViewRef.current?.reload()}>
            <Ionicons name="refresh" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Info */}
      <View className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-blue-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-600">Mã đơn hàng</Text>
            <Text className="text-sm font-bold text-blue-600 mt-1">
              {orderNumber}
            </Text>
          </View>
          <View className="bg-blue-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              Đang thanh toán
            </Text>
          </View>
        </View>
      </View>

      {/* ✅ NÚT TEST */}
      <TouchableOpacity
        className="bg-green-600 mx-4 mt-3 rounded-xl py-3 items-center"
        onPress={handleTestPaymentSuccess}
        disabled={processingPayment}
      >
        {processingPayment ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold">Thanh toán</Text>
        )}
      </TouchableOpacity>

      {/* Processing Overlay */}
      {processingPayment && (
        <View className="absolute inset-0 bg-white bg-opacity-95 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-900 font-semibold text-lg mt-4">
            Đang xử lý thanh toán...
          </Text>
          <Text className="text-gray-500 text-sm mt-2">
            Vui lòng không tắt ứng dụng
          </Text>
        </View>
      )}

      {/* Error State */}
      {error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Lỗi tải trang
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            {error}
          </Text>
          <View className="flex-row mt-6 space-x-3">
            <TouchableOpacity
              className="bg-gray-200 rounded-xl py-3 px-6"
              onPress={() => router.back()}
            >
              <Text className="text-gray-700 font-semibold">Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-3 px-6 ml-3"
              onPress={() => {
                setError('');
                setLoading(true);
                webViewRef.current?.reload();
              }}
            >
              <Text className="text-white font-semibold">Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {loading && !processingPayment && (
            <View className="absolute inset-0 bg-white bg-opacity-95 justify-center items-center z-50">
              <View className="items-center">
                <ActivityIndicator size="large" color="#D82D8B" />
                <Text className="text-gray-900 font-semibold text-lg mt-4">
                  Đang tải trang thanh toán...
                </Text>
                <Text className="text-gray-500 text-sm mt-2">
                  Vui lòng chờ trong giây lát
                </Text>
              </View>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ uri: payUrl as string }}
            onLoadStart={() => {
              console.log('WebView started loading');
              setLoading(true);
            }}
            onLoadEnd={() => {
              console.log('WebView finished loading');
              setLoading(false);
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onError={handleWebViewError}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('HTTP Error:', nativeEvent.statusCode);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            mixedContentMode="always"
            allowsBackForwardNavigationGestures={false}
            cacheEnabled={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            style={{ flex: 1 }}
          />
        </>
      )}

      {/* Bottom Instructions */}
      <View className="bg-gray-50 px-4 py-4 border-t border-gray-200">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-semibold text-gray-900 mb-1">
              Hướng dẫn thanh toán
            </Text>
            <Text className="text-xs text-gray-600 leading-5">
              • Chọn phương thức thanh toán trên trang MoMo{'\n'}
              • Hoàn tất thanh toán theo hướng dẫn{'\n'}
              • Bạn sẽ được chuyển về ứng dụng tự động
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}