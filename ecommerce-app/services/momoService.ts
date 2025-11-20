import api from './api';

interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
}

interface MoMoPaymentResponse {
  success: boolean;
  payUrl?: string;
  deeplink?: string;
  requestId?: string;
  message?: string;
}

export const momoService = {
  /**
   * Gọi API backend để tạo yêu cầu thanh toán MoMo
   */
  async createPayment(data: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
    try {
      const response = await api.post('/momo', data);
      
      return {
        success: true,
        payUrl: response.data.payUrl,
        deeplink: response.data.deeplink,
        requestId: response.data.requestId,
      };
    } catch (error: any) {
      console.error('MoMo Payment Error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Không thể tạo thanh toán MoMo',
      };
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(orderNumber: string): Promise<{
    success: boolean;
    paymentStatus?: string;
    error?: string;
  }> {
    try {
      const response = await api.get(`/momo/status/${orderNumber}`);
      
      return {
        success: true,
        paymentStatus: response.data.paymentStatus,
      };
    } catch (error: any) {
      console.error('Check payment status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể kiểm tra trạng thái thanh toán',
      };
    }
  },
};