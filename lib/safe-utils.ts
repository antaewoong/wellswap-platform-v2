// Safe utility functions for runtime stability

export const safeParseJSON = <T = any>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

export const safeParseNumber = (value: any, fallback = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const safeParseInt = (value: any, fallback = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const safeTruncate = (str: string, length = 100): string => {
  if (typeof str !== 'string') return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const safeAccess = <T = any>(obj: any, path: string, fallback: T): T => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' && key in current
        ? current[key]
        : undefined;
    }, obj) ?? fallback;
  } catch (error) {
    console.warn('Failed to safely access object path:', path, error);
    return fallback;
  }
};

export const safeLocalStorage = {
  get: <T = any>(key: string, fallback: T): T => {
    try {
      if (typeof window === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item ? safeParseJSON(item, fallback) : fallback;
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
      return fallback;
    }
  },
  
  set: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to set to localStorage:', error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }
};

export const safeAsync = async <T = any>(
  asyncFn: () => Promise<T>,
  fallback: T,
  onError?: (error: any) => void
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.warn('Async operation failed:', error);
    onError?.(error);
    return fallback;
  }
};

export const safeFetch = async <T = any>(
  url: string,
  options?: RequestInit,
  fallback: T = null as T
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Fetch failed:', url, error);
    return fallback;
  }
};

export const safeArrayAccess = <T = any>(
  arr: any[],
  index: number,
  fallback: T
): T => {
  try {
    if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
      return fallback;
    }
    return arr[index] ?? fallback;
  } catch (error) {
    console.warn('Safe array access failed:', error);
    return fallback;
  }
};

export const safeStringify = (obj: any, fallback = '{}'): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Failed to stringify object:', error);
    return fallback;
  }
};

// Type-safe object property checker
export const hasProperty = <T extends object>(
  obj: T,
  prop: string
): prop is keyof T => {
  return obj != null && typeof obj === 'object' && prop in obj;
};

// Safe error message extractor
export const safeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

// Safe URL validator
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Safe email validator
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

// Safe phone number validator (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,15}$/;
  return typeof phone === 'string' && phoneRegex.test(phone);
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle = false;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

export default {
  safeParseJSON,
  safeParseNumber,
  safeParseInt,
  safeTruncate,
  safeAccess,
  safeLocalStorage,
  safeAsync,
  safeFetch,
  safeArrayAccess,
  safeStringify,
  hasProperty,
  safeErrorMessage,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  debounce,
  throttle
};