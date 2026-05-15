/**
 * AI Artist - Google Gemini Vision API for Art Analysis
 * 使用 Google Gemini API 进行艺术分析和理解
 */

const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface ArtAnalysis {
  style: string;           // 艺术风格（如：印象派、抽象主义等）
  colors: string[];        // 主要色彩
  composition: string;     // 构图分析
  mood: string;           // 情绪/氛围
  technique: string;      // 技法分析
  tags: string[];         // 智能标签
  description: string;    // 详细描述
  era?: string;           // 可能的年代/时期
  similarStyles: string[]; // 相似的艺术风格
}

export interface SmartDescription {
  title: string;          // 智能生成的标题
  description: string;    // 艺术性描述
  tags: string[];        // 推荐标签
  category: string;      // 推荐分类
  location?: string;     // 可能的拍摄地点（如果能识别）
}

/**
 * 将图片转换为 Base64
 */
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // 移除 data:image/xxx;base64, 前缀
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error('图片加载失败: ' + error);
  }
}

/**
 * 调用 Gemini Vision API
 */
async function callGeminiVision(prompt: string, imageUrl: string): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('未配置 Google AI API Key');
  }

  try {
    const imageBase64 = await imageUrlToBase64(imageUrl);
    
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API 错误: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Gemini API 返回了空响应');
    }

    return text;
  } catch (error) {
    console.error('Gemini API 调用失败:', error);
    throw error;
  }
}

/**
 * 分析照片的艺术风格和特征
 */
export async function analyzeArtStyle(imageUrl: string): Promise<ArtAnalysis> {
  const prompt = `你是一位专业的艺术评论家和博物馆策展人。请详细分析这张图片的艺术特征。

请以 JSON 格式返回分析结果，包含以下字段：
{
  "style": "艺术风格（如：印象派、现代主义、抽象表现主义等）",
  "colors": ["主要色彩1", "主要色彩2", "主要色彩3"],
  "composition": "构图分析（如：三分法、对称构图、黄金分割等）",
  "mood": "情绪和氛围描述",
  "technique": "技法分析（如：光影处理、笔触、质感等）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "description": "2-3句话的专业艺术描述",
  "era": "可能的艺术时期或年代",
  "similarStyles": ["相似风格1", "相似风格2", "相似风格3"]
}

请确保返回的是纯 JSON 格式，不要包含其他文字。`;

  try {
    const response = await callGeminiVision(prompt, imageUrl);
    
    // 尝试提取 JSON（移除可能的 markdown 代码块标记）
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const analysis = JSON.parse(jsonText);
    return analysis;
  } catch (error) {
    console.error('艺术分析失败:', error);
    throw new Error('AI 艺术分析失败，请稍后重试');
  }
}

/**
 * 智能生成照片描述和标签
 */
export async function generateSmartDescription(imageUrl: string, context?: string): Promise<SmartDescription> {
  const contextPrompt = context ? `\n用户提供的背景信息：${context}` : '';
  
  const prompt = `你是一位专业摄影师和文案专家。请为这张照片生成吸引人的标题和描述。${contextPrompt}

请以 JSON 格式返回：
{
  "title": "一个吸引人的标题（不超过20字）",
  "description": "一段优美的描述文字（50-100字）",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "最合适的分类（从以下选择：风光、城市、抽象、生活、文化、人像、建筑、美食）",
  "location": "如果能识别出具体地点则填写，否则为null"
}

请确保返回的是纯 JSON 格式，不要包含其他文字。`;

  try {
    const response = await callGeminiVision(prompt, imageUrl);
    
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const description = JSON.parse(jsonText);
    return description;
  } catch (error) {
    console.error('智能描述生成失败:', error);
    throw new Error('AI 描述生成失败，请稍后重试');
  }
}

/**
 * 对比两张图片的风格相似度
 */
export async function compareArtStyles(imageUrl1: string, imageUrl2: string): Promise<{
  similarity: number; // 0-100 的相似度分数
  commonElements: string[]; // 共同元素
  differences: string[]; // 主要差异
  analysis: string; // 详细分析
}> {
  const prompt = `你是艺术史专家。请对比这两张图片的艺术风格。

请以 JSON 格式返回：
{
  "similarity": 75,
  "commonElements": ["共同元素1", "共同元素2"],
  "differences": ["差异1", "差异2"],
  "analysis": "详细的对比分析文字"
}

请确保返回的是纯 JSON 格式，不要包含其他文字。`;

  try {
    // 注意：这里需要修改为支持多图片的调用方式
    // 当前先使用单图分析的简化版本
    const analysis1 = await analyzeArtStyle(imageUrl1);
    const analysis2 = await analyzeArtStyle(imageUrl2);
    
    // 简单的相似度计算
    const commonTags = analysis1.tags.filter(tag => analysis2.tags.includes(tag));
    const similarity = (commonTags.length / Math.max(analysis1.tags.length, analysis2.tags.length)) * 100;
    
    return {
      similarity: Math.round(similarity),
      commonElements: commonTags,
      differences: [
        `风格差异: ${analysis1.style} vs ${analysis2.style}`,
        `色调差异: ${analysis1.colors.join(', ')} vs ${analysis2.colors.join(', ')}`
      ],
      analysis: `第一张图片呈现${analysis1.style}风格，${analysis1.mood}；第二张图片则是${analysis2.style}风格，${analysis2.mood}。两者在${commonTags.join('、')}等方面有共同之处。`
    };
  } catch (error) {
    console.error('风格对比失败:', error);
    throw new Error('AI 风格对比失败，请稍后重试');
  }
}

/**
 * 识别博物馆藏品信息
 */
export async function identifyArtwork(imageUrl: string): Promise<{
  isArtwork: boolean;
  artist?: string;
  title?: string;
  period?: string;
  style?: string;
  museum?: string;
  description: string;
}> {
  const prompt = `你是艺术史和博物馆学专家。请识别这张图片是否是艺术品，如果是，请提供详细信息。

请以 JSON 格式返回：
{
  "isArtwork": true/false,
  "artist": "艺术家名字（如果能识别）",
  "title": "作品名称（如果能识别）",
  "period": "创作时期（如：19世纪末、文艺复兴时期等）",
  "style": "艺术流派",
  "museum": "可能收藏的博物馆",
  "description": "详细描述"
}

请确保返回的是纯 JSON 格式，不要包含其他文字。`;

  try {
    const response = await callGeminiVision(prompt, imageUrl);
    
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const identification = JSON.parse(jsonText);
    return identification;
  } catch (error) {
    console.error('艺术品识别失败:', error);
    throw new Error('AI 艺术品识别失败，请稍后重试');
  }
}

/**
 * 生成艺术化的标题建议
 */
export async function suggestArtisticTitles(imageUrl: string, count: number = 5): Promise<string[]> {
  const prompt = `你是一位富有创意的作家。请为这张照片生成 ${count} 个富有诗意和艺术感的标题。

要求：
- 每个标题不超过15字
- 富有意境和美感
- 可以使用诗歌、文学典故
- 多样化风格（既要有抽象的，也要有具象的）

请以 JSON 数组格式返回：
["标题1", "标题2", "标题3", "标题4", "标题5"]

请确保返回的是纯 JSON 格式，不要包含其他文字。`;

  try {
    const response = await callGeminiVision(prompt, imageUrl);
    
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const titles = JSON.parse(jsonText);
    return titles;
  } catch (error) {
    console.error('标题生成失败:', error);
    throw new Error('AI 标题生成失败，请稍后重试');
  }
}
