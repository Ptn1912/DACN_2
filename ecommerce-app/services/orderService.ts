import api from './api';

export interface OrderItem {
  id: number;
  productId: number;
  sellerId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
  product: {
    id: number;
    name: string;
    images: string[];
  };
  seller: {
    id: number;
    fullName: string;
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  totalAmount: number;
  shippingFee: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  customer: {
    id: number;
    fullName: string;
    phone: string;
  };
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod =
  | 'cod'
  | 'bank_transfer'
  | 'momo'
  | 'zalopay'
  | 'credit_card'
  | 'pay_later';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderListResponse {
  success: boolean;
  data?: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: Order;
  error?: string;
}
export interface UserAddress {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
}
export const orderService = {
  /**
   * Get orders list
   */
  async getOrders(params: {
    userId: number;
    userType: 'customer' | 'seller';
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<OrderListResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', params.userId.toString());
      queryParams.append('userType', params.userType);

      if (params.status) {
        queryParams.append('status', params.status);
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const response = await api.get(`/orders?${queryParams.toString()}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get orders error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải danh sách đơn hàng',
      };
    }
  },

  /**
   * Get order detail
   */
  async getOrderById(id: number): Promise<OrderResponse> {
    try {
      const response = await api.get(`/orders/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải thông tin đơn hàng',
      };
    }
  },

  /**
   * Create order
   */
  async createOrder(data: {
    customerId: number;
    items: Array<{
      productId: number;
      quantity: number;
    }>;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: PaymentMethod;
    note?: string;
    advancePaymentAmount?: number;
  }): Promise<OrderResponse> {
    try {
      const response = await api.post('/orders', data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Create order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tạo đơn hàng',
      };
    }
  },

  /**
   * Lấy địa chỉ giao hàng từ đơn hàng gần nhất
   */
  async getLastShippingAddress(userId: number): Promise<UserAddress | null> {
    try {
      const response = await api.get(`/orders?userId=${userId}&userType=customer&limit=1`);
      
      if (response.data.orders && response.data.orders.length > 0) {
        const lastOrder = response.data.orders[0];
        return {
          shippingName: lastOrder.shippingName,
          shippingPhone: lastOrder.shippingPhone,
          shippingAddress: lastOrder.shippingAddress,
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Get last shipping address error:', error);
      return null;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: number,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<OrderResponse> {
    console.log('Order ID received in service:', id);
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new Error('Order ID must be a positive number.');
      }
      const response = await api.put(`/orders/${id}`, {
        status,
        ...(paymentStatus && { paymentStatus }),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Update order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể cập nhật đơn hàng',
      };
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(`/orders/${id}`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Cancel order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể hủy đơn hàng',
      };
    }
  },

  async getOrderPaymentStatus(orderId: string): Promise<{
  success: boolean;
  paymentStatus?: PaymentStatus;
  error?: string;
}> {
  try {
    const response = await api.get(`/orders/${orderId}`);
    
    if (response.data.orders && response.data.orders.length > 0) {
      return {
        success: true,
        paymentStatus: response.data.paymentStatus,
      };
    }
    
    return {
      success: false,
      error: 'Không tìm thấy đơn hàng',
    };
  } catch (error: any) {
    console.error('Get payment status error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Không thể kiểm tra trạng thái thanh toán',
    };
  }
},
 /**
 * Cập nhật trạng thái thanh toán bằng orderNumber
 * @param orderNumber - Mã đơn hàng (VD: ORD1763740368287596)
 * @param paymentStatus - Trạng thái thanh toán mới
 */
  async updateOrderPaymentStatus(
    orderNumber: string,
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📝 Updating payment status for order ${orderNumber} to ${paymentStatus}`);
      
      const response = await api.patch(`/orders/${orderNumber}`, {
        paymentStatus,
      });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể cập nhật trạng thái thanh toán',
      };
    }
  },
  /**
   * Phương thức xác nhận đơn hàng (Pending -> Confirmed)
   * @param orderId ID của đơn hàng cần xác nhận
   */
  confirmOrder: async (orderId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      // Bạn có thể dùng updateOrderStatus, hoặc một endpoint chuyên biệt
      // Nếu dùng endpoint chuyên biệt:
      // await api.put(`/orders/${orderId}/confirm`);

      // HOẶC sử dụng hàm updateOrderStatus hiện có (nếu nó cho phép chuyển trạng thái)
      const result = await orderService.updateOrderStatus(orderId, 'confirmed');
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error("Error confirming order:", error);
      return { success: false, error: "Lỗi hệ thống khi xác nhận đơn hàng." };
    }
  },

  /**
   * Phương thức chuyển đơn hàng sang trạng thái Đang giao (-> Shipping)
   * @param orderId ID của đơn hàng
   */
  shipOrder: async (orderId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      // Endpoint API để chuyển trạng thái sang Shipping
      // await api.put(`/orders/${orderId}/ship`); 

      // HOẶC sử dụng hàm updateOrderStatus hiện có
      const result = await orderService.updateOrderStatus(orderId, 'shipping');
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error("Error shipping order:", error);
      return { success: false, error: "Lỗi hệ thống khi chuyển trạng thái giao hàng." };
    }
  },

};

export const getOrderById = async (orderId: number) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

export const cancelOrder = async (orderId: number) => {
  const res = await api.delete(`/orders/${orderId}`);
  return res.data;
};

export const requestReturn = async (orderId: number) => {
  const res = await api.put(`/orders/${orderId}`, { status: 'returned' });
  return res.data;
};

export const confirmDelivered = async (orderId: number) => {
  const res = await api.put(`/orders/${orderId}`, { status: "delivered" });
  return res.data;
};
