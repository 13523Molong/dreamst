# Gu - 智能角色对话应用 🎭

一个基于 React Native 和 Expo 开发的智能角色对话应用，提供沉浸式的角色互动体验。

## 📱 应用特性

### 🎯 核心功能
- **角色选择系统**: 提供多种预设角色（探索者、学者、艺术家等）
- **智能对话界面**: 流畅的动画过渡和沉浸式对话体验
- **音频服务**: 背景音乐播放和角色语音合成
- **硬件集成**: 支持外部硬件设备连接（控制器、传感器等）
- **触觉反馈**: 增强用户交互体验

### 🎨 用户体验
- **流畅动画**: 使用 React Native Reanimated 实现丝滑的界面动画
- **共享元素过渡**: 角色卡片到对话界面的无缝过渡
- **响应式设计**: 适配不同屏幕尺寸和设备
- **现代化UI**: 简洁美观的用户界面设计

## 🛠️ 技术栈

### 前端框架
- **React Native** (0.79.5) - 跨平台移动应用开发
- **Expo** (53.0.20) - React Native 开发平台
- **TypeScript** (5.8.3) - 类型安全的 JavaScript

### 核心库
- **Expo Router** (5.1.4) - 文件系统路由
- **React Navigation** (7.x) - 导航管理
- **React Native Reanimated** (3.17.4) - 高性能动画
- **Expo AV** (15.1.7) - 音频和视频处理
- **Expo Haptics** (14.1.4) - 触觉反馈

### 开发工具
- **ESLint** (9.25.0) - 代码质量检查
- **Babel** (7.25.2) - JavaScript 编译器

## 📦 安装指南

### 环境要求
- Node.js (推荐 18.x 或更高版本)
- npm 或 yarn
- Expo CLI
- iOS Simulator (macOS) 或 Android Studio (Android)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Gu
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npx expo start
   ```

4. **运行应用**
   - 在 iOS 模拟器中运行: `npm run ios`
   - 在 Android 模拟器中运行: `npm run android`
   - 在 Web 浏览器中运行: `npm run web`
   - 使用 Expo Go 应用扫描二维码

## 🚀 使用说明

### 角色选择
1. 打开应用，浏览可用的角色列表
2. 使用搜索功能快速找到特定角色
3. 点击角色卡片进入对话界面

### 对话体验
1. 进入对话界面后，系统会自动播放角色问候语
2. 享受流畅的动画过渡效果
3. 体验触觉反馈和音频效果

### 硬件连接
- 应用支持连接外部硬件设备
- 自动检测可用设备
- 实时显示设备状态和电池电量

## 📁 项目结构

```
Gu/
├── app/                    # 应用页面 (Expo Router)
│   ├── _layout.tsx        # 根布局组件
│   ├── index.tsx          # 角色选择页面
│   └── dialogue.tsx       # 对话界面
├── components/            # 可复用组件
│   ├── AudioService.ts    # 音频服务
│   └── HardwareService.ts # 硬件服务
├── assets/               # 静态资源
│   ├── images/          # 图片资源
│   └── fonts/           # 字体文件
├── types/               # TypeScript 类型定义
└── package.json         # 项目配置
```

## 🔧 开发指南

### 添加新角色
在 `app/index.tsx` 中的 `roles` 数组中添加新角色：

```typescript
{
  id: 'unique-id',
  name: '角色名称',
  avatar: '头像URL',
  description: '角色描述',
  image: { uri: '角色图片URL' },
  promote: '角色标签',
  tags: ['标签1', '标签2'],
  greeting: '问候语',
  accompanyDays: 0
}
```

### 自定义音频
1. 在 `assets/audio/` 目录添加音频文件
2. 在 `AudioService.ts` 中配置音频路径
3. 调用相应的播放方法

### 硬件集成
1. 在 `HardwareService.ts` 中添加硬件检测逻辑
2. 实现设备连接和断开功能
3. 处理硬件事件和数据

## 📱 平台支持

- ✅ iOS (iPhone & iPad)
- ✅ Android
- ✅ Web (实验性支持)

## 🔄 可用脚本

```bash
npm start          # 启动开发服务器
npm run android    # 在 Android 模拟器中运行
npm run ios        # 在 iOS 模拟器中运行
npm run web        # 在 Web 浏览器中运行
npm run lint       # 运行代码检查
npm run reset-project  # 重置项目到初始状态
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 常见问题

### Q: 如何添加自定义音频文件？
A: 将音频文件放入 `assets/audio/` 目录，然后在 `AudioService.ts` 中引用。

### Q: 如何连接外部硬件设备？
A: 在 `HardwareService.ts` 中实现相应的硬件连接逻辑，支持蓝牙、USB 等连接方式。

### Q: 如何自定义角色动画？
A: 在 `app/dialogue.tsx` 中修改 `useAnimatedStyle` 和动画参数。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 参与社区讨论

---

**享受与智能角色的对话体验！** 🎭✨
