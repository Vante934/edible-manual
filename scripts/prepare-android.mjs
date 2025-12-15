import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, rm, cp, access } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const ANDROID_DIR = path.join(ROOT, 'android');
const WEBAPP_DIR = path.join(ANDROID_DIR, 'app', 'src', 'main', 'assets', 'webapp');
const WRAPPER_JAR = path.join(ANDROID_DIR, 'gradle', 'wrapper', 'gradle-wrapper.jar');
const WRAPPER_URL = 'https://raw.githubusercontent.com/gradle/gradle/v8.10.2/gradle/wrapper/gradle-wrapper.jar';

async function ensureWrapperJar() {
  try {
    await access(WRAPPER_JAR);
    return;
  } catch {
    // continue with download
  }

  await mkdir(path.dirname(WRAPPER_JAR), { recursive: true });
  console.log('[android] gradle-wrapper.jar missing, attempting to download...');
  try {
    await downloadFile(WRAPPER_URL, WRAPPER_JAR);
  } catch (error) {
    console.warn('[android] Failed to download gradle-wrapper.jar:', error.message);
    console.warn('[android] This is OK - Android Studio will download it automatically during Gradle sync.');
  }
}

async function downloadFile(url, destination) {
  await new Promise((resolve, reject) => {
    const request = https.get(url, response => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }
      const fileStream = createWriteStream(destination);
      pipeline(response, fileStream).then(resolve).catch(reject);
    });
    request.on('error', reject);
  });
}

async function copyWebBundle() {
  await mkdir(WEBAPP_DIR, { recursive: true });
  console.log('[android] clearing old bundle...');
  await rm(WEBAPP_DIR, { recursive: true, force: true });
  await mkdir(WEBAPP_DIR, { recursive: true });
  console.log('[android] copying dist -> assets/webapp');
  await cp(DIST_DIR, WEBAPP_DIR, { recursive: true });
}

function buildWebApp() {
  console.log('[android] running vite build...');
  execSync('npx vite build', { stdio: 'inherit', cwd: ROOT });
}

async function run() {
  buildWebApp();
  await ensureWrapperJar();
  await copyWebBundle();
  console.log('[android] bundle ready. Open ./android in Android Studio to build APK.');
}

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});


