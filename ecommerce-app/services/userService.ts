// services/userService.ts
import api from './api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  userType: 'customer' | 'seller';
}

export interface SearchUsersResponse {
  success: boolean;
  users?: User[];
  total?: number;
  error?: string;
}

export interface GetUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const userService = {
  /**
   * Search users by name, email, or ID
   */
  async searchUsers(query: string = '', excludeUserId?: number): Promise<SearchUsersResponse> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', '20');
      
      if (excludeUserId) {
        params.append('excludeUserId', excludeUserId.toString());
      }

      const response = await api.get(`/search_users?${params.toString()}`);
      
      return {
        success: true,
        users: response.data.users,
        total: response.data.total,
      };
    } catch (error: any) {
      console.error('Search users error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tìm kiếm người dùng',
      };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<GetUserResponse> {
    try {
      const response = await api.post('/search_users', { userId });
      
      return {
        success: true,
        user: response.data.user,
      };
    } catch (error: any) {
      console.error('Get user error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể lấy thông tin người dùng',
      };
    }
  },

  /**
   * Get all users (for admin/testing)
   */
  async getAllUsers(limit: number = 100): Promise<SearchUsersResponse> {
    return this.searchUsers('', undefined);
  }
};