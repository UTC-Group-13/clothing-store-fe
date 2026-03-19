import axios from 'axios';
import type { Product } from '../types';
import { FASHION_CATEGORIES, isFashionCategory } from '../utils/helpers';

const API_BASE_URL = 'https://fakestoreapi.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const responses = await Promise.all(
      FASHION_CATEGORIES.map((category) => api.get(`/products/category/${category}`))
    );

    return responses.flatMap((response) => response.data as Product[]);
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    return [...FASHION_CATEGORIES];
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    if (!isFashionCategory(category)) {
      return productService.getAllProducts();
    }

    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },
};

export default api;

