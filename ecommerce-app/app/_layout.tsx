// import '../polyfills';  // ⭐ Import đầu tiên
import '../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/hooks/useAuth';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import CartProvider from '@/context/CartContext';

// Tắt warnings không cần thiết
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

export default function RootLayout() {
  // useEffect(() => {
  //   // Verify polyfills loaded
  //   console.log('🔍 Checking polyfills...');
  //   console.log('crypto.getRandomValues:', typeof global.crypto?.getRandomValues);
  //   console.log('Buffer:', typeof global.Buffer);
  //   console.log('process:', typeof global.process);
  // }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        >
          <Stack.Screen
            name="(auth)/login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)/register"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(customer-tabs)"
            options={{
              headerShown: false,
            }}
          />
          {/* <Stack.Screen name="coin_transfer" options={{ headerShown: false }} /> */}
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}