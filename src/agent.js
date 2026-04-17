// src/agent.js - 烹饪Agent核心引擎

const API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// ============ 记忆系统 ============
class CookingMemory {
  constructor() {
    this.load();
  }

  load() {
    const saved = localStorage.getItem('cooking_memory');
    if (saved) {
      const data = JSON.parse(saved);
      this.userProfile = data.userProfile;
      this.cookingHistory = data.cookingHistory;
      this.preferences = data.preferences;
    } else {
      this.userProfile = {
        skillLevel: 'beginner',
        availableTools: [],
        commonIngredients: [],
      };
      this.cookingHistory = [];
      this.preferences = {
        spicy: null,
        sweet: null,
        dietaryRestrictions: [],
        cookingTime: null,
      };
    }
  }

  save() {
    localStorage.setItem('cooking_memory', JSON.stringify({
      userProfile: this.userProfile,
      cookingHistory: this.cookingHistory,
      preferences: this.preferences,
    }));
  }

  addCookingRecord(dish, rating, notes) {
    this.cookingHistory.push({
      dish,
      rating,
      notes,
      timestamp: Date.now(),
    });
    if (this.cookingHistory.length >= 10) this.userProfile.skillLevel = 'intermediate';
    if (this.cookingHistory.length >= 30) this.userProfile.skillLevel = 'advanced';
    this.save();
  }

  updateTools(tools) {
    this.userProfile.availableTools = tools;
    this.save();
  }

  updatePreferences(prefs) {
    Object.assign(this.preferences, prefs);
    this.save();
  }

  getContext() {
    const recentDishes = this.cookingHistory.slice(-5).map(h =>
      `${h.dish}(评分:${h.rating}/5)`
    ).join('、');

    return `
【用户画像】
- 厨艺水平: ${this.userProfile.skillLevel === 'beginner' ? '新手' : this.userProfile.skillLevel === 'intermediate' ? '进阶' : '高手'}
- 常用厨具: ${this.userProfile.availableTools.join('、') || '未知'}
- 累计做过: ${this.cookingHistory.length} 道菜
- 最近做过: ${recentDishes || '暂无记录'}
- 口味偏好: ${this.preferences.spicy !== null ? (this.preferences.spicy ? '能吃辣' : '不吃辣') : '未知'}, ${this.preferences.sweet !== null ? (this.preferences.sweet ? '喜甜' : '不喜甜') : '未知'}
- 忌口: ${this.preferences.dietaryRestrictions.join('、') || '无'}
- 偏好烹饪时长: ${this.preferences.cookingTime || '未知'}
    `.trim();
  }
}

// ============ Agent状态机 ============
const AGENT_STATES = {
  IDLE: 'idle',
  COLLECTING_INFO: 'collecting',
  RECOMMENDING: 'recommending',
  COOKING_GUIDE: 'cooking_guide',
  REVIEWING: 'reviewing',
};

class CookingAgent {
  constructor() {
    this.memory = new CookingMemory();
    this.state = AGENT_STATES.IDLE;
    this.currentRecipe = null;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.messages = [];
    this.initialized = false;
    this.initChat();
  }

  initChat() {
    const systemPrompt = `你是「食用手册」的AI烹饪助手，名叫"小食"。你是一个温暖、耐心、专业的烹饪Agent。

${this.memory.getContext()}

【你的核心能力】
1. 🔍 食材分析：根据用户描述的食材，分析可以做什么菜
2. 🍳 菜品推荐：推荐2-3道适合用户水平的菜品，附带难度、时间、所需厨具
3. 📝 分步教学：选定菜品后，一步一步引导用户完成烹饪
4. 🆘 实时答疑：烹饪过程中回答任何问题
5. 📊 成长记录：记住用户做过的菜和评价

【交互规则】
- 说话风格：像朋友一样自然聊天，适当用emoji，简洁不啰嗦
- 当用户说出食材时，先确认理解是否正确，再推荐
- 推荐菜品时用这个格式：
  🥘 **菜名** | ⏱️ 时间 | 📊 难度(⭐) | 🔧 需要的厨具
  简短描述（一句话）
- 进入分步教学时：
  - 每次只说一个步骤
  - 必须用 "【第X步/共Y步】" 开头（例如：【第2步/共5步】）
  - 说完等用户确认（"好了"/"下一步"/"继续"）
  - 如果用户说遇到问题，立即帮忙排查
- 当用户说"开始做XXX"、"教我做XXX"、"做XXX"、"我想做XXX"等表达想做某道菜时，回复中必须包含标记 [COOKING_START:菜名]
- 当最后一步完成时，包含标记 [COOKING_DONE]

【推荐多样化规则】
- 每次推荐的菜品必须多样化，覆盖不同菜系（川菜、粤菜、家常菜、西式、日式等）
- 每次推荐必须包含不同烹饪方式（炒、蒸、煮、烤、凉拌等）
- 如果用户要求"换一个"，必须推荐完全不同的菜品，不能重复之前推荐过的
- 推荐时考虑难度梯度：一道简单 + 一道中等 + 一道稍有挑战

【主动能力】
- 如果用户是新手且选了难度高的菜，温柔地建议替代方案
- 如果发现用户缺少某个厨具，主动提供替代方法
- 根据用户历史推荐新菜时，会说"你上次做的XX很成功，要不要试试进阶版？"`;

    this.messages = [
      { role: 'system', content: systemPrompt }
    ];
    this.recommendedDishes = [];
    this.initialized = true;
  }

  async sendMessage(userInput) {
    if (!this.initialized) {
      return {
        text: '😅 系统正在初始化，请稍后再试...',
        state: this.state,
        error: true,
      };
    }

    if (!API_KEY) {
      return {
        text: '❌ 未配置智谱AI API Key，请在 .env 文件中设置 VITE_ZHIPU_API_KEY',
        state: this.state,
        error: true,
      };
    }

    try {
      let enhancedInput = userInput;
      if (this.state === AGENT_STATES.COOKING_GUIDE) {
        enhancedInput = `[当前正在烹饪引导模式，正在做: ${this.currentRecipe}，当前进度: 第${this.currentStep}步] 用户说: ${userInput}`;
      }

      const isAskingForFood = /做什么|推荐|吃什么|能做|换一|重新/.test(userInput);
      if (isAskingForFood && this.recommendedDishes && this.recommendedDishes.length > 0) {
        enhancedInput += `\n\n[系统提示：以下菜品已经推荐过，请勿重复推荐：${this.recommendedDishes.join('、')}]`;
      }

      this.messages.push({ role: 'user', content: enhancedInput });

      const response = await fetch(ZHIPU_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: this.messages,
          temperature: 0.8,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        this.messages.pop();
        return {
          text: `😅 API调用失败: ${errorData.error?.message || response.statusText}`,
          state: this.state,
          error: true,
        };
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      this.messages.push({ role: 'assistant', content: text });

      this.parseAgentResponse(text);
      this.extractAndStoreDishes(text);

      return {
        text: this.cleanResponse(text),
        state: this.state,
        currentStep: this.currentStep,
        totalSteps: this.totalSteps,
        currentRecipe: this.currentRecipe,
      };
    } catch (error) {
      console.error('Agent error:', error);
      return {
        text: '😅 抱歉，网络出了点问题...请检查网络连接',
        state: this.state,
        error: true,
      };
    }
  }

  extractAndStoreDishes(text) {
    if (!this.recommendedDishes) {
      this.recommendedDishes = [];
    }

    const patterns = [
      /🥘\s*\*\*(.+?)\*\*/g,
      /[1-9][.、]\s*\*\*(.+?)\*\*/g,
      /[1-9][.、]\s*(.{2,8}?)\s*[|｜]/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dish = match[1].trim().replace(/[*]/g, '');
        if (dish && dish.length >= 2 && dish.length <= 10 && !this.recommendedDishes.includes(dish)) {
          this.recommendedDishes.push(dish);
        }
      }
    });

    if (this.recommendedDishes.length > 30) {
      this.recommendedDishes = this.recommendedDishes.slice(-30);
    }
  }

  async sendImageMessage(base64Image, mimeType, customPrompt) {
    if (!this.initialized) {
      return {
        text: '😅 系统正在初始化，请稍后再试...',
        state: this.state,
        error: true,
      };
    }

    if (!API_KEY) {
      return {
        text: '❌ 未配置智谱AI API Key',
        state: this.state,
        error: true,
      };
    }

    try {
      const prompt = customPrompt || '请识别这张图片中的食材，告诉我有什么，以及可以做什么菜。';
      
      const imageMessage = {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: base64Image
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      };

      this.messages.push(imageMessage);

      const response = await fetch(ZHIPU_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'glm-4v',
          messages: this.messages,
          temperature: 0.8,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        this.messages.pop();
        return {
          text: `😅 图片识别失败: ${errorData.error?.message || response.statusText}`,
          state: this.state,
          error: true,
        };
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      this.messages.push({ role: 'assistant', content: text });

      this.parseAgentResponse(text);

      return {
        text: this.cleanResponse(text),
        state: this.state,
        currentStep: this.currentStep,
        totalSteps: this.totalSteps,
        currentRecipe: this.currentRecipe,
      };
    } catch (error) {
      console.error('Image recognition error:', error);
      return {
        text: '😅 图片识别出错，请重试',
        state: this.state,
        error: true,
      };
    }
  }

  parseAgentResponse(response) {
    const cookingStartMatch = response.match(/\[COOKING_START:(.+?)\]/);
    if (cookingStartMatch) {
      this.state = AGENT_STATES.COOKING_GUIDE;
      this.currentRecipe = cookingStartMatch[1];
      this.currentStep = 1;
      this.totalSteps = 5;
      console.log('🍳 Cooking started:', this.currentRecipe);
    }

    const totalMatch = response.match(/(?:共|一共|分)\s*(\d+)\s*(?:步|个步骤)/);
    if (totalMatch && this.state === AGENT_STATES.COOKING_GUIDE) {
      this.totalSteps = parseInt(totalMatch[1]);
      console.log('📏 Total steps:', this.totalSteps);
    }

    const stepPatterns = [
      /【第\s*(\d+)\s*步\s*[\/／]\s*(?:共\s*)?(\d+)\s*步?】/,
      /第\s*(\d+)\s*步\s*[\/／]\s*(?:共\s*)?(\d+)\s*步/,
      /【第\s*(\d+)\s*步】/,
      /第\s*(\d+)\s*步[：:]/,
      /步骤\s*(\d+)/,
      /Step\s*(\d+)/i,
    ];

    for (const pattern of stepPatterns) {
      const match = response.match(pattern);
      if (match) {
        this.currentStep = parseInt(match[1]);
        if (match[2]) {
          this.totalSteps = parseInt(match[2]);
        }
        if (this.state !== AGENT_STATES.COOKING_GUIDE) {
          this.state = AGENT_STATES.COOKING_GUIDE;
        }
        console.log('📍 Step:', this.currentStep, '/', this.totalSteps);
        break;
      }
    }

    if (response.includes('[COOKING_DONE]')) {
      this.state = AGENT_STATES.REVIEWING;
      console.log('✅ Cooking done!');
    }

    const doneKeywords = ['大功告成', '完成啦', '完成了', '出锅', '开吃', '上桌', '享用', '做好了', '恭喜'];
    const isDone = doneKeywords.some(keyword => response.includes(keyword));
    if (isDone && this.state === AGENT_STATES.COOKING_GUIDE) {
      if (this.totalSteps === 0 || this.currentStep >= this.totalSteps - 1) {
        this.currentStep = this.totalSteps;
        this.state = AGENT_STATES.REVIEWING;
        console.log('✅ Cooking done (keyword detected)!');
      }
    }
  }

  cleanResponse(response) {
    return response
      .replace(/\[COOKING_START:.+?\]/g, '')
      .replace(/\[STEP:\d+\/\d+\]/g, '')
      .replace(/【第\s*\d+\s*步\s*[\/／]\s*(?:共\s*)?\d+\s*步?】/g, '')
      .replace(/【第\s*\d+\s*步】/g, '')
      .replace(/\[COOKING_DONE\]/g, '')
      .trim();
  }

  finishCooking(rating, notes = '') {
    if (this.currentRecipe) {
      this.memory.addCookingRecord(this.currentRecipe, rating, notes);
    }
    this.state = AGENT_STATES.IDLE;
    this.currentRecipe = null;
    this.currentStep = 0;
  }

  getStats() {
    const history = this.memory.cookingHistory;
    if (history.length === 0) return null;

    const avgRating = (history.reduce((sum, h) => sum + h.rating, 0) / history.length).toFixed(1);
    const dishCount = new Set(history.map(h => h.dish)).size;

    return {
      totalCooks: history.length,
      uniqueDishes: dishCount,
      avgRating,
      skillLevel: this.memory.userProfile.skillLevel,
      recentDishes: history.slice(-5).reverse(),
    };
  }

  resetConversation() {
    this.state = AGENT_STATES.IDLE;
    this.currentRecipe = null;
    this.currentStep = 0;
    this.initChat();
  }
}

export { CookingAgent, CookingMemory, AGENT_STATES };
