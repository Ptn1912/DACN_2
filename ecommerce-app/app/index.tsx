// app/index.tsx
import { Redirect } from 'expo-router';


export default function Index() {
  // Kiểm tra user đã login chưa (có thể dùng AsyncStorage hoặc context)
  const isLoggedIn = false; // TODO: Implement auth check
  
  if (isLoggedIn) {
    return <Redirect href="/(customer-tabs)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}