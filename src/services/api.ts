import axios from 'axios';
import type {
  Product, Color, Category, Size, ApiResponse, PageResponse,
  ProductSearchParams, ProductVariant, VariantStock,
  CartSummary, CartItemRequest,
  ShippingMethod, PaymentType, ShopBankAccount,
  OrderDetail, OrderRequest, OrderStatus,
  AddressDTO, AddressRequest,
  AdminPagedResponse, UpdateOrderStatusRequest, ProductRequest
} from '../types';

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
        config.headers['Bypass-Auth'] = 'false';
      }
    } catch (error) {
      console.error('Error parsing auth storage:', error);
    }
  }
  return config;
});

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login/register page
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

// ============= CART API =============
export const cartService = {
  getCart: async (): Promise<CartSummary> => {
    const response = await api.get<ApiResponse<CartSummary>>('/cart');
    return response.data.data;
  },

  addItem: async (data: CartItemRequest): Promise<CartSummary> => {
    const response = await api.post<ApiResponse<CartSummary>>('/cart/items', data);
    return response.data.data;
  },

  updateItem: async (itemId: number, data: CartItemRequest): Promise<CartSummary> => {
    const response = await api.put<ApiResponse<CartSummary>>(`/cart/items/${itemId}`, data);
    return response.data.data;
  },

  removeItem: async (itemId: number): Promise<CartSummary> => {
    const response = await api.delete<ApiResponse<CartSummary>>(`/cart/items/${itemId}`);
    return response.data.data;
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};

// ============= SHIPPING METHOD API =============
export const shippingService = {
  getAll: async (): Promise<ShippingMethod[]> => {
    const response = await api.get<ApiResponse<ShippingMethod[]>>('/shipping-methods');
    return response.data.data;
  },
};

// ============= PAYMENT TYPE API =============
export const paymentTypeService = {
  getAll: async (): Promise<PaymentType[]> => {
    const response = await api.get<ApiResponse<PaymentType[]>>('/payment-types');
    return response.data.data;
  },
};

// ============= SHOP BANK ACCOUNT API =============
export const shopBankAccountService = {
  getActive: async (): Promise<ShopBankAccount> => {
    const response = await api.get<ApiResponse<ShopBankAccount>>('/shop-bank-accounts/active');
    return response.data.data;
  },
};

// ============= ORDER API =============
export const orderService = {
  placeOrder: async (data: OrderRequest): Promise<OrderDetail> => {
    const response = await api.post<ApiResponse<OrderDetail>>('/orders', data);
    return response.data.data;
  },

  getMyOrders: async (): Promise<OrderDetail[]> => {
    const response = await api.get<ApiResponse<OrderDetail[]>>('/orders');
    return response.data.data;
  },

  getOrderById: async (orderId: number): Promise<OrderDetail> => {
    const response = await api.get<ApiResponse<OrderDetail>>(`/orders/${orderId}`);
    return response.data.data;
  },

  cancelOrder: async (orderId: number): Promise<OrderDetail> => {
    const response = await api.patch<ApiResponse<OrderDetail>>(`/orders/${orderId}/cancel`);
    return response.data.data;
  },
};

// ============= ADDRESS API =============
export const addressService = {
  getMyAddresses: async (): Promise<AddressDTO[]> => {
    const response = await api.get<ApiResponse<AddressDTO[]>>('/addresses');
    return response.data.data;
  },

  addAddress: async (data: AddressRequest): Promise<AddressDTO> => {
    const response = await api.post<ApiResponse<AddressDTO>>('/addresses', data);
    return response.data.data;
  },

  updateAddress: async (addressId: number, data: AddressRequest): Promise<AddressDTO> => {
    const response = await api.put<ApiResponse<AddressDTO>>(`/addresses/${addressId}`, data);
    return response.data.data;
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    await api.delete(`/addresses/${addressId}`);
  },

  setDefault: async (addressId: number): Promise<AddressDTO> => {
    const response = await api.patch<ApiResponse<AddressDTO>>(`/addresses/${addressId}/default`);
    return response.data.data;
  },
};

// ============= ORDER STATUS API =============
export const orderStatusService = {
  getAll: async (): Promise<OrderStatus[]> => {
    const response = await api.get<ApiResponse<OrderStatus[]>>('/order-statuses');
    return response.data.data;
  },
};

// ============= ADMIN API =============
export const adminOrderService = {
  getAllOrders: async (page = 0, size = 20): Promise<AdminPagedResponse<OrderDetail>> => {
    const response = await api.get<ApiResponse<AdminPagedResponse<OrderDetail>>>(`/orders/admin/all?page=${page}&size=${size}`);
    return response.data.data;
  },

  getOrdersByStatus: async (statusId: number, page = 0, size = 20): Promise<AdminPagedResponse<OrderDetail>> => {
    const response = await api.get<ApiResponse<AdminPagedResponse<OrderDetail>>>(`/orders/admin/by-status/${statusId}?page=${page}&size=${size}`);
    return response.data.data;
  },

  getOrderById: async (orderId: number): Promise<OrderDetail> => {
    const response = await api.get<ApiResponse<OrderDetail>>(`/orders/admin/${orderId}`);
    return response.data.data;
  },

  updateOrderStatus: async (orderId: number, data: UpdateOrderStatusRequest): Promise<OrderDetail> => {
    const response = await api.patch<ApiResponse<OrderDetail>>(`/orders/admin/${orderId}/status`, data);
    return response.data.data;
  },
};

export const adminProductService = {
  createProduct: async (data: ProductRequest): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: number, data: ProductRequest): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export default api;
