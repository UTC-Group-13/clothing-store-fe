import type { Product } from '../types';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getProductPrice = (product: Product): number => {
  return product.basePrice || product.price || 0;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const FASHION_CATEGORIES = ["men's clothing", "women's clothing"] as const;

export const isFashionCategory = (category: string): boolean => {
  return FASHION_CATEGORIES.includes(category as (typeof FASHION_CATEGORIES)[number]);
};

export const getFashionCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    "men's clothing": 'Nam',
    "women's clothing": 'Nữ',
  };

  return labels[category] || 'Thời trang';
};

/**
 * Generate URL-friendly slug from Vietnamese text.
 * E.g. "Áo Thun Nike Basic" → "ao-thun-nike-basic"
 */
export const generateSlug = (name: string): string => {
  const map: Record<string, string> = {
    'à':'a','á':'a','ả':'a','ã':'a','ạ':'a',
    'ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a',
    'â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a',
    'đ':'d',
    'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e',
    'ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
    'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
    'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o',
    'ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o',
    'ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
    'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u',
    'ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
    'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'
  };
  return name
    .toLowerCase()
    .split('')
    .map(c => map[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

/**
 * Chuẩn hóa URL ảnh sản phẩm: nếu là đường dẫn tương đối thì thêm domain backend.
 * Dùng cho mọi nơi hiển thị ảnh sản phẩm (Cart, Checkout, Product, Admin...)
 */
export const getImageUrl = (url: string | null | undefined): string => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://160.30.113.40:8080';
  if (!url) return '/placeholder-product.jpg';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};
