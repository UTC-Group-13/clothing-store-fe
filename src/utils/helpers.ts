export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price * 23000); // Convert USD to VND (approximate rate)
};

export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
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

