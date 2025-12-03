import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import web3Service from '@/services/ethersService';

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  userType: 'customer' | 'seller';
}

export interface LoginData {
  email: string;
  password: string;
  userType: 'customer' | 'seller';
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  userType: 'customer' | 'seller';
  avatar?: string;
}

export const authService = {
  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data);
      
      if (data.userType === 'customer') {
        console.log('📝 Creating blockchain wallet for customer...');
        await this.ensureUserHasWallet(response.data.user.id);
      } else {
        console.log('ℹ️ Seller registered - skipping blockchain wallet creation');
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Đăng ký thất bại',
      };
    }
  },

  async ensureUserHasWallet(userId: number) {
    try {
      const balance = await web3Service.getUserBalance(userId);
      if (!balance) {
        // User chưa có wallet, tạo mới
        console.log('🔨 Creating wallet for user', userId);
        const result = await web3Service.registerUserWallet(userId);
        
        if (result.success) {
          // Mint 100 coins ban đầu
          const mintResult = await web3Service.mintCoinsToUser(userId, 100);
          if (mintResult.success) {
            console.log('✅ Wallet created and 100 coins minted');
          } else {
            console.log('⚠️ Wallet created but failed to mint coins');
          }
        } else {
          console.error('❌ Failed to create wallet:', result.error);
        }
      } else {
        console.log('ℹ️ User already has wallet');
      }
    } catch (error) {
      console.error('❌ Ensure wallet error:', error);
    }
  },

  async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data);
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // CHỈ đảm bảo customer có wallet, KHÔNG tạo cho seller
      if (data.userType === 'customer') {
        console.log('🔍 Checking customer wallet...');
        await this.ensureUserHasWallet(response.data.user.id);
      } else {
        console.log('ℹ️ Seller login - skipping wallet check');
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Đăng nhập thất bại',
      };
    }
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },
};