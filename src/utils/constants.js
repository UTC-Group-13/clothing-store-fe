// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// App Configuration
export const APP_NAME = 'Clothing Store';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

// Product Categories
export const CATEGORIES = [
  { id: 'ao', name: 'Áo', slug: 'ao' },
  { id: 'quan', name: 'Quần', slug: 'quan' },
  { id: 'vay', name: 'Váy', slug: 'vay' },
  { id: 'ao-khoac', name: 'Áo khoác', slug: 'ao-khoac' },
  { id: 'phu-kien', name: 'Phụ kiện', slug: 'phu-kien' },
];

// Product Sizes
export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Product Colors
export const COLORS = [
  { id: 'trang', name: 'Trắng', hex: '#FFFFFF' },
  { id: 'den', name: 'Đen', hex: '#000000' },
  { id: 'xam', name: 'Xám', hex: '#808080' },
  { id: 'navy', name: 'Navy', hex: '#000080' },
  { id: 'do', name: 'Đỏ', hex: '#FF0000' },
  { id: 'xanh', name: 'Xanh', hex: '#0000FF' },
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { value: 'name-asc', label: 'Tên: A-Z' },
  { value: 'name-desc', label: 'Tên: Z-A' },
];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  CART: 'cart',
  TOKEN: 'token',
};

// Shipping Fee
export const SHIPPING_FEE = 30000;

// Image Placeholder
export const PRODUCT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/300x400?text=Product+Image';

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
};

// Date Format
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công!',
    LOGOUT: 'Đăng xuất thành công!',
    REGISTER: 'Đăng ký thành công!',
    ADD_TO_CART: 'Đã thêm vào giỏ hàng!',
    REMOVE_FROM_CART: 'Đã xóa khỏi giỏ hàng!',
    ORDER_SUCCESS: 'Đặt hàng thành công!',
    PRODUCT_CREATED: 'Thêm sản phẩm thành công!',
    PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công!',
    PRODUCT_DELETED: 'Xóa sản phẩm thành công!',
    CATEGORY_CREATED: 'Thêm danh mục thành công!',
    CATEGORY_UPDATED: 'Cập nhật danh mục thành công!',
    CATEGORY_DELETED: 'Xóa danh mục thành công!',
  },
  ERROR: {
    GENERIC: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
    LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
    NETWORK: 'Lỗi kết nối. Vui lòng kiểm tra internet.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  },
};

