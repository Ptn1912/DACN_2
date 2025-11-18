import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Order, OrderItem, orderService } from "../services/orderService";


interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useOrders(userId: number | undefined): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders({
        userId: userId,
        userType: "customer",
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
      } else {
        setError(res.error || "Không thể tải đơn hàng");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refresh: fetchOrders };
}
