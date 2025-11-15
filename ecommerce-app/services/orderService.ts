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
  | 'credit_card';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

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
   * Update order status
   */
  async updateOrderStatus(
    id: number,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<OrderResponse> {
    try {
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
};