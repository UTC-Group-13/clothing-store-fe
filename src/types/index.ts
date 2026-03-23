export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  basePrice: number;
  brand: string;
  material: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName: string | null;
  thumbnailUrl?: string | null;
  // Optional fields for compatibility
  title?: string;
  price?: number;
  image?: string;
  rating?: {
    rate: number;
    count: number;
  };
}

// Pagination Response Type
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Product Search Filters
export interface ProductSearchParams {
  name?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  colorIds?: number[];
  sizeIds?: number[];
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

// Authentication Types
export interface AuthResponse<T = any> {
  success: boolean;
  message: string;
  errorCode: string;
  data: T | null;
  timestamp: string;
}

export interface AuthData {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  emailAddress: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  emailAddress: string;
  phoneNumber: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  emailAddress: string;
  role: string;
  accessToken: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  errorCode: string | null;
  data: T;
  timestamp: string;
}

// Color Type
export interface Color {
  id: number;
  name: string;
  hexCode: string;
  slug: string;
}

// Category Type
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string;
  createdAt: string;
}

// Size Type
export interface Size {
  id: number;
  label: string;
  type: 'clothing' | 'numeric';
  sortOrder: number;
}

// Product Variant Type (biến thể theo màu)
export interface ProductVariant {
  id: number;
  productId: number;
  colorId: number;
  colorImageUrl?: string;
  images?: string; // JSON string of image URLs
  isDefault: boolean;
  colorName?: string;
  colorHexCode?: string;
}

// Variant Stock Type (tồn kho theo variant + size)
export interface VariantStock {
  id: number;
  variantId: number;
  sizeId: number;
  stockQty: number;
  priceOverride?: number | null;
  sku: string;
  sizeLabel?: string;
  sizeType?: string;
}

