<div align="center">

# 🍳 食用手册

### AI 烹饪 Agent · 从食材到上桌，一步步教你做好饭

**⚛️ React 19** &nbsp;|&nbsp; **📘 TypeScript 5.8** &nbsp;|&nbsp; **⚡ Vite 6** &nbsp;|&nbsp; **🤖 Google Gemini** &nbsp;|&nbsp; **📱 Android** &nbsp;|&nbsp; **▲ Vercel** &nbsp;|&nbsp; **📄 MIT License**

[在线体验](https://edible-manual.vercel.app) · [Android 下载](https://github.com/Vante934/edible-manual/releases) · [功能特性](#-核心功能) · [报告问题](https://github.com/Vante934/edible-manual/issues)

</div>

---

## 📖 项目简介

> "打开冰箱不知道做什么？食材买了又浪费？新手下厨无从下手？"

**食用手册** 是一款面向厨房新手的 **AI 烹饪 Agent** 应用。
不同于传统菜谱 App 的被动查询，食用手册通过 **向导式选择 + 分步烹饪引导**，
像一个耐心的朋友一样，从"有什么食材"到"做好上桌"全程陪伴。

四步选食材（蔬菜 → 肉类 → 主食 → 厨具），AI 智能推荐菜品，选定后一步步教你做，
新手也能轻松做出一桌好菜。

---

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 🧙 **向导式选菜** | 四步选择食材，简单直观，零门槛上手 |
| 🤖 **AI 智能推荐** | 根据你有的食材，AI 推荐最适合的菜品 |
| 📝 **分步烹饪引导** | 选定菜品后一步步教学，带进度条，不会手忙脚乱 |
| 📚 **本地菜谱库** | 内置丰富菜谱数据，离线也能看 |
| ❤️ **收藏夹** | 收藏喜欢的菜谱，下次快速找到 |
| 👤 **用户系统** | 登录注册，保存你的烹饪记录 |
| 📊 **烹饪成长** | 记录每一次下厨，见证从新手到大厨 |
| 📱 **多端支持** | Web + Android App，随时随地学做饭 |

---

## 🎯 四步向导流程

```
第 1 步：选蔬菜       第 2 步：选肉类       第 3 步：选主食       第 4 步：选厨具
    🥬🥦🥕            🥩🍗🐟            🍚🍜🍞            🍳🔥🥘
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                                           │
                                           ▼
                                    🤖 AI 智能推荐
                                           │
                                           ▼
                                    📖 菜谱结果页
                                           │
                                           ▼
                                    👨‍🍳 分步烹饪引导
```

---

## 📱 界面预览

> 💡 界面截图待补充，可将截图放入 `docs/screenshots/` 目录后更新此处

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                            │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │   Web 端 (PWA)  │      │  Android App    │          │
│  │  (React + Vite) │      │ (WebView + 原生) │          │
│  └────────┬────────┘      └────────┬────────┘          │
└───────────┼─────────────────────────┼───────────────────┘
            │                         │
            └──────────┬──────────────┘
                       │ HTTPS / REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     AI 服务层                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Google Gemini AI                      │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │   │ 菜谱推荐  │  │ 步骤生成  │  │ 口味调整  │       │  │
│  │   └──────────┘  └──────────┘  └──────────┘       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    数据存储层                             │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │  LocalStorage   │  │   菜谱数据库     │               │
│  │  (用户/收藏)    │  │  (DISH_DATABASE)│               │
│  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### Web 端开发

```bash
# 克隆项目
git clone https://github.com/Vante934/edible-manual.git
cd edible-manual

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问 `http://localhost:5173` 即可查看效果。

### Android 构建

```bash
# 准备 Android 项目
npm run android:prepare

# 构建 Debug 版本
npm run android:assembleDebug

# 构建 Release 版本（AAB）
npm run android:bundleRelease
```

构建产物位于 `android/app/build/outputs/` 目录下。

### 生产构建

```bash
# 构建 Web 版本
npm run build

# 预览构建结果
npm run preview
```

---

## 📁 项目结构

```
edible-manual/
├── src/                     # Web 端源代码
│   ├── components/          # 可复用组件
│   ├── screens/             # 页面组件
│   │   ├── AuthScreens.tsx  # 登录/注册页
│   │   ├── WizardScreen.tsx # 向导选择页
│   │   └── TabScreens.tsx   # 底部 Tab 页
│   ├── services/            # 服务层
│   │   └── dishDatabase.ts  # 菜谱数据库
│   ├── types.ts             # TypeScript 类型定义
│   ├── App.tsx              # 根组件
│   └── index.tsx            # 入口文件
├── android/                 # Android 项目
│   ├── app/
│   ├── build.gradle
│   └── gradlew.bat
├── components/              # 共享组件
├── screens/                 # 共享页面
├── services/                # 共享服务
├── scripts/                 # 构建脚本
│   └── prepare-android.mjs  # Android 准备脚本
├── public/                  # 静态资源
├── types.ts                 # 共享类型定义
├── App.tsx                  # 共享根组件
├── index.html               # HTML 入口
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目说明
```

---

## 🛠️ 技术栈

**前端框架：**
- ⚛️ React 19 - UI 框架
- 📘 TypeScript 5.8 - 类型安全
- ⚡ Vite 6 - 构建工具

**UI & 图标：**
- 🎨 TailwindCSS - 样式框架
- 🎯 Lucide React - 图标库

**AI 能力：**
- 🤖 Google Gemini AI - 大语言模型
- 📦 @google/genai - Gemini SDK

**移动端：**
- 📱 Android WebView - 混合开发
- ⚙️ Gradle - Android 构建

**部署：**
- ▲ Vercel - Web 部署平台

---

## 🧩 核心模块说明

### 🧙 向导式交互

四步式引导流程，降低使用门槛：
1. **选择蔬菜** - 冰箱里有什么菜？
2. **选择肉类** - 有什么肉？
3. **选择主食** - 想吃米饭、面条还是馒头？
4. **选择厨具** - 有什么锅具？
→ AI 根据你的选择智能推荐菜品

### 📚 菜谱数据库 (DISH_DATABASE)

内置丰富的本地菜谱数据，包含：
- 菜品名称与菜系
- 所需食材清单
- 烹饪步骤详解
- 难度与时长预估

### 📖 分步烹饪引导

选定菜品后进入分步教学模式：
- 步骤清晰，一条一步不慌乱
- 进度条显示当前进度
- 每步有详细说明和注意事项
- 支持随时返回上一步

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## ❓ 常见问题

**Q: 需要付费吗？**
A: 食用手册本身完全免费，但使用 AI 推荐功能需要你自己的 Google Gemini API Key。基础菜谱浏览免费。

**Q: 支持离线使用吗？**
A: 本地菜谱库支持离线浏览，AI 推荐功能需要联网。

**Q: 数据安全吗？**
A: 所有用户数据都存储在本地设备上，不会上传到任何服务器。

---

<div align="center">

**如果这个项目对你有帮助，欢迎给个 ⭐ Star 支持一下！**

Made with ❤️ for every home cook

</div>
