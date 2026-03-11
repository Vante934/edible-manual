
本目录包含在本地运行应用所需的全部文件。

在 AI Studio 中查看你的应用：https://ai.studio/apps/drive/1ISmCZK0I_5NhebAmSrpMo0sq5hTXq4Ru

本地运行

前置条件：已安装 Node.js
安装依赖项：npm install
在 .env.local 文件中，将 GEMINI_API_KEY 配置为你的 Gemini API 密钥
运行应用：npm run dev

## 打包并运行 Android 应用

1. **准备 Web 资源**  
   - 先运行 `npm install`（若尚未执行）；  
   - 执行 `npm run android:prepare`，该脚本会构建 Vite 项目并把 `dist/` 拷贝到 `android/app/src/main/assets/webapp/`，同时确保 Gradle Wrapper 准备完毕。
2. **打开 Android Studio**  
   - 在 Android Studio 中选择 `Open`，指向 `android/` 目录；  
   - 等待 Gradle Sync 完成（需联网以下载 SDK 依赖）。
3. **运行或打包**  
   - 连接模拟器/真机，点击 ▶️ 运行即可看到与网页一致的界面；  
   - 也可以执行 `npm run android:assembleDebug` 或 `npm run android:bundleRelease` 生成 APK/AAB。

> WebUI 保持原样封装到 WebView 中，功能、样式均与网页版本一致。若需自定义应用图标、包名或开启离线缓存，可继续在 `android/` 工程内按常规 Android 流程调整。
