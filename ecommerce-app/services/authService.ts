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
}


export const authService = {
  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data);
      // Tạo wallet cho user mới
      await this.ensureUserHasWallet(response.data.user.id);
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
        console.log('Creating wallet for user', userId);
        const result = await web3Service.registerUserWallet(userId);
        
        if (result.success) {
          // Mint 100 coins ban đầu
          await web3Service.mintCoinsToUser(userId, 100);
          console.log('Wallet created and 100 coins minted');
        }
      }
    } catch (error) {
      console.error('Ensure wallet error:', error);
    }
  },

  async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data);
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      // Đảm bảo user có wallet
      await this.ensureUserHasWallet(response.data.user.id);
      
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