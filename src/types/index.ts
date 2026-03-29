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

// ============= CART API TYPES =============

// Cart item request (add/update)
export interface CartItemRequest {
  variantStockId: number;
  qty: number;
}

// Cart item detail from server
export interface CartItemDetail {
  id: number;
  cartId: number;
  variantStockId: number;
  sku: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  availableStock: number;
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number;
  colorName: string;
  colorHex: string;
  colorImageUrl: string;
  sizeLabel: string;
  sizeType: string;
}

// Cart summary from server
export interface CartSummary {
  cartId: number;
  userId: number;
  items: CartItemDetail[];
  totalItems: number;
  totalAmount: number;
}

// ============= SHIPPING TYPES =============

export interface ShippingMethod {
  id: number;
  name: string;
  price: number;
}

// ============= PAYMENT TYPES =============

export interface PaymentType {
  id: number;
  value: string;
}


// ============= SHOP BANK ACCOUNT =============

export interface ShopBankAccount {
  id: number;
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  logoUrl?: string;
  isActive: boolean;
}

// ============= ORDER TYPES =============

export interface OrderRequest {
  paymentTypeId: number;
  shippingAddressId: number;
  shippingMethodId: number;
  note?: string;
}

export interface AddressDTO {
  id: number;
  unitNumber: string;
  streetNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  countryId: number;
  isDefault: boolean;
}

export interface AddressRequest {
  unitNumber?: string;
  streetNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  countryId?: number;
}

export interface OrderLineDetail {
  id: number;
  variantStockId: number;
  sku: string;
  qty: number;
  price: number;
  subtotal: number;
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number;
  colorName: string;
  colorHex: string;
  colorImageUrl: string;
  sizeLabel: string;
  sizeType: string;
}

export interface OrderDetail {
  id: number;
  orderCode: string;
  userId: number;
  orderDate: string;
  statusId: number;
  statusName: string;
  paymentTypeId: number;
  paymentTypeName: string;
  paymentNote?: string;
  qrUrl?: string;
  bankInfo?: ShopBankAccount;
  shippingMethodId: number;
  shippingMethodName: string;
  shippingFee: number;
  shippingAddressId: number;
  shippingAddressDetail: AddressDTO;
  subtotal: number;
  orderTotal: number;
  items: OrderLineDetail[];
}

export interface OrderStatus {
  id: number;
  status: string;
}

// ============= ADMIN TYPES =============

export interface UpdateOrderStatusRequest {
  statusId: number;
}

export interface AdminPagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface ProductRequest {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  basePrice: number;
  brand: string;
  material: string;
  isActive: boolean;
  thumbnailUrl?: string;
}

// ============= REVIEW TYPES =============

export interface ReviewResponse {
  id: number;
  userId: number;
  username: string;
  orderedProductId: number;
  ratingValue: number;
  comment: string;
  createdAt: string;
  productId: number;
  productName: string;
  productSlug: string;
  colorName: string;
  colorHex: string;
  colorImageUrl: string;
  sizeLabel: string;
  sizeType: string;
  sku: string;
}

export interface ReviewSummary {
  productId: number;
  avgRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  orderedProductId: number;
  ratingValue: number;
  comment?: string;
}

// ============= CHATBOT TYPES =============

export interface ChatMessageRequest {
  message: string;
  sessionId: string | null;
  productId?: number | null;
}

export interface ChatProductSuggestion {
  id: number;
  name: string;
  price: number;
  thumbnailUrl: string;
  slug: string;
  brand: string;
  material: string;
  categoryName: string;
}

export interface ChatMessageResponse {
  message: string;
  sessionId: string;
  suggestions: ChatProductSuggestion[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: ChatProductSuggestion[];
}

// ============= PRODUCT MANAGEMENT (ADMIN FULL) TYPES =============

// --- Request types ---

export interface StockRequest {
  id: number | null;
  sizeId: number;
  stockQty: number;
  priceOverride: number | null;
  sku: string;
}

export interface VariantRequest {
  id: number | null;
  colorId: number;
  colorImageUrl: string | null;
  images: string | null; // JSON array string
  isDefault: boolean;
  stocks: StockRequest[];
}

export interface ProductFullRequest {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  basePrice: number;
  brand: string;
  material: string;
  isActive: boolean;
  variants: VariantRequest[];
}

// --- Response types ---

export interface StockDetail {
  id: number;
  sizeId: number;
  sizeLabel: string;
  sizeType: string;
  stockQty: number;
  priceOverride: number | null;
  effectivePrice: number;
  sku: string;
}

export interface VariantDetail {
  id: number;
  colorId: number;
  colorName: string;
  colorHexCode: string;
  colorSlug: string;
  colorImageUrl: string | null;
  images: string | null; // JSON array string
  isDefault: boolean;
  stocks: StockDetail[];
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  categoryName: string;
  basePrice: number;
  brand: string;
  material: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: VariantDetail[];
}

// --- File Upload ---

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  contentType: string;
  size: number;
}
