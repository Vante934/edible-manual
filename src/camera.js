// camera.js - 专业级拍照识别模块

class CameraRecognizer {
  constructor(sendImageApi) {
    this.sendImageApi = sendImageApi;
  }

  async compressImage(file, maxWidth = 1024) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async fileToBase64(file) {
    const compressed = await this.compressImage(file);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        resolve({
          base64,
          preview: e.target.result,
          mimeType: 'image/jpeg',
        });
      };
      reader.readAsDataURL(compressed);
    });
  }

  async recognize(file) {
    const { base64, preview, mimeType } = await this.fileToBase64(file);

    const prompt = `你是一个专业的食材识别助手。请分析这张图片，严格按照以下JSON格式返回结果（不要包含任何其他文字说明）：

\`\`\`json
{
  "识别食材": {
    "食材名": "数量"
  },
  "快速推荐": [
    {
      "菜名": "xxx",
      "时间": "xx分钟",
      "难度": "简单/中等/困难"
    }
  ],
  "温馨提示": "xxx"
}
\`\`\`

注意：
1. 识别食材部分列出图片中所有可见的食材及大概数量
2. 快速推荐基于识别到的食材推荐2道菜
3. 温馨提示如果发现食材有保鲜问题要友善提醒，没有问题可以给些烹饪小技巧
4. 必须严格返回JSON格式，不要有任何其他文字`;

    const result = await this.sendImageApi(base64, mimeType, prompt);

    return {
      preview,
      text: result,
    };
  }
}

export { CameraRecognizer };
