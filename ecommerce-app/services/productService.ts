// services/productService.ts
import api from './api';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  soldCount: number;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  seller: {
    id: number;
    fullName: string;
  };
  createdAt: Date;
}

export interface ProductListResponse {
  success: boolean;
  data?: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface CategoryListResponse {
  success: boolean;
  data?: {
    categories: Category[];
  };
  error?: string;
}

export const productService = {
  /**
   * Lấy danh sách products
   */
  async getProducts(params?: {
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.categoryId) {
        queryParams.append('categoryId', params.categoryId.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const response = await api.get(`/products?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get products error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải danh sách sản phẩm',
      };
    }
  },

  /**
   * Lấy chi tiết product
   */
  async getProductById(id: number): Promise<ProductListResponse> {
    try {
      const response = await api.get(`/products/${id}`);
      
      // API returns single product, wrap in array format
      return {
        success: true,
        data: {
          products: [response.data],
          pagination: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
          },
        },
      };
    } catch (error: any) {
      console.error('Get product error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải thông tin sản phẩm',
      };
    }
  },

  /**
   * Lấy danh sách categories
   */
  async getCategories(): Promise<CategoryListResponse> {
    try {
      const response = await api.get('/categories');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get categories error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tải danh mục',
      };
    }
  },

  /**
   * Tạo product mới (seller only)
   */
  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId: number;
    sellerId: number;
    images: string[];
  }): Promise<ProductListResponse> {
    try {
      const response = await api.post('/products', data);
      
      // API returns the product directly, wrap in expected format
      return {
        success: true,
        data: {
          products: [response.data],
          pagination: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
          },
        },
      };
    } catch (error: any) {
      console.error('Create product error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể tạo sản phẩm',
      };
    }
  },

  /**
   * Cập nhật product (seller only)
   */
  async updateProduct(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: number;
      images?: string[];
      isActive?: boolean;
    }
  ): Promise<ProductListResponse> {
    try {
      const response = await api.put(`/products/${id}`, data);
      
      return {
        success: true,
        data: {
          products: [response.data],
          pagination: {
            total: 1,
            page: 1,
            limit: 1,
            totalPages: 1,
          },
        },
      };
    } catch (error: any) {
      console.error('Update product error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể cập nhật sản phẩm',
      };
    }
  },

  /**
   * Xóa product (seller only)
   */
  async deleteProduct(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(`/products/${id}`);
      
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Delete product error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Không thể xóa sản phẩm',
      };
    }
  },
};