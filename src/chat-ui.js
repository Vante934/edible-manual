// chat-ui.js - 专业级烹饪助手UI

import { CookingAgent, AGENT_STATES } from './agent.js';
import { VoiceAssistant } from './voice.js';
import { CameraRecognizer } from './camera.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM 元素获取 ---
  const fab = document.getElementById('agent-fab');
  const panel = document.getElementById('agent-panel');
  const closeBtn = document.getElementById('agent-close-btn');
  const messagesContainer = document.getElementById('agent-messages');
  const input = document.getElementById('agent-input');
  const sendBtn = document.getElementById('agent-send-btn');
  const cameraBtn = document.getElementById('agent-camera-btn');
  const voiceBtn = document.getElementById('agent-voice-btn');
  
  const progressContainer = document.getElementById('agent-progress-container');
  const progressFill = document.getElementById('agent-progress-fill');
  
  let lastUserMessage = '';
  let recommendedDishes = [];
  
  const ratingModal = document.getElementById('agent-rating-modal');
  const stars = document.querySelectorAll('.chat-agent__star');
  const submitRatingBtn = document.getElementById('agent-submit-rating');
  
  const statsBtn = document.getElementById('agent-stats-btn');
  const statsModal = document.getElementById('agent-stats-modal');
  const closeStatsBtn = document.getElementById('agent-close-stats');
  const statsList = document.getElementById('agent-stats-list');

  // --- Agent 实例 ---
  const agent = new CookingAgent();
  let currentRating = 0;
  let isSending = false;
  let isFirstOpen = true;

  // --- 1. 启动动画 ---
  fab.addEventListener('animationend', () => {
    fab.classList.add('chat-agent__fab--ready');
  });

  // --- 2. 打开/关闭面板 ---
  fab.addEventListener('click', () => {
    panel.classList.add('chat-agent__panel--open');
    
    if (isFirstOpen) {
      isFirstOpen = false;
      setTimeout(() => {
        appendWelcomeMessage();
      }, 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('chat-agent__panel--open');
  });

  // --- 3. 时段问候语 ---
  function getWelcomeMessage() {
    const hour = new Date().getHours();
    const stats = agent.getStats();

    let greeting, suggestion;

    if (hour < 9) {
      greeting = '早上好！🌅';
      suggestion = '来份元气早餐？';
    } else if (hour < 12) {
      greeting = '上午好！☀️';
      suggestion = '想想中午吃什么？';
    } else if (hour < 14) {
      greeting = '中午好！🍱';
      suggestion = '午饭时间到！';
    } else if (hour < 18) {
      greeting = '下午好！🌤️';
      suggestion = '准备晚餐食材了吗？';
    } else if (hour < 21) {
      greeting = '晚上好！🌙';
      suggestion = '来做一顿温暖的晚餐吧';
    } else {
      greeting = '夜深了！🌃';
      suggestion = '来碗简单的夜宵？';
    }

    let historyHint = '';
    if (stats && stats.recentDishes && stats.recentDishes.length > 0) {
      const lastDish = stats.recentDishes[0].dish;
      historyHint = `<p style="margin-top:8px; font-size:13px; color:#999;">上次你做了<strong>${lastDish}</strong>，要不要试试新菜？</p>`;
    }

    return `
      <p>${greeting} 我是<strong>小食</strong>，你的AI烹饪搭档 👋</p>
      <p>${suggestion}</p>
      ${historyHint}
      <div class="chat-agent__quick-actions">
        <button class="chat-agent__quick-btn" data-msg="帮我看看冰箱里的食材能做什么">🧊 冰箱翻翻</button>
        <button class="chat-agent__quick-btn" data-msg="我是新手，教我做最简单的菜">🌟 新手入门</button>
        <button class="chat-agent__quick-btn" data-msg="10分钟内能搞定的快手菜">⚡ 快手菜</button>
        <button class="chat-agent__quick-btn" data-msg="今天想做点有挑战的菜">🔥 挑战一下</button>
      </div>
    `;
  }

  function appendWelcomeMessage() {
    const welcomeHtml = getWelcomeMessage();
    appendMessageAnimated(welcomeHtml, 'agent', false);
  }

  // --- 4. 发送消息 ---
  const sendMessage = async (text) => {
    if (!text || isSending) return;

    lastUserMessage = text;
    isSending = true;
    input.value = '';
    
    appendMessage(text, 'user');
    
    const loadingId = showLoading('小食正在思考...');
    
    try {
      const result = await agent.sendMessage(text);
      
      console.log('🤖 Agent result:', result);
      
      removeLoading(loadingId);
      
      if (result.error) {
        appendMessageWithRetry(result.text, 'agent');
      } else {
        appendMessageAnimated(result.text, 'agent');
        updateProgressFromAgent(result);
        updateCookingShortcuts(result);
        
        if (result.state === AGENT_STATES.REVIEWING) {
          setTimeout(() => showRatingModal(), 1000);
        }
      }
    } catch (error) {
      removeLoading(loadingId);
      appendMessageWithRetry('😅 网络出了点问题，请稍后再试...', 'agent');
      console.error('Chat error:', error);
    }
    
    isSending = false;
  };

  sendBtn.addEventListener('click', () => sendMessage(input.value.trim()));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isSending) sendMessage(input.value.trim());
  });

  // --- 5. 快捷按钮点击 ---
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-agent__quick-btn')) {
      const msg = e.target.dataset.msg;
      if (msg) sendMessage(msg);
    }
    if (e.target.classList.contains('chat-agent__shortcut-btn')) {
      const msg = e.target.dataset.msg;
      if (msg) sendMessage(msg);
    }
    
    const actionBtn = e.target.closest('.chat-agent__action-btn');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      const msgId = actionBtn.dataset.msgId;
      handleActionBtn(action, actionBtn, msgId);
    }
  });

  // --- 5.1 操作按钮处理 ---
  async function handleActionBtn(action, btn, msgId) {
    const msgEl = document.getElementById(msgId);
    const bubbleText = msgEl?.querySelector('.chat-agent__bubble')?.textContent?.trim() || '';
    const bubble = msgEl?.querySelector('.chat-agent__bubble');
    const actionsBar = msgEl?.querySelector('.chat-agent__actions');

    switch (action) {
      case 'copy':
        await handleCopy(btn, bubbleText);
        break;

      case 'regenerate':
        await handleRegenerate(btn, bubble, actionsBar);
        break;

      case 'like':
        handleLike(btn);
        break;

      case 'dislike':
        handleDislike(btn);
        break;
    }
  }

  async function handleCopy(btn, text) {
    const iconImg = btn.querySelector('.chat-agent__action-icon');
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    const originalDisplay = iconImg.style.display;
    iconImg.style.display = 'none';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'chat-agent__action-text';
    textSpan.textContent = '已复制';
    btn.appendChild(textSpan);

    btn.classList.add('chat-agent__action-btn--copied');
    btn.disabled = true;

    setTimeout(() => {
      iconImg.style.display = originalDisplay;
      if (textSpan.parentNode) {
        textSpan.parentNode.removeChild(textSpan);
      }
      btn.classList.remove('chat-agent__action-btn--copied');
      btn.disabled = false;
    }, 2000);
  }

  async function handleRegenerate(btn, bubble, actionsBar) {
    if (!lastUserMessage || isSending) return;
    isSending = true;

    btn.classList.add('chat-agent__action-btn--spin');
    btn.classList.add('chat-agent__action-btn--loading');

    const originalContent = bubble?.innerHTML || '';

    if (bubble) {
      bubble.innerHTML = `
        <div class="chat-agent__thinking">
          <div class="chat-agent__thinking-dots">
            <span></span><span></span><span></span>
          </div>
          <span class="chat-agent__thinking-text">正在换一个推荐...</span>
        </div>
      `;
    }
    if (actionsBar) actionsBar.classList.add('chat-agent__hidden');

    try {
      const excludeList = recommendedDishes.length > 0 
        ? `\n【重要】请不要推荐以下已推荐过的菜品：${recommendedDishes.join('、')}。请推荐完全不同的菜品。`
        : '';

      const result = await agent.sendMessage(
        `请重新推荐，要求和之前推荐的完全不同，换几道新菜。${excludeList}\n原始问题是：${lastUserMessage}`
      );

      extractDishNames(result.text);

      if (bubble) bubble.innerHTML = formatMessage(result.text);
      if (actionsBar) actionsBar.classList.remove('chat-agent__hidden');
      updateProgressFromAgent(result);
      updateCookingShortcuts(result);

    } catch (err) {
      if (bubble) bubble.innerHTML = originalContent;
      if (actionsBar) actionsBar.classList.remove('chat-agent__hidden');
      console.error('换一换失败:', err);
    }

    btn.classList.remove('chat-agent__action-btn--spin');
    btn.classList.remove('chat-agent__action-btn--loading');
    isSending = false;
  }

  function extractDishNames(text) {
    const patterns = [
      /🥘\s*\*\*(.+?)\*\*/g,
      /[1-9][.、]\s*\*\*(.+?)\*\*/g,
      /[1-9][.、]\s*(.{2,8}?)\s*[|｜]/g,
      /(?:推荐|做)[「【](.+?)[」】]/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dish = match[1].trim().replace(/[*]/g, '');
        if (dish && dish.length >= 2 && dish.length <= 10 && !recommendedDishes.includes(dish)) {
          recommendedDishes.push(dish);
        }
      }
    });

    if (recommendedDishes.length > 20) {
      recommendedDishes = recommendedDishes.slice(-20);
    }
  }

  function handleLike(btn) {
    const dislikeBtn = btn.parentElement.querySelector('[data-action="dislike"]');
    const iconImg = btn.querySelector('.chat-agent__action-icon');

    if (btn.classList.contains('chat-agent__action-btn--active')) {
      btn.classList.remove('chat-agent__action-btn--active');
      return;
    }

    btn.classList.add('chat-agent__action-btn--active');

    if (dislikeBtn) {
      dislikeBtn.classList.remove('chat-agent__action-btn--active');
    }

    iconImg.classList.add('chat-agent__like-bounce');
    showFloatingEmoji(btn, '❤️');

    setTimeout(() => {
      iconImg.classList.remove('chat-agent__like-bounce');
    }, 600);
  }

  function handleDislike(btn) {
    const likeBtn = btn.parentElement.querySelector('[data-action="like"]');
    const iconImg = btn.querySelector('.chat-agent__action-icon');

    if (btn.classList.contains('chat-agent__action-btn--active')) {
      btn.classList.remove('chat-agent__action-btn--active');
      return;
    }

    btn.classList.add('chat-agent__action-btn--active');

    if (likeBtn) {
      likeBtn.classList.remove('chat-agent__action-btn--active');
    }

    iconImg.classList.add('chat-agent__dislike-shake');
    showFloatingEmoji(btn, '😔');

    setTimeout(() => {
      iconImg.classList.remove('chat-agent__dislike-shake');
    }, 600);

    setTimeout(() => {
      appendMessageAnimated('😔 抱歉这个回答不太好，能告诉我哪里需要改进吗？我可以：\n\n• 换一种推荐方式\n• 推荐更简单/更有挑战的菜\n• 解释得更详细一些', 'agent', false);
    }, 500);
  }

  function showFloatingEmoji(btn, emoji) {
    const rect = btn.getBoundingClientRect();
    const floater = document.createElement('div');
    floater.className = 'chat-agent__float-emoji';
    floater.textContent = emoji;
    floater.style.left = `${rect.left + rect.width / 2}px`;
    floater.style.top = `${rect.top}px`;
    document.body.appendChild(floater);

    setTimeout(() => floater.remove(), 1000);
  }

  // --- 6. 打字机效果 ---
  function appendMessageAnimated(text, sender, useTypewriter = true) {
    const msgId = 'msg-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-agent__message chat-agent__message--${sender} chat-agent__fade-in`;
    msgDiv.id = msgId;
    
    if (sender === 'agent') {
      const bubbleWrapper = document.createElement('div');
      bubbleWrapper.className = 'chat-agent__bubble-wrapper';
      
      const bubble = document.createElement('div');
      bubble.className = 'chat-agent__bubble';
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'chat-agent__actions chat-agent__hidden';
      actionsDiv.innerHTML = `
        <button class="chat-agent__action-btn" data-action="copy" data-msg-id="${msgId}" title="复制">
          <img src="/copy.png" alt="复制" class="chat-agent__action-icon" />
        </button>
        <button class="chat-agent__action-btn" data-action="regenerate" data-msg-id="${msgId}" title="换一个">
          <img src="/exchange.png" alt="换一个" class="chat-agent__action-icon" />
        </button>
        <button class="chat-agent__action-btn" data-action="like" data-msg-id="${msgId}" title="点赞">
          <img src="/good.png" alt="点赞" class="chat-agent__action-icon" />
        </button>
        <button class="chat-agent__action-btn" data-action="dislike" data-msg-id="${msgId}" title="不满意">
          <img src="/bad.png" alt="不满意" class="chat-agent__action-icon" />
        </button>
      `;
      
      if (useTypewriter) {
        const typewriter = document.createElement('span');
        typewriter.className = 'chat-agent__typewriter';
        bubble.appendChild(typewriter);
        bubbleWrapper.appendChild(bubble);
        bubbleWrapper.appendChild(actionsDiv);
        msgDiv.appendChild(bubbleWrapper);
        messagesContainer.appendChild(msgDiv);
        
        let index = 0;
        
        const interval = setInterval(() => {
          if (index < text.length) {
            typewriter.innerHTML = formatMessage(text.substring(0, index + 1));
            index++;
            scrollToBottom();
          } else {
            clearInterval(interval);
            actionsDiv.classList.remove('chat-agent__hidden');
          }
        }, 15);
      } else {
        bubble.innerHTML = formatMessage(text);
        bubbleWrapper.appendChild(bubble);
        bubbleWrapper.appendChild(actionsDiv);
        msgDiv.appendChild(bubbleWrapper);
        messagesContainer.appendChild(msgDiv);
        actionsDiv.classList.remove('chat-agent__hidden');
      }
    } else {
      const bubble = document.createElement('div');
      bubble.className = 'chat-agent__bubble';
      bubble.innerHTML = formatMessage(text);
      msgDiv.appendChild(bubble);
      messagesContainer.appendChild(msgDiv);
    }
    
    scrollToBottom();
  }

  // --- 7. 消息渲染（普通） ---
  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-agent__message chat-agent__message--${sender} chat-agent__fade-in`;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-agent__bubble';
    bubble.innerHTML = formatMessage(text);
    
    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);
    
    scrollToBottom();
  }

  // --- 8. 带重试的消息 ---
  function appendMessageWithRetry(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-agent__message chat-agent__message--${sender} chat-agent__fade-in`;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-agent__bubble';
    bubble.innerHTML = `
      ${formatMessage(text)}
      <button class="chat-agent__retry-btn" onclick="this.closest('.chat-agent__message').remove()">🔄 重试</button>
    `;
    
    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);
    
    scrollToBottom();
  }

  // --- 9. 格式化消息 ---
  function formatMessage(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // --- 10. 加载状态（思考动画） ---
  let loadingElements = {};
  
  function showLoading(text = '小食正在思考...') {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-agent__message chat-agent__message--agent chat-agent__fade-in';
    div.innerHTML = `
      <div class="chat-agent__bubble">
        <div class="chat-agent__thinking">
          <div class="chat-agent__thinking-dots">
            <span></span><span></span><span></span>
          </div>
          <span class="chat-agent__thinking-text">${text}</span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
    loadingElements[id] = div;
    return id;
  }

  function removeLoading(id) {
    if (loadingElements[id]) {
      loadingElements[id].remove();
      delete loadingElements[id];
    }
  }

  // --- 11. 滚动到底部 ---
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // --- 12. 进度条更新 ---
  function updateProgressFromAgent(result) {
    const progressRecipe = document.getElementById('agent-progress-recipe');
    const progressStep = document.getElementById('agent-progress-step');
    
    console.log('📊 Progress update:', result.state, result.currentStep, result.totalSteps, result.currentRecipe);
    
    if (result.state === AGENT_STATES.COOKING_GUIDE && result.totalSteps > 0) {
      progressContainer.classList.remove('chat-agent__hidden');
      const percent = (result.currentStep / result.totalSteps) * 100;
      progressFill.style.width = `${percent}%`;
      
      if (progressRecipe) {
        progressRecipe.textContent = result.currentRecipe || '烹饪中';
      }
      if (progressStep) {
        progressStep.textContent = `${result.currentStep}/${result.totalSteps}`;
      }
    } else if (result.state !== AGENT_STATES.COOKING_GUIDE) {
      progressContainer.classList.add('chat-agent__hidden');
    }
  }

  // --- 13. 烹饪快捷按钮 ---
  function updateCookingShortcuts(result) {
    let shortcuts = document.getElementById('agent-cooking-shortcuts');
    
    if (!shortcuts) {
      shortcuts = document.createElement('div');
      shortcuts.id = 'agent-cooking-shortcuts';
      shortcuts.className = 'chat-agent__cooking-shortcuts chat-agent__hidden';
      shortcuts.innerHTML = `
        <button class="chat-agent__shortcut-btn" data-msg="好了，下一步">✅ 下一步</button>
        <button class="chat-agent__shortcut-btn" data-msg="这一步怎么操作？详细说说">❓ 详细说明</button>
        <button class="chat-agent__shortcut-btn" data-msg="出问题了，帮我看看怎么补救">🆘 出问题了</button>
        <button class="chat-agent__shortcut-btn" data-msg="等一下，我需要暂停">⏸️ 暂停</button>
      `;
      panel.insertBefore(shortcuts, panel.querySelector('.chat-agent__input-area'));
    }
    
    if (result.state === AGENT_STATES.COOKING_GUIDE) {
      shortcuts.classList.remove('chat-agent__hidden');
    } else {
      shortcuts.classList.add('chat-agent__hidden');
    }
  }

  // --- 14. 评分弹窗逻辑 ---
  function showRatingModal() {
    currentRating = 0;
    updateStars(0);
    ratingModal.classList.remove('chat-agent__hidden');
  }

  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      currentRating = parseInt(e.target.getAttribute('data-value'));
      updateStars(currentRating);
    });
  });

  function updateStars(rating) {
    stars.forEach(star => {
      const val = parseInt(star.getAttribute('data-value'));
      if (val <= rating) {
        star.classList.add('chat-agent__star--active');
      } else {
        star.classList.remove('chat-agent__star--active');
      }
    });
  }

  submitRatingBtn.addEventListener('click', () => {
    if (currentRating === 0) {
      alert('请先点击星星打分哦！');
      return;
    }
    ratingModal.classList.add('chat-agent__hidden');
    agent.finishCooking(currentRating, '');
    appendMessageAnimated(`谢谢你的 ${currentRating} 星评价！期待下次一起烹饪。`, 'agent');
  });

  // --- 15. 统计面板逻辑 ---
  statsBtn.addEventListener('click', () => {
    renderStats();
    statsModal.classList.remove('chat-agent__hidden');
  });

  closeStatsBtn.addEventListener('click', () => {
    statsModal.classList.add('chat-agent__hidden');
  });

  function renderStats() {
    const stats = agent.getStats();
    statsList.innerHTML = '';
    
    if (!stats || !stats.totalCooks) {
      statsList.innerHTML = `
        <div class="chat-agent__empty-stats">
          <div style="font-size:48px; margin-bottom:16px;">🍽️</div>
          <p>还没有烹饪记录</p>
          <p style="color:#999; font-size:13px;">完成第一道菜，开启成长之旅！</p>
        </div>
      `;
      return;
    }
    
    const levelBadge = { beginner: '🌱', intermediate: '🔥', advanced: '👨‍🍳' }[stats.skillLevel] || '🌱';
    const levelTitle = { beginner: '厨房新手', intermediate: '进阶厨师', advanced: '烹饪大师' }[stats.skillLevel] || '厨房新手';
    
    const history = agent.memory?.cookingHistory || [];
    const recentRatings = history.slice(-7);
    
    const barsHtml = recentRatings.map((h) => `
      <div class="chat-agent__bar-item">
        <div class="chat-agent__bar" style="height: ${h.rating * 20}%">
          <span class="chat-agent__bar-value">${h.rating}</span>
        </div>
        <span class="chat-agent__bar-label">${(h.dish || '').substring(0, 3)}</span>
      </div>
    `).join('');
    
    statsList.innerHTML = `
      <div class="chat-agent__stats-header">
        <div class="chat-agent__level-badge">${levelBadge}</div>
        <div>
          <div class="chat-agent__level-title">${levelTitle}</div>
          <div class="chat-agent__level-subtitle">已解锁 ${stats.uniqueDishes || 0} 道菜品</div>
        </div>
      </div>

      <div class="chat-agent__stats-grid">
        <div class="chat-agent__stat-card">
          <div class="chat-agent__stat-num">${stats.totalCooks || 0}</div>
          <div class="chat-agent__stat-label">累计烹饪</div>
        </div>
        <div class="chat-agent__stat-card">
          <div class="chat-agent__stat-num">${stats.uniqueDishes || 0}</div>
          <div class="chat-agent__stat-label">菜品种类</div>
        </div>
        <div class="chat-agent__stat-card">
          <div class="chat-agent__stat-num">${stats.avgRating || 0}⭐</div>
          <div class="chat-agent__stat-label">平均评分</div>
        </div>
        <div class="chat-agent__stat-card">
          <div class="chat-agent__stat-num">${Math.max(10 - (stats.uniqueDishes || 0), 0)}</div>
          <div class="chat-agent__stat-label">距进阶还需</div>
        </div>
      </div>

      <h3 style="margin: 20px 0 12px; font-size: 15px;">📈 最近评分趋势</h3>
      <div class="chat-agent__bar-chart">
        ${barsHtml || '<div style="color:#999; font-size:13px;">暂无数据</div>'}
      </div>

      <h3 style="margin: 20px 0 12px; font-size: 15px;">📖 烹饪日记</h3>
      <div class="chat-agent__history-list">
        ${(stats.recentDishes || []).map(d => `
          <div class="chat-agent__history-item">
            <div class="chat-agent__history-dish">${d.dish}</div>
            <div class="chat-agent__history-meta">
              <span>${'⭐'.repeat(d.rating)}${'☆'.repeat(5 - d.rating)}</span>
              <span class="chat-agent__history-date">${new Date(d.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        `).join('') || '<div style="color:#999; font-size:13px;">暂无记录</div>'}
      </div>
    `;
  }

  // --- 16. 拍照识别功能 ---
  const camera = new CameraRecognizer(async (base64, mimeType, prompt) => {
    const result = await agent.sendImageMessage(base64, mimeType, prompt);
    return result.text;
  });

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.capture = 'environment';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  cameraBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    fileInput.value = '';
    
    try {
      const { base64, preview, mimeType } = await camera.fileToBase64(file);
      appendImageMessage(preview);
      
      const loadingId = showLoading('正在识别食材...');
      
      const result = await camera.recognize(file);
      
      removeLoading(loadingId);
      
      if (result.text) {
        appendImageRecognitionResult(result.text);
      } else {
        appendMessage('📷 识别出了点问题，不如你告诉我有什么食材？', 'agent');
      }
    } catch (error) {
      removeLoading('loading-' + Object.keys(loadingElements)[0]);
      appendMessage('😅 图片识别失败，请重试...', 'agent');
      console.error('Image error:', error);
    }
  });

  function appendImageMessage(previewUrl) {
    const div = document.createElement('div');
    div.className = 'chat-agent__message chat-agent__message--user chat-agent__fade-in';
    div.innerHTML = `
      <div class="chat-agent__bubble">
        <div class="chat-agent__image-wrapper">
          <img src="${previewUrl}" class="chat-agent__image" alt="食材照片">
          <div class="chat-agent__image-label">📷 识别食材</div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function appendImageRecognitionResult(text) {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      const data = JSON.parse(jsonStr);
      
      const ingredientsHtml = Object.entries(data.识别食材 || {})
        .map(([name, count]) => `<span class="chat-agent__ingredient-tag">${name} × ${count}</span>`)
        .join('');
      
      const recipesHtml = (data.快速推荐 || []).map(r => `
        <div class="chat-agent__recipe-card" data-recipe="${r.菜名}">
          <div class="chat-agent__recipe-name">🥘 ${r.菜名}</div>
          <div class="chat-agent__recipe-meta">
            <span>⏱️ ${r.时间}</span>
            <span>📊 ${r.难度}</span>
          </div>
        </div>
      `).join('');
      
      const html = `
        <div class="chat-agent__recognition-result">
          <div class="chat-agent__result-section">
            <div class="chat-agent__result-title">📦 识别到的食材</div>
            <div class="chat-agent__ingredients">${ingredientsHtml}</div>
          </div>
          <div class="chat-agent__result-section">
            <div class="chat-agent__result-title">💡 推荐菜品</div>
            <div class="chat-agent__recipes">${recipesHtml}</div>
          </div>
          ${data.温馨提示 ? `<div class="chat-agent__tip">💡 ${data.温馨提示}</div>` : ''}
        </div>
      `;
      
      appendMessage(html, 'agent');
      
      document.querySelectorAll('.chat-agent__recipe-card').forEach(card => {
        card.addEventListener('click', () => {
          const recipe = card.dataset.recipe;
          sendMessage(`教我做${recipe}`);
        });
      });
    } catch (e) {
      appendMessageAnimated(text, 'agent');
    }
  }

  // --- 17. 语音输入功能 ---
  const voice = new VoiceAssistant(
    (text, isFinal) => {
      input.value = text;
      input.classList.toggle('chat-agent__input--preview', !isFinal);
      
      if (isFinal) {
        sendMessage(text);
        input.value = '';
      }
    },
    (status) => {
      switch (status) {
        case 'listening':
          voiceBtn.innerHTML = '<span class="chat-agent__voice-recording">🔴</span>';
          voiceBtn.title = '正在听...点击停止';
          showVoiceTip('正在听你说...');
          break;
        case 'stopped':
          voiceBtn.innerHTML = '🎙️';
          voiceBtn.title = '语音输入';
          input.classList.remove('chat-agent__input--preview');
          hideVoiceTip();
          break;
        case 'no-speech':
          voiceBtn.innerHTML = '🎙️';
          showVoiceTip('没听到声音，再试一次？');
          setTimeout(hideVoiceTip, 2000);
          break;
        case 'not-allowed':
          showVoiceTip('请允许使用麦克风 🎤');
          setTimeout(hideVoiceTip, 3000);
          break;
        case 'not-supported':
          showVoiceTip('请使用Chrome或Edge浏览器');
          setTimeout(hideVoiceTip, 3000);
          break;
        case 'error':
          voiceBtn.innerHTML = '🎙️';
          showVoiceTip('识别出错，请重试');
          setTimeout(hideVoiceTip, 2000);
          break;
      }
    }
  );

  voiceBtn.addEventListener('click', () => voice.toggle());

  function showVoiceTip(text) {
    let tip = document.getElementById('voice-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'voice-tip';
      tip.className = 'chat-agent__voice-tip';
      const inputArea = document.querySelector('.chat-agent__input-area');
      if (inputArea) {
        inputArea.prepend(tip);
      }
    }
    tip.textContent = text;
    tip.classList.remove('chat-agent__hidden');
  }

  function hideVoiceTip() {
    const tip = document.getElementById('voice-tip');
    if (tip) tip.classList.add('chat-agent__hidden');
  }
});
