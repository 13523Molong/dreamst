# Dreamst 应用介绍

## 功能概述
Dreamst 是一个基于 React Native 开发的聊天应用，主要功能包括：
- 角色选择：从多个预设角色中选择对话对象
- 模拟对话：与选定角色进行文本聊天
- 响应式界面：适配不同屏幕尺寸和设备类型

## 页面介绍

### 1. 主页 (HomeScreen)
- 以网格形式展示多个角色卡片
- 每个角色卡片包含：
  - 角色头像
  - 角色名称
  - 角色简短描述
- 点击角色卡片进入聊天界面

### 2. 聊天页 (ChatScreen)
- 顶部显示当前角色名称
- 中部显示聊天消息列表，包括：
  - 角色欢迎消息
  - 用户发送的消息
  - 角色回复的消息
- 底部为消息输入框和发送按钮
- 支持键盘自适应，避免遮挡输入框

## 技术栈
- React Native 0.80.2
- TypeScript 5.0.4
- React Navigation 7.x
- React 19.1.0

## 运行项目
```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行Android应用
npm run android

# 运行iOS应用
npm run ios
```

## 项目结构
```
dreamst/
├── src/
│   ├── screens/       # 页面组件
│   │   ├── HomeScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── components/    # 可复用组件
│   │   └── ChatBubble.tsx
│   ├── types/         # 类型定义
│   │   └── role.ts
│   └── assets/        # 静态资源
│       └── index.ts
├── App.tsx           # 应用入口
└── package.json      # 项目配置
```