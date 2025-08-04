import { Dimensions, Platform } from 'react-native';
import { AppError } from '../types';

const { width, height } = Dimensions.get('window');

// 屏幕尺寸工具
export const screenUtils = {
  width,
  height,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  isTablet: width >= 768,
};

// 平台检测工具
export const platformUtils = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  version: Platform.Version,
};

// 字符串工具
export const stringUtils = {
  // 截断文本
  truncate: (text: string, maxLength: number, suffix: string = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // 首字母大写
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // 生成随机ID
  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  },

  // 格式化时间
  formatTime: (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
  },

  // 格式化文件大小
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

// 数组工具
export const arrayUtils = {
  // 去重
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  // 随机排序
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // 分组
  groupBy: <T, K extends string | number>(array: T[], key: (item: T) => K): Record<K, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = key(item);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  },

  // 分页
  paginate: <T>(array: T[], page: number, pageSize: number): T[] => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return array.slice(start, end);
  },
};

// 对象工具
export const objectUtils = {
  // 深度克隆
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // 移除空值
  removeEmpty: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  // 获取嵌套属性值
  getNestedValue: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    
    return result;
  },
};

// 验证工具
export const validationUtils = {
  // 邮箱验证
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 手机号验证
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 密码强度验证
  isStrongPassword: (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },

  // URL验证
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

// 错误处理工具
export const errorUtils = {
  // 创建应用错误
  createError: (code: string, message: string, details?: any): AppError => {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  },

  // 处理异步错误
  handleAsyncError: async <T>(promise: Promise<T>): Promise<[T | null, AppError | null]> => {
    try {
      const result = await promise;
      return [result, null];
    } catch (error) {
      const appError = errorUtils.createError(
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : '未知错误',
        error
      );
      return [null, appError];
    }
  },

  // 错误日志
  logError: (error: AppError): void => {
    console.error(`[${error.timestamp.toISOString()}] ${error.code}: ${error.message}`, error.details);
  },
};

// 存储工具
export const storageUtils = {
  // 安全存储键名
  getStorageKey: (key: string): string => {
    return `gu_${key}`;
  },

  // 序列化数据
  serialize: (data: any): string => {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('数据序列化失败:', error);
      return '';
    }
  },

  // 反序列化数据
  deserialize: <T>(data: string, defaultValue?: T): T | null => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('数据反序列化失败:', error);
      return defaultValue || null;
    }
  },
};

// 性能工具
export const performanceUtils = {
  // 防抖
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  // 节流
  throttle: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let lastCall = 0;
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  },

  // 测量执行时间
  measureTime: async <T>(fn: () => Promise<T> | T, label: string = '执行时间'): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
};

// 导出所有工具
export default {
  screenUtils,
  platformUtils,
  stringUtils,
  arrayUtils,
  objectUtils,
  validationUtils,
  errorUtils,
  storageUtils,
  performanceUtils,
}; 