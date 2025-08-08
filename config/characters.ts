/**
 * 角色配置文件
 * 
 * @description 集中管理所有角色数据和相关资源配置
 * @author 开发团队
 * @version 1.0.0
 * 
 * 使用说明：
 * - 新增角色：在ROLES数组中添加新的角色配置
 * - 修改角色：直接修改对应的角色对象属性
 * - 图片资源：确保silhouette和image资源文件存在
 */

import type { Role } from '../types';

/**
 * 角色剪影图片资源映射
 * 
 * @description 预加载的角色剪影图片，用于角色卡片的背景展示
 * @constant {Record<string, any>} SILHOUETTE_IMAGES
 */
export const SILHOUETTE_IMAGES = {
  explorer: require('../assets/images/1.png'),
  scholar: require('../assets/images/2.png'),
  artist: require('../assets/images/3.png'),
  engineer: require('../assets/images/4.png'),
  architect: require('../assets/images/5.png'),
} as const;

/**
 * 角色背景图片资源（示例URLs）
 * 
 * @description 用于对话页面背景的高清角色图片
 * @constant {Record<string, any>} CHARACTER_IMAGES
 * 
 * @note 实际项目中应使用本地资源而非远程URL
 */
export const CHARACTER_IMAGES = {
  explorer: require('../assets/images/1.png'),
  scholar: require('../assets/images/2.png'),
  artist: require('../assets/images/3.png'),
  engineer: require('../assets/images/4.png'),
  architect: require('../assets/images/5.png'),
} as const;

/**
 * 角色头像资源（示例URLs）
 * 
 * @description 用于角色信息展示的头像图片
 * @constant {Record<string, string>} AVATAR_IMAGES
 */
export const AVATAR_IMAGES = {
  explorer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  scholar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  artist: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
  engineer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  architect: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
} as const;

/**
 * 完整角色配置数组
 * 
 * @description 包含所有可选择角色的完整信息
 * @constant {Role[]} ROLES
 * 
 * 配置说明：
 * - id: 角色唯一标识符，用于数据查找和路由传参
 * - name: 角色显示名称
 * - avatar: 角色头像图片URL
 * - description: 角色简介描述
 * - image: 角色完整图片，用于对话页面背景
 * - promote: 角色称号或职业标签
 * - tags: 角色特征标签数组
 * - greeting: 角色问候语/开场白
 * - accompanyDays: 陪伴天数统计
 * - silhouette: 角色剪影图片，用于选择页面展示
 */
export const ROLES: Role[] = [
  {
    id: 'explorer',
    name: '李泽言',
    avatar: AVATAR_IMAGES.explorer,
    description: '冷峻克制的商业领袖，理性外表下藏着细腻温柔。总在关键时刻替你挡风遮雨。',
    image: CHARACTER_IMAGES.explorer,
    promote: 'Zh集团总裁',
    tags: ['总裁', '理性', '毒舌'],
    greeting: '别走神，专心一点。今天的行程我来安排。',
    accompanyDays: 520,
    silhouette: SILHOUETTE_IMAGES.explorer,
  },
  {
    id: 'scholar',
    name: '许墨',
    avatar: AVATAR_IMAGES.scholar,
    description: '温和而神秘的天才研究员，痴迷未知，言语间常带试探与深情。',
    image: CHARACTER_IMAGES.scholar,
    promote: '认知科学教授',
    tags: ['温柔', '智性', '神秘'],
    greeting: '关于你，我还有很多假设想验证。',
    accompanyDays: 314,
    silhouette: SILHOUETTE_IMAGES.scholar,
  },
  {
    id: 'artist',
    name: '周棋洛',
    avatar: AVATAR_IMAGES.artist,
    description: '耀眼的国民偶像，热情开朗，想把全世界最好的都分享给你。',
    image: CHARACTER_IMAGES.artist,
    promote: '人气巨星',
    tags: ['阳光', '甜心', '活力'],
    greeting: '今天也要和我一起玩耍吗？我预留了你最喜欢的位置！',
    accompanyDays: 1314,
    silhouette: SILHOUETTE_IMAGES.artist,
  },
  {
    id: 'engineer',
    name: '白起',
    avatar: AVATAR_IMAGES.engineer,
    description: '沉稳的特勤队员，行动力满分。寡言却很细心，保护你是他的本能。',
    image: CHARACTER_IMAGES.engineer,
    promote: '特勤队员',
    tags: ['守护', '果决', '信赖'],
    greeting: '别怕，有我在。',
    accompanyDays: 777,
    silhouette: SILHOUETTE_IMAGES.engineer,
  },
  {
    id: 'architect',
    name: '凌肖',
    avatar: AVATAR_IMAGES.architect,
    description: '自由不羁的黑客，嘴上不饶人，心里却把你摆在最重要的位置。',
    image: CHARACTER_IMAGES.architect,
    promote: '天才黑客',
    tags: ['叛逆', '占有欲', '天赋'],
    greeting: '别靠太近，我怕忍不住更想你。',
    accompanyDays: 999,
    silhouette: SILHOUETTE_IMAGES.architect,
  },
];

/**
 * 根据ID获取角色数据
 * 
 * @param {string} id - 角色ID
 * @returns {Role | undefined} 角色数据或undefined
 */
export function getRoleById(id: string): Role | undefined {
  return ROLES.find(role => role.id === id);
}

/**
 * 根据标签过滤角色
 * 
 * @param {string} tag - 标签名称
 * @returns {Role[]} 包含该标签的角色数组
 */
export function getRolesByTag(tag: string): Role[] {
  return ROLES.filter(role => 
    role.tags.some(roleTag => 
      roleTag.toLowerCase().includes(tag.toLowerCase())
    )
  );
}

/**
 * 根据名称搜索角色
 * 
 * @param {string} query - 搜索关键词
 * @returns {Role[]} 匹配的角色数组
 */
export function searchRoles(query: string): Role[] {
  const lowercaseQuery = query.toLowerCase();
  return ROLES.filter(role => 
    role.name.toLowerCase().includes(lowercaseQuery) ||
    role.description.toLowerCase().includes(lowercaseQuery) ||
    role.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * 动画配置常量
 * 
 * @description 统一管理应用中的动画参数
 */
export const ANIMATION_CONFIG = {
  // 角色卡片动画
  CARD_SCALE_DURATION: 300,
  CARD_FADE_DURATION: 200,
  
  // 对话框动画
  DIALOGUE_APPEAR_DURATION: 600,
  DIALOGUE_SCALE_DURATION: 400,
  
  // 边框动画
  BORDER_ROTATION_DURATION: 3000,
  
  // 脉冲动画
  PULSE_DURATION: 2000,
  
  // 背景视差动画
  PARALLAX_DURATION: 8000,
  
  // 页面转场动画
  TRANSITION_DURATION: 350,
} as const;

/**
 * UI配置常量
 * 
 * @description 统一管理UI相关的尺寸和样式参数
 */
export const UI_CONFIG = {
  // 角色卡片
  CARD_WIDTH_RATIO: 0.28, // 相对屏幕宽度（适度放大以提升沉浸感）
  CARD_HEIGHT_RATIO: 0.58,  // 相对屏幕高度（让图片展示更完整）
  CARD_SPACING: 24,        // 卡片间距（略微缩短）
  
  // 对话框
  DIALOGUE_WIDTH_RATIO: 0.9,  // 相对屏幕宽度
  DIALOGUE_HEIGHT_RATIO: 0.8, // 相对屏幕宽度
  
  // 动画缩放比例
  CENTERED_SCALE: 1.18,    // 中央角色放大比例（更温和，避免夸张倾斜感）
  NON_CENTERED_SCALE: 0.92, // 非中央角色缩小比例（保持竖直切换的稳定感）
  
  // 透明度
  CENTERED_OPACITY: 1,     // 中央角色透明度
  NON_CENTERED_OPACITY: 0.55, // 非中央角色透明度（更易识别）
} as const;
