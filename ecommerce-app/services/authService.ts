import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const authService = {
  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Đăng ký thất bại',
      };
    }
  },

  async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data);
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
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