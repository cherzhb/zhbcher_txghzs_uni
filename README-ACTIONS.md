# 退休规划助手 - GitHub Actions 云端 APK 打包方案

## 📋 概述

本项目提供了三种在 GitHub Actions 中进行云端 APK 打包的方案：

1. **build-apk-capacitor.yml** ⭐ **推荐**
2. build-apk-cloud.yml
3. build-apk.yml（原有方案）

---

## 🚀 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Capacitor** | 完全云端、免费、自动化、无需本地环境 | H5包装，性能略低于原生 | ⭐⭐⭐⭐⭐ |
| 通用Cloud方案 | 理论可行 | 需要完整的DCloud SDK | ⭐⭐ |
| 原有方案 | 标准流程 | 需要HBuilderX环境 | ⭐⭐⭐ |

---

## 🎯 推荐方案：Capacitor

### 工作原理

```
uni-app 构建步骤
    ↓
H5 构建产物 (dist/build/h5)
    ↓
Capacitor 包装为原生应用
    ↓
GitHub Actions 编译生成 APK
    ↓
✓ 可直接安装的 APK 文件
```

### 使用步骤

#### 1. 自动触发（推荐）

只需推送到 `main` 分支即可自动构建：

```bash
git add .
git commit -m "feat: 更新应用功能"
git push origin main
```

#### 2. 手动触发

1. 进入 GitHub 仓库的 **Actions** 标签
2. 选择 **Build Android APK with Capacitor** 工作流
3. 点击 **Run workflow**
4. 可选：输入版本号（如 `1.0.1`）和发布说明

### 下载 APK

1. 等待构建完成（约 3-5 分钟）
2. 进入 Actions 页面的最新构建
3. 在 **Artifacts** 区域下载：
   - `txghzs-apk-vX.X.X` - APK 文件
   - `txghzs-build-info-vX.X.X` - 构建详情文档

---

## 📦 本地开发

如果你想在本地测试构建，可以运行：

```bash
# 安装依赖（如果还没安装）
npm install --legacy-peer-deps

# 构建 H5 版本
npm run build:h5

# 初始化 Capacitor（首次）
npx cap init

# 同步资源到 Android
npx cap sync android

# 在 Android Studio 打开（可选）
npx cap open android

# 构建 APK
cd android
./gradlew assembleDebug

# APK 文件位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔧 相关文件

### 已添加/修改的文件

```
zhbcher_txghzs_uni/
├── .github/workflows/
│   ├── build-apk.yml                   # 原有工作流
│   ├── build-apk-cloud.yml             # 通用方案
│   └── build-apk-capacitor.yml         # ⭐ 推荐方案（Capacitor）
├── capacitor.config.json               # Capacitor 配置文件（新增）
├── package.json                        # 已更新，添加了 Capacitor 依赖
└── README-ACTIONS.md                   # 本文档（新增）
```

### capacitor.config.json 说明

```json
{
  "appId": "uni.TXGHZS",        // 应用 ID
  "appName": "退休规划助手",      // 应用名称
  "webDir": "dist/build/h5",    // H5 构建产物目录
  "android": {
    "webContentsDebuggingEnabled": true  // 启用调试
  }
}
```

---

## ⚠️ 注意事项

### 关于 Capacitor 方案

1. **性能考虑**
   - 这是一个 H5 包装的原生应用
   - 性能略低于原生 APP，但差距不大
   - 适合大多数应用场景

2. **版本管理**
   - 每次构建会生成新的版本号（基于 Action Run Number）
   - 可以手动指定版本号

3. **首次构建**
   - 第一次构建可能需要更长时间（5-10 分钟）
   - 后续构建会快很多

### 如果构建失败

1. 查看 Actions 日志定位错误
2. 常见问题：
   - Node.js 版本兼容性
   - Android SDK 安装问题
   - 网络问题（依赖下载）

---

## 📱 安装 APK

1. 从 GitHub Actions 下载 APK 文件
2. 在 Android 设备上：
   - 进入 **设置** → **安全** → **允许未知来源**
   - 点击 APK 文件安装

---

## 🔄 其他方案

### 方案 B：使用自托管 Runner

如果你有本地服务器，可以：

1. 配置 GitHub 自托管 Runner
2. 在服务器上安装 HBuilderX 和 Android SDK
3. 使用完全的原生打包流程

### 方案 C：迁移到原生框架

如果需要最佳性能，可以考虑：

1. **Flutter** - Google 跨平台框架，性能一流
2. **React Native** - Meta 跨平台框架，生态丰富
3. **uni-app 原生** - 使用离线 SDK

---

## 💡 常见问题

### Q: 为什么不用 DCloud 云打包？
**A:** DCloud 云打包现在需要付费，而 GitHub Actions 免费且自动化。

### Q: Capacitor 和原生打包有什么区别？
**A:**
- 原生打包：使用 uni-app 的原生渲染，性能最优
- Capacitor：H5 嵌套在 WebView 中，性能略低但差异不大

### Q: 可以生成签名版 APK 吗？
**A:** 可以，但需要在 GitHub Secrets 中存储签名文件，并修改工作流配置。

---

## 🤝 技术支持

如果有问题，请：
1. 查看 GitHub Actions 构建日志
2. 在 Slack 或 GitHub Issues 提问

---

**版本**: 1.0.0
**更新时间**: 2026-02-22
