<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ISmCZK0I_5NhebAmSrpMo0sq5hTXq4Ru

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

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
