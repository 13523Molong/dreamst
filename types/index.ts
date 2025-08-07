/**
 * 角色相关类型定义
 * 
 * @description 定义角色的完整数据结构，包含展示和交互所需的所有信息
 */
export interface Role {
  /** 角色唯一标识符 */
  id: string;
  
  /** 角色名称 */
  name: string;
  
  /** 角色头像URL或本地资源 */
  avatar: string;
  
  /** 角色详细描述 */
  description: string;
  
  /** 角色完整图片资源（用于背景展示） */
  image: any;
  
  /** 角色称号或职业 */
  promote: string;
  
  /** 角色特征标签 */
  tags: string[];
  
  /** 角色问候语/台词 */
  greeting: string;
  
  /** 陪伴天数统计 */
  accompanyDays: number;
  
  /** 角色剪影图片（用于卡片展示） */
  silhouette: any;
}

// 音频相关类型定义
export interface AudioConfig {
  volume: number;
  isLooping: boolean;
  shouldPlay: boolean;
}

export interface AudioEffect {
  type: 'tap' | 'success' | 'error' | 'notification';
  file: string;
  volume?: number;
}

// 硬件设备类型定义
export interface HardwareDevice {
  id: string;
  name: string;
  type: 'bluetooth' | 'sensor' | 'controller' | 'other';
  isConnected: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  lastSeen?: Date;
}

export interface HardwareEvent {
  type: 'connected' | 'disconnected' | 'dataReceived' | 'error';
  deviceId: string;
  data?: any;
  error?: string;
}

// 动画相关类型定义
export interface AnimationConfig {
  duration: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

// 应用配置类型定义
export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  audioEnabled: boolean;
  hapticEnabled: boolean;
  hardwareEnabled: boolean;
}

// 对话相关类型定义
export interface Message {
  id: string;
  roleId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'audio' | 'image';
  isUser: boolean;
}

export interface DialogueSession {
  id: string;
  roleId: string;
  startTime: Date;
  messages: Message[];
  duration: number;
}

// 导航参数类型定义
export interface NavigationParams {
  character?: string; // JSON string of Role
  returnTo?: string;
}

// 错误类型定义
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 用户设置类型定义
export interface UserSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
} 