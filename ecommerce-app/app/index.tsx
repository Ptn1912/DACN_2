// app/index.tsx
import { Redirect } from 'expo-router';
import "../global.css";

export default function Index() {
  // Kiểm tra user đã login chưa (có thể dùng AsyncStorage hoặc context)
  const isLoggedIn = false; // TODO: Implement auth check
  
  if (isLoggedIn) {
    return <Redirect href="/(customer-tabs)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}