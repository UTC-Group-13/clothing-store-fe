import axios from 'axios';
import type { Product, Color, Category, Size, ApiResponse, PageResponse, ProductSearchParams, ProductVariant, VariantStock } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token if available
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${state.user.accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing auth storage:', error);
    }
  }
  return config;
});

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products');
    return response.data.data;
  },

  searchProducts: async (params: ProductSearchParams): Promise<PageResponse<Product>> => {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.direction) queryParams.append('direction', params.direction);
    
    // Handle array parameters
    if (params.categoryIds && params.categoryIds.length > 0) {
      params.categoryIds.forEach(id => queryParams.append('categoryIds', id.toString()));
    }
    if (params.colorIds && params.colorIds.length > 0) {
      params.colorIds.forEach(id => queryParams.append('colorIds', id.toString()));
    }
    if (params.sizeIds && params.sizeIds.length > 0) {
      params.sizeIds.forEach(id => queryParams.append('sizeIds', id.toString()));
    }
    
    const response = await api.get<ApiResponse<PageResponse<Product>>>(`/products/search?${queryParams.toString()}`);
    return response.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/category/${categorySlug}`);
    return response.data.data;
  },
};

export const colorService = {
  getAllColors: async (): Promise<Color[]> => {
    const response = await api.get<ApiResponse<Color[]>>('/colors');
    return response.data.data;
  },
};

export const sizeService = {
  getAllSizes: async (): Promise<Size[]> => {
    const response = await api.get<ApiResponse<Size[]>>('/sizes');
    return response.data.data;
  },
};

export const productVariantService = {
  getByProductId: async (productId: number): Promise<ProductVariant[]> => {
    const response = await api.get<ApiResponse<ProductVariant[]>>(`/product-variants/product/${productId}`);
    return response.data.data;
  },
};

export const variantStockService = {
  getByVariantId: async (variantId: number): Promise<VariantStock[]> => {
    const response = await api.get<ApiResponse<VariantStock[]>>(`/variant-stocks/variant/${variantId}`);
    return response.data.data;
  },
};

export default api;

