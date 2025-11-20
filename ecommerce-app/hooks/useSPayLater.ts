// hooks/useSPayLater.ts
import { useState, useEffect } from 'react';
import { spaylaterService, SPayLaterCustomer, SPayLaterTransaction } from '@/services/spaylaterService';
import { useAuth } from '@/hooks/useAuth';

export function useSPayLater() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<SPayLaterCustomer | null>(null);
  const [transactions, setTransactions] = useState<SPayLaterTransaction[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);

  /**
   * Load thông tin SPayLater
   */
  const loadCustomerInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const info = await spaylaterService.getCustomerInfo(user.id);
      
      if (info) {
        setCustomer(info.customer);
        setTransactions(info.transactions);
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin SPayLater');
      console.error('Load customer info error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đăng ký SPayLater
   */
  const register = async (bankAccount: string, bankName: string) => {
    if (!user?.id) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await spaylaterService.register(user.id, bankAccount, bankName);
      
      if (result.success) {
        await loadCustomerInfo();
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Đăng ký thất bại';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tạo giao dịch mua hàng bằng SPayLater
   * @param orderId - ID của đơn hàng
   * @param amount - Số tiền LOAN (remaining amount after advance payment)
   */
  const createTransaction = async (orderId: number, amount: number) => {
    if (!user?.id) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    if (!isRegistered) {
      return { success: false, error: 'Vui lòng đăng ký SPayLater trước' };
    }

    // Validate parameters
    if (!orderId || orderId <= 0) {
      console.error('Invalid orderId:', orderId);
      return { success: false, error: 'Order ID không hợp lệ' };
    }

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return { success: false, error: 'Số tiền không hợp lệ' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('useSPayLater - Creating transaction:', {
        userId: user.id,
        orderId,
        amount
      });

      const result = await spaylaterService.createTransaction(user.id, orderId, amount);
      
      console.log('useSPayLater - Transaction result:', result);
      
      if (result.success) {
        await loadCustomerInfo(); // Refresh data
        return { success: true, transaction: result.transaction };
      }
      
      return { success: false, error: result.error };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Tạo giao dịch thất bại';
      console.error('useSPayLater - Create transaction error:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Thanh toán khoản vay
   */
  const makePayment = async (transactionId: number, amount: number) => {
    if (!user?.id) {
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await spaylaterService.makePayment(user.id, transactionId, amount);
      
      if (result.success) {
        await loadCustomerInfo(); // Refresh data
        return { success: true, payment: result.payment };
      }
      
      return { success: false, error: result.error };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Thanh toán thất bại';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh data
   */
  const refresh = async () => {
    await loadCustomerInfo();
  };

  // Auto load khi mount
  useEffect(() => {
    if (user?.id) {
      loadCustomerInfo();
    }
  }, [user?.id]);

  return {
    // State
    loading,
    error,
    customer,
    transactions,
    isRegistered,
    
    // Computed values
    availableCredit: customer?.availableCredit || 0,
    usedCredit: customer?.usedCredit || 0,
    creditLimit: customer?.creditLimit || 0,
    totalOverdue: customer?.totalOverdue || 0,
    
    // Actions
    register,
    createTransaction,
    makePayment,
    refresh,
  };
}