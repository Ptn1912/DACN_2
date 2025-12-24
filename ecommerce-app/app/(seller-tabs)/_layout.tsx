import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, DeviceEventEmitter} from "react-native";
import { useEffect, useState } from "react";

export default function SellerTabLayout() {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      "seller-products-count",
      (count) => {
        setProductCount(count);
      }
    );

    return () => sub.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* Dashboard - Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Cửa hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order/[id]"
        options={{
          href: null,
        }}
      />
      {/* Add Product */}
      <Tabs.Screen
        name="add-product"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
        }}
      />
      {/* Products */}
      <Tabs.Screen
        name="products"
        options={{
          title: "Sản phẩm",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
          tabBarBadge: productCount > 0 ? productCount : undefined,
        }}
      />

      {/* Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarBadge: 2,
        }}
      />
<<<<<<< HEAD

=======
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      {/* Profile/Account */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
>>>>>>> bdc11782 (Completed 24/12)
      <Tabs.Screen
        name="chatAI"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-product"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
<<<<<<< HEAD
      {/* Profile/Account */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      
=======
>>>>>>> bdc11782 (Completed 24/12)
    </Tabs>
  );
}
