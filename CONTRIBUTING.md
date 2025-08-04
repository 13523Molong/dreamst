# 贡献指南

感谢您对 Gu 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🎨 优化用户界面
- 🌍 翻译和本地化

## 📋 贡献前准备

### 环境要求
- Node.js (推荐 18.x 或更高版本)
- npm 或 yarn
- Git
- Expo CLI
- iOS Simulator (macOS) 或 Android Studio (Android)

### 开发环境设置

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 项目
   # 然后克隆您的 Fork
   git clone https://github.com/YOUR_USERNAME/Gu.git
   cd Gu
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```

4. **运行测试**
   ```bash
   npm run lint
   ```

## 🔧 开发流程

### 1. 创建分支

```bash
# 确保您在主分支上
git checkout main
git pull origin main

# 创建新分支
git checkout -b feature/your-feature-name
# 或者
git checkout -b fix/your-bug-fix
```

### 2. 开发规范

#### 代码风格
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 保持代码简洁和可读性

#### 提交信息规范
我们使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/) 规范：

```bash
# 格式
<类型>[可选的作用域]: <描述>

# 示例
feat: 添加新的角色选择功能
fix(audio): 修复音频播放问题
docs: 更新 README 文档
style: 优化按钮样式
refactor: 重构硬件服务代码
test: 添加单元测试
chore: 更新依赖包
```

#### 类型说明
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. 测试您的更改

```bash
# 运行代码检查
npm run lint

# 运行类型检查
npx tsc --noEmit

# 在模拟器中测试
npm run ios
# 或
npm run android
```

### 4. 提交更改

```bash
# 添加更改的文件
git add .

# 提交更改
git commit -m "feat: 添加新功能描述"

# 推送到您的 Fork
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写 PR 模板
3. 等待代码审查
4. 根据反馈进行修改

## 📝 Pull Request 模板

### 功能描述
简要描述您的更改和解决的问题。

### 更改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 样式优化
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试相关

### 测试
- [ ] 在 iOS 模拟器中测试
- [ ] 在 Android 模拟器中测试
- [ ] 在 Web 浏览器中测试
- [ ] 运行代码检查
- [ ] 运行类型检查

### 截图 (如果适用)
如果您的更改涉及 UI，请提供截图。

### 检查清单
- [ ] 我的代码遵循项目的代码风格
- [ ] 我已经测试过我的更改
- [ ] 我已经更新了相关文档
- [ ] 我的更改不会破坏现有功能

## 🐛 报告 Bug

### Bug 报告模板

**描述**
清晰简洁地描述 Bug。

**重现步骤**
1. 打开应用
2. 点击某个按钮
3. 看到错误信息

**预期行为**
描述您期望发生的事情。

**实际行为**
描述实际发生的事情。

**环境信息**
- 操作系统: [例如: iOS 15.0, Android 12]
- 设备: [例如: iPhone 13, Samsung Galaxy S21]
- 应用版本: [例如: 1.0.0]

**截图**
如果适用，请提供截图。

**附加信息**
任何其他相关信息。

## 💡 功能建议

### 功能建议模板

**功能描述**
详细描述您想要的功能。

**使用场景**
描述这个功能的使用场景。

**实现建议**
如果您有实现建议，请提供。

**替代方案**
如果有替代方案，请说明。

## 🎨 设计贡献

如果您想贡献设计：

1. 确保设计符合项目的设计语言
2. 提供设计稿和说明
3. 考虑不同设备的适配
4. 关注用户体验和可访问性

## 🌍 翻译贡献

如果您想贡献翻译：

1. 在 `locales/` 目录下找到对应的语言文件
2. 翻译缺失的文本
3. 确保翻译准确且符合当地语言习惯
4. 测试翻译后的界面

## 📚 文档贡献

文档贡献包括：

- 更新 README.md
- 添加 API 文档
- 编写使用教程
- 翻译文档

## 🔍 代码审查

### 审查要点
- 代码质量和可读性
- 功能正确性
- 性能影响
- 安全性考虑
- 测试覆盖率

### 审查流程
1. 自动检查 (CI/CD)
2. 代码审查
3. 功能测试
4. 合并到主分支

## 🏆 贡献者

感谢所有为项目做出贡献的开发者！

### 如何成为贡献者
- 提交有效的 Pull Request
- 积极参与项目讨论
- 帮助其他贡献者
- 维护项目质量

## 📞 联系我们

如果您有任何问题或建议：

- 提交 Issue
- 参与项目讨论
- 发送邮件

## 📄 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

---

感谢您的贡献！🎉 