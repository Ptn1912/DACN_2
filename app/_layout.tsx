import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css"; 

// Giữ splash screen hiển thị khi load fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Thêm custom fonts nếu cần
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
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
        name="(tabs)" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}