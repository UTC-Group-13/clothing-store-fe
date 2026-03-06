/**
 * Format number to Vietnamese currency
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date to Vietnamese format
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format date with time
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const re = /^(0|\+84)[0-9]{9}$/;
  return re.test(phone.replace(/\s/g, ''));
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get error message from API response
 * @param {Error} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
};

