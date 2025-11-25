import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useCart } from '@/context/CartContext';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="product-customer/[id]"
        options={{ href: null }}
      />
      
      <Tabs.Screen
        name="mall"
        options={{
          title: 'Mall',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-handle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color, size }) => {
            // Tạo component riêng để sử dụng useCart hook
            const CartIcon = () => {
              const { cart } = useCart();
              
              return (
                <View style={{ position: 'relative' }}>
                  <Ionicons name="cart" size={size} color={color} />
                  {cart.length > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -10,
                        backgroundColor: '#EF4444',
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}
                      >
                        {cart.length > 99 ? '99+' : cart.length}
                      </Text>
                    </View>
                  )}
                </View>
              );
            };
            
            return <CartIcon />;
          },
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="order/[id]"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="all_orders"
        options={{ href: null }}
      />
      
      <Tabs.Screen
        name="search"
        options={{ href: null }}
      />
      
      <Tabs.Screen
        name="seller-shop/[id]"
        options={{ href: null }}
      />
      
      <Tabs.Screen
        name="coin_transfer"
        options={{ href: null }}
      />
    </Tabs>
  );
}