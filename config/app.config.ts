import { AppConfig, UserSettings } from '../types';

// 应用基础配置
export const APP_CONFIG: AppConfig = {
  theme: 'auto',
  language: 'zh-CN',
  audioEnabled: true,
  hapticEnabled: true,
  hardwareEnabled: true,
};

// 默认用户设置
export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  privacy: {
    dataCollection: false,
    analytics: false,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
  },
};

// 动画配置
export const ANIMATION_CONFIG = {
  // 页面过渡动画
  pageTransition: {
    duration: 300,
    easing: 'ease-in-out',
  },
  // 角色卡片动画
  cardAnimation: {
    duration: 200,
    easing: 'ease-out',
  },
  // 对话界面动画
  dialogueAnimation: {
    duration: 500,
    easing: 'ease-out',
  },
  // 硬件连接动画
  hardwareAnimation: {
    duration: 1000,
    easing: 'ease-in-out',
  },
};

// 音频配置
export const AUDIO_CONFIG = {
  // 背景音乐
  backgroundMusic: {
    volume: 0.3,
    isLooping: true,
    shouldPlay: true,
  },
  // 音效
  soundEffects: {
    tap: { volume: 0.5 },
    success: { volume: 0.7 },
    error: { volume: 0.6 },
    notification: { volume: 0.4 },
  },
  // 语音合成
  speech: {
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
  },
};

// 硬件配置
export const HARDWARE_CONFIG = {
  // 蓝牙扫描
  bluetooth: {
    scanTimeout: 10000, // 10秒
    connectionTimeout: 5000, // 5秒
    retryAttempts: 3,
  },
  // 传感器配置
  sensors: {
    updateInterval: 100, // 100ms
    accuracy: 'high',
  },
  // 控制器配置
  controller: {
    deadzone: 0.1,
    sensitivity: 1.0,
  },
};

// API 配置
export const API_CONFIG = {
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  retryAttempts: 3,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// 角色配置
export const ROLE_CONFIG = {
  // 默认角色设置
  defaultRoles: [
    {
      id: 'explorer',
      name: '探索者',
      tags: ['冒险', '探索', '勇敢'],
      category: 'adventure',
    },
    {
      id: 'scholar',
      name: '学者',
      tags: ['智慧', '学习', '知识'],
      category: 'education',
    },
    {
      id: 'artist',
      name: '艺术家',
      tags: ['艺术', '创意', '灵感'],
      category: 'creative',
    },
  ],
  // 角色分类
  categories: [
    { id: 'adventure', name: '冒险', icon: 'compass' },
    { id: 'education', name: '教育', icon: 'school' },
    { id: 'creative', name: '创意', icon: 'brush' },
    { id: 'social', name: '社交', icon: 'people' },
  ],
};

// 主题配置
export const THEME_CONFIG = {
  light: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
};

// 本地化配置
export const LOCALIZATION_CONFIG = {
  supportedLanguages: ['zh-CN', 'en-US'],
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
};

// 存储配置
export const STORAGE_CONFIG = {
  keys: {
    userSettings: 'user_settings',
    appConfig: 'app_config',
    dialogueHistory: 'dialogue_history',
    hardwareDevices: 'hardware_devices',
  },
  encryption: {
    enabled: false,
    algorithm: 'AES-256',
  },
};

// 错误配置
export const ERROR_CONFIG = {
  // 错误代码
  codes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    HARDWARE_CONNECTION_FAILED: 'HARDWARE_CONNECTION_FAILED',
    AUDIO_PLAYBACK_FAILED: 'AUDIO_PLAYBACK_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
  // 错误消息
  messages: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    HARDWARE_CONNECTION_FAILED: '硬件设备连接失败',
    AUDIO_PLAYBACK_FAILED: '音频播放失败',
    PERMISSION_DENIED: '权限被拒绝',
    UNKNOWN_ERROR: '发生未知错误',
  },
}; 