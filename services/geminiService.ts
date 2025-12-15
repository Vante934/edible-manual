
import { GoogleGenAI } from "@google/genai";
import { SelectionState } from "../types";
import { DISH_DATABASE, Dish } from "./dishDatabase";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to check fuzzy match of ingredients
const findLocalRecipes = (selections: SelectionState): string[] => {
  const userIngredients = [
    ...selections.vegetables.filter(i => i !== '无'),
    ...selections.meats.filter(i => i !== '无'),
    ...selections.staples.filter(i => i !== '无')
  ];

  if (userIngredients.length === 0) return [];

  const scoredDishes = DISH_DATABASE.map(dish => {
    let matchCount = 0;
    // Check how many of the dish's ingredients are in the user's list
    dish.ingredients.forEach(dishIng => {
      // Fuzzy match: "猪肉" matches "猪肉末", "猪肉" matches "猪肉"
      // OR user has "牛肉", dish needs "牛肉"
      if (userIngredients.some(userIng => userIng.includes(dishIng) || dishIng.includes(userIng))) {
        matchCount++;
      }
    });
    
    return {
      name: dish.name,
      matchCount,
      totalIngredients: dish.ingredients.length,
      score: matchCount / Math.max(dish.ingredients.length, 1) // Percentage match
    };
  });

  // Filter for decent matches:
  // 1. At least 1 matches if the dish only has 2 ingredients
  // 2. Or strict sorting by high score
  const bestMatches = scoredDishes
    .filter(d => d.matchCount > 0) // Must have at least one matching ingredient
    .sort((a, b) => b.score - a.score) // Sort by best match percentage
    .slice(0, 10) // Take top 10
    .map(d => d.name);

  return bestMatches;
};

export const generateRecipe = async (selections: SelectionState): Promise<string> => {
  // 1. Try Local Database First
  const localMatches = findLocalRecipes(selections);
  
  // If we have enough strong matches (e.g., > 2), return them instantly
  // This creates a "hybrid" feeling - known recipes appear instantly, weird combos use AI
  if (localMatches.length >= 2) {
      console.log("Found local matches:", localMatches);
      // Add a bit of AI flavor if list is short, otherwise just return local
      if (localMatches.length >= 5) {
          return localMatches.join(", ");
      }
      // Fallthrough to AI if we want to mix, but for "Database Enrichment" request,
      // returning specific database matches is prioritized.
      return localMatches.join(", ");
  }

  // 2. Fallback to AI
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `
    你是一个中国家庭烹饪助手。
    请根据以下食材，推荐10个可以做的中国家常菜菜名。
    
    我的食材：
    蔬菜: ${selections.vegetables.join(', ') || '无'}
    肉类: ${selections.meats.join(', ') || '无'}
    主食: ${selections.staples.join(', ') || '无'}
    
    烹饪工具: ${selections.tool || '普通锅具'}
    
    要求：
    1. 尽量利用给定的食材，如果食材很少，可以推荐需要较少额外食材的经典菜。
    2. 菜名要通俗易懂，不要太长。
    3. 推荐的菜谱尽量多样化。
    4. 必须严格只返回菜名，用中文逗号分隔，不要包含任何其他文字、序号或解释。
    ${localMatches.length > 0 ? `5. 参考这些相关菜品: ${localMatches.join(',')}` : ''}
    
    例如：西红柿炒鸡蛋，土豆炖牛腩，青椒肉丝
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
          temperature: 1.2, // Higher temperature for more variety
          topP: 0.95,
      }
    });
    
    return response.text || "炒青菜, 炖肉, 蛋炒饭";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to local matches if API fails, or generic if empty
    return localMatches.length > 0 ? localMatches.join(", ") : "网络错误, 请稍后重试";
  }
};

export const getDiscoverySuggestion = async (count: number = 1): Promise<string> => {
  // 优化：优先从本地数据库随机选择，响应更快
  // 80% 概率使用本地数据库，20% 概率使用 AI 增加多样性
  const useLocal = Math.random() < 0.8;
  
  if (useLocal && DISH_DATABASE.length > 0) {
    // 从本地数据库随机选择
    const selectedDishes: string[] = [];
    const availableDishes = [...DISH_DATABASE];
    
    for (let i = 0; i < count && availableDishes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableDishes.length);
      selectedDishes.push(availableDishes[randomIndex].name);
      availableDishes.splice(randomIndex, 1); // 避免重复
    }
    
    return selectedDishes.join(", ");
  }
  
  // 20% 概率使用 AI 增加多样性
  const modelId = 'gemini-2.5-flash';
  try {
    const response = await ai.models.generateContent({
        model: modelId,
        contents: `随机给我${count}个不同的中国家常菜的菜名。只返回菜名，用中文逗号分隔。不要其他文字。`,
        config: {
            temperature: 1.4,
        }
    });
    return response.text?.trim() || "宫保鸡丁";
  } catch (e) {
      // Fallback to random from DB if API fails
      const randomDish = DISH_DATABASE[Math.floor(Math.random() * DISH_DATABASE.length)].name;
      return randomDish;
  }
}
