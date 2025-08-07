# 恋与制作人风格IP角色二创应用 - 开发文档

## 项目概述

这是一个使用React Native开发的IP角色二创应用，采用恋与制作人的设计风格，提供角色选择和对话交互功能。

### 主要特性

- ✨ **恋与制作人风格设计** - 渐变色彩、梦幻效果、优雅动画
- 🎭 **角色选择页面** - 水平滑动、中央放大、动态缩放
- 💬 **沉浸式对话界面** - 多层边框动画、脉冲效果、视差背景
- 🎵 **触觉和音效反馈** - 增强用户体验
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🎨 **模块化架构** - 易于维护和扩展

## 项目结构

```
Gu/
├── app/                    # 页面组件
│   ├── index.tsx          # 角色选择主页面
│   ├── dialogue.tsx       # 角色对话页面
│   └── _layout.tsx        # 路由布局配置
├── components/             # 可复用组件
│   ├── AudioService.ts    # 音频服务
│   └── HardwareService.ts # 硬件服务
├── config/                 # 配置文件
│   ├── app.config.ts      # 应用配置
│   └── characters.ts      # 角色数据配置
├── types/                  # 类型定义
│   └── index.ts           # 全局类型接口
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   └── audio/             # 音频资源
└── utils/                  # 工具函数
    └── index.ts           # 通用工具
```

## 核心功能实现

### 1. 角色选择页面 (app/index.tsx)

#### 主要功能
- **水平滑动列表** - 使用FlatList实现流畅的水平滚动
- **动态缩放效果** - 中央角色放大(1.35x)，其他角色缩小(0.7x)
- **透明度渐变** - 中央角色不透明，其他角色半透明(0.4)
- **触觉反馈** - 滑动和点击时的震动反馈
- **角色信息展示** - 动态显示选中角色的详细信息

#### 核心动画
```typescript
// 使用react-native-reanimated实现流畅动画
const scale = interpolate(
  scrollValue,
  inputRange,
  [UI_CONFIG.NON_CENTERED_SCALE, UI_CONFIG.CENTERED_SCALE, UI_CONFIG.NON_CENTERED_SCALE],
  Extrapolate.CLAMP
);
```

### 2. 对话页面 (app/dialogue.tsx)

#### 主要功能
- **角色背景展示** - 使用角色图片作为背景，支持视差动画
- **多层对话框设计** - 渐变边框、内层装饰、脉冲光晕
- **动画序列** - 触觉反馈 → 角色显示 → 对话框显示 → 循环动画
- **交互按钮** - 语音、聊天、互动三个功能按钮

#### 动画效果
- **边框旋转动画** - 3秒一圈的连续旋转
- **脉冲呼吸动画** - 2秒往返的呼吸效果
- **背景视差动画** - 8秒一次的慢速视差移动

### 3. 配置管理 (config/characters.ts)

#### 角色数据结构
```typescript
export interface Role {
  id: string;           // 唯一标识符
  name: string;         // 角色名称
  avatar: string;       // 头像URL
  description: string;  // 角色描述
  image: any;          // 背景图片
  promote: string;     // 角色称号
  tags: string[];      // 特征标签
  greeting: string;    // 问候语
  accompanyDays: number; // 陪伴天数
  silhouette: any;     // 剪影图片
}
```

#### UI配置常量
```typescript
export const UI_CONFIG = {
  CARD_WIDTH_RATIO: 0.22,      // 卡片宽度比例
  CARD_HEIGHT_RATIO: 0.5,      // 卡片高度比例
  CENTERED_SCALE: 1.35,        // 中央角色放大比例
  NON_CENTERED_SCALE: 0.7,     // 非中央角色缩小比例
  CENTERED_OPACITY: 1,         // 中央角色透明度
  NON_CENTERED_OPACITY: 0.4,   // 非中央角色透明度
} as const;
```

## 开发指南

### 1. 添加新角色

在 `config/characters.ts` 中的 `ROLES` 数组添加新角色：

```typescript
{
  id: 'new_character',
  name: '新角色',
  avatar: AVATAR_IMAGES.new_character,
  description: '角色描述',
  image: CHARACTER_IMAGES.new_character,
  promote: '角色称号',
  tags: ['标签1', '标签2'],
  greeting: '问候语',
  accompanyDays: 0,
  silhouette: SILHOUETTE_IMAGES.new_character,
}
```

### 2. 修改动画参数

在 `config/characters.ts` 中调整 `ANIMATION_CONFIG`：

```typescript
export const ANIMATION_CONFIG = {
  BORDER_ROTATION_DURATION: 3000,  // 边框旋转周期
  PULSE_DURATION: 2000,            // 脉冲动画周期
  PARALLAX_DURATION: 8000,         // 视差动画周期
} as const;
```

### 3. 自定义UI样式

修改 `UI_CONFIG` 中的参数来调整界面布局：

```typescript
export const UI_CONFIG = {
  CARD_WIDTH_RATIO: 0.25,    // 增大卡片宽度
  CENTERED_SCALE: 1.5,       // 增强中央放大效果
} as const;
```

### 4. 扩展音频功能

在 `components/AudioService.ts` 中添加新的音频方法：

```typescript
async playCharacterVoice(characterId: string, text: string) {
  // 实现角色语音播放
}
```

## 技术栈

- **React Native** - 跨平台移动应用框架
- **Expo** - 快速开发和部署工具
- **React Native Reanimated** - 高性能动画库
- **Expo Linear Gradient** - 渐变效果
- **Expo Haptics** - 触觉反馈
- **Expo Router** - 路由导航
- **TypeScript** - 类型安全的JavaScript

## 性能优化

### 1. 动画优化
- 使用 `React.memo` 优化组件渲染
- 使用 `useSharedValue` 避免JS桥接开销
- 合理设置 `scrollEventThrottle` 参数

### 2. 图片优化
- 使用适当的图片尺寸和格式
- 考虑使用图片缓存库
- 预加载关键图片资源

### 3. 内存管理
- 及时清理动画监听器
- 使用 `useFocusEffect` 管理页面生命周期
- 避免内存泄漏

## 常见问题

### Q: 如何替换示例图片？
A: 将图片文件放在 `assets/images/` 目录下，然后在 `config/characters.ts` 中更新对应的图片引用。

### Q: 如何调整动画速度？
A: 修改 `config/characters.ts` 中的 `ANIMATION_CONFIG` 常量。

### Q: 如何添加新的交互按钮？
A: 在 `app/dialogue.tsx` 的交互按钮组中添加新的按钮组件。

### Q: 如何实现角色语音功能？
A: 集成TTS服务或使用预录音频文件，在 `AudioService.ts` 中实现播放逻辑。

## 部署说明

### 开发环境运行
```bash
npm install
npm start
```

### 构建发布版本
```bash
# iOS
npm run ios

# Android  
npm run android

# Web
npm run web
```

## 更新日志

### v1.0.0 (当前版本)
- ✅ 完成角色选择页面滑动效果优化
- ✅ 实现恋与制作人风格对话框UI
- ✅ 添加多层动画效果和视差背景
- ✅ 完善代码结构和注释
- ✅ 创建配置化的角色数据管理

## 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**注意**: 这是一个示例项目，用于展示恋与制作人风格的UI设计和动画效果。在实际商业使用中，请确保遵守相关的版权和商标法律。
