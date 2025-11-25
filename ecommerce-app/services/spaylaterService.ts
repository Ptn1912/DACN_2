// services/spaylaterService.ts - NO BLOCKCHAIN VERSION
import api from './api';

export interface SPayLaterCustomer {
  id: number;
  userId: number;
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  totalPaid: number;
  totalOverdue: number;
  isActive: boolean;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankAccount?: string;
  bankName?: string;
}

export interface SPayLaterTransaction {
  id: number;
  customerId: number;
  orderId?: number;
  amount: number;
  paidAmount: number;
  purchaseDate: Date;
  dueDate: Date;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  lateFee: number;
  order?: {
    id: number;
    orderNumber: string;
  };
}

export interface SPayLaterPayment {
  id: number;
  transactionId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface SPayLaterInfo {
  customer: SPayLaterCustomer;
  transactions: SPayLaterTransaction[];
}

class SPayLaterService {
  /**
   * Lấy thông tin SPayLater của user
   */
  async getCustomerInfo(userId: number): Promise<SPayLaterInfo | null> {
    try {
      console.log('🌐 Fetching customer info for user:', userId);
      const response = await api.get(`/spaylater?userId=${userId}`);
      
      if (!response.data.registered) {
        console.log('❌ User not registered');
        return null;
      }
      
      // Parse data đúng cấu trúc
      const result: SPayLaterInfo = {
        customer: response.data.customer,
        transactions: response.data.customer?.transactions || [],
      };
      
      console.log('✅ Parsed result:', {
        customerId: result.customer?.id,
        customerUserId: result.customer?.userId,
        transactionsCount: result.transactions.length,
        transactions: result.transactions
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ Get customer info error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Đăng ký SPayLater
   */
  async register(userId: number, bankAccount: string, bankName: string) {
    try {
      const response = await api.post('/spaylater', {
        action: 'register',
        userId,
        bankAccount,
        bankName,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Tạo giao dịch SPayLater khi đặt hàng
   * @param userId - ID của user
   * @param orderId - ID của đơn hàng
   * @param amount - Số tiền LOAN (số tiền còn lại sau khi trừ advance payment)
   */
  async createTransaction(userId: number, orderId: number, amount: number) {
    try {
      const payload = {
        action: 'createTransaction',
        userId: Number(userId),
        orderId: Number(orderId),
        amount: Number(amount),
      };
      
      console.log('spaylaterService - Creating transaction with payload:', payload);
      
      const response = await api.post('/spaylater', payload);
      
      console.log('spaylaterService - Transaction created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('spaylaterService - Create transaction error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Thanh toán khoản vay
   */
  async makePayment(
    userId: number, 
    transactionId: number, 
    amount: number,
    paymentMethod: string = 'bank_transfer'
  ) {
    try {
      const response = await api.post('/spaylater/payment', {
        userId,
        transactionId,
        amount,
        paymentMethod,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử thanh toán
   */
  async getPaymentHistory(userId: number, transactionId?: number) {
    try {
      let url = `/spaylater/payment?userId=${userId}`;
      if (transactionId) {
        url += `&transactionId=${transactionId}`;
      }
      
      const response = await api.get(url);
      return response.data.payments;
    } catch (error: any) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  /**
   * Tính số ngày còn lại đến hạn
   */
  getDaysRemaining(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Kiểm tra có quá hạn không
   */
  isOverdue(dueDate: Date): boolean {
    return this.getDaysRemaining(dueDate) < 0;
  }

  /**
   * Kiểm tra có đến hạn thanh toán không (trong vòng 7 ngày tới)
   */
  isDueSoon(dueDate: Date): boolean {
    const daysRemaining = this.getDaysRemaining(dueDate);
    return daysRemaining >= 0 && daysRemaining <= 7;
  }

  /**
   * Kiểm tra có thể thanh toán không (đã đến hạn hoặc sắp đến hạn)
   */
  canPayNow(transaction: SPayLaterTransaction): boolean {
    if (transaction.status === 'PAID') return false;
    
    const daysRemaining = this.getDaysRemaining(new Date(transaction.dueDate));
    // Cho phép thanh toán khi còn 7 ngày hoặc đã quá hạn
    return daysRemaining <= 7;
  }
  
  /**
   * Format số tiền VND
   */
  formatPrice(amount: number): string {
    return amount.toLocaleString('vi-VN') + ' ₫';
  }

  /**
   * Tính tổng số tiền cần thanh toán (gốc + phí trễ)
   */
  getTotalPayableAmount(transaction: SPayLaterTransaction): number {
    return Number(transaction.amount) + Number(transaction.lateFee);
  }

  /**
   * Tính số tiền còn lại cần thanh toán
   */
  getRemainingAmount(transaction: SPayLaterTransaction): number {
    return this.getTotalPayableAmount(transaction) - Number(transaction.paidAmount);
  }
}

export const spaylaterService = new SPayLaterService();
export default spaylaterService;