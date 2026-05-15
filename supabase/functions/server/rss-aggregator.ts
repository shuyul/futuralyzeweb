/**
 * RSS 聚合器 - 策展内容聚合
 * 专注于企业 AI 转型领域的高质量信源
 */

interface RSSSource {
  name: string;
  url: string;
  category: string; // L1-L6 知识库层级
  priority: 1 | 2 | 3; // 1=必读, 2=按需, 3=扫描
  keywords?: string[]; // 过滤关键词
}

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  source: string;
  category: string;
  priority: number;
  score: number;
}

// 信源配置
export const RSS_SOURCES: RSSSource[] = [
  // ============================================
  // 第一梯队 - 必读（优先级 1）
  // ============================================
  {
    name: 'Simon Willison',
    url: 'https://simonwillison.net/atom/everything/',
    category: 'L2-工程实践',
    priority: 1,
    keywords: ['AI', 'LLM', 'Agent', 'prompt', 'Claude', 'GPT']
  },
  {
    name: 'The Rundown AI',
    url: 'https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml',
    category: 'L1-技术基座',
    priority: 1,
    keywords: [] // 每日速报，不过滤
  },
  // 甲子光年 - RSSHub 公共实例限流，暂时禁用
  // 如需启用，请部署自己的 RSSHub 实例
  // {
  //   name: '甲子光年',
  //   url: 'https://rsshub.app/wechat/mp/甲子光年',
  //   category: 'L5-行业场景',
  //   priority: 1,
  //   keywords: []
  // },

  // ============================================
  // 第二梯队 - 按需深读（优先级 2）
  // ============================================
  {
    name: 'Stratechery',
    url: 'https://stratechery.com/feed/',
    category: 'L6-商业战略',
    priority: 2,
    keywords: ['AI', 'OpenAI', 'Google', 'Microsoft', 'strategy']
  },
  {
    name: 'Latent Space',
    url: 'https://www.latent.space/feed',
    category: 'L2-工程实践',
    priority: 2,
    keywords: ['AI', 'engineering', 'infrastructure', 'agent']
  },
  // 海外独角兽 - RSSHub 限流，暂时禁用
  // {
  //   name: '海外独角兽',
  //   url: 'https://rsshub.app/wechat/mp/海外独角兽',
  //   category: 'L4-产品应用',
  //   priority: 2,
  //   keywords: []
  // },

  // 机器之心 - RSSHub 限流，暂时禁用
  // {
  //   name: '机器之心',
  //   url: 'https://rsshub.app/jiqizhixin/latest',
  //   category: 'L1-技术基座',
  //   priority: 2,
  //   keywords: []
  // },

  // 替代中文源 - 不依赖 RSSHub
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: 'L5-行业场景',
    priority: 2,
    keywords: ['AI', '人工智能', '大模型', 'ChatGPT', 'GPT']
  },
  // TechCrunch CN 经常超时，已移除
  // {
  //   name: 'TechCrunch 中文版',
  //   url: 'https://techcrunch.cn/feed/',
  //   category: 'L4-产品应用',
  //   priority: 2,
  //   keywords: ['AI', '人工智能', '创业']
  // },

  // ============================================
  // 雷达扫描 - 信号发现（优先级 3）
  // ============================================
  {
    name: 'Hacker News 精选',
    url: 'https://hnrss.org/best',
    category: '信号发现',
    priority: 3,
    keywords: ['AI', 'LLM', 'GPT', 'Claude', 'machine learning']
  },
  {
    name: 'Benedict Evans',
    url: 'https://www.ben-evans.com/benedictevans?format=rss',
    category: 'L6-商业战略',
    priority: 3,
    keywords: ['AI', 'tech', 'strategy']
  },
  {
    name: 'Ahead of AI',
    url: 'https://magazine.sebastianraschka.com/feed',
    category: 'L1-技术基座',
    priority: 3,
    keywords: ['AI', 'machine learning', 'research']
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: 'L1-技术基座',
    priority: 3,
    keywords: [] // OpenAI 官方博客，全部保留
  },
  // Anthropic 官方没有公开稳定的 RSS feed
  // {
  //   name: 'Anthropic News',
  //   url: 'https://www.anthropic.com/news/rss',
  //   category: 'L1-技术基座',
  //   priority: 3,
  //   keywords: []
  // },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'L1-技术基座',
    priority: 3,
    keywords: [] // Google AI 官方博客
  }
];

/**
 * 解析 RSS Feed（简单 XML 解析）
 */
async function parseRSS(xml: string): Promise<any[]> {
  const items: any[] = [];

  // 匹配 <item> 或 <entry> 标签
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    // 提取字段
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link') || extractAttribute(itemXml, 'link', 'href');
    const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary') || extractTag(itemXml, 'content');
    const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published') || extractTag(itemXml, 'updated');

    if (title && link) {
      items.push({
        title: cleanText(title),
        link: cleanText(link),
        description: cleanText(description),
        pubDate: pubDate ? new Date(cleanText(pubDate)).toISOString() : new Date().toISOString()
      });
    }
  }

  return items;
}

/**
 * 提取 XML 标签内容
 */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

/**
 * 提取 XML 属性
 */
function extractAttribute(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

/**
 * 清理文本（移除 CDATA、HTML 标签等）
 */
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * 检查是否包含关键词（支持中英文）
 */
function matchKeywords(text: string, keywords?: string[]): boolean {
  // 如果没有关键词限制，直接通过
  if (!keywords || keywords.length === 0) return true;

  const lowerText = text.toLowerCase();

  // 对每个关键词进行匹配
  return keywords.some(keyword => {
    const lowerKeyword = keyword.toLowerCase();

    // 英文关键词：完整单词匹配
    if (/^[a-z]+$/i.test(keyword)) {
      // 使用单词边界匹配，避免误匹配
      const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'i');
      return regex.test(text);
    }

    // 中文关键词或混合：直接包含匹配
    return lowerText.includes(lowerKeyword);
  });
}

/**
 * 计算内容分数
 */
function calculateScore(item: any, priority: number): number {
  const now = Date.now();
  const pubTime = new Date(item.pubDate).getTime();
  const ageHours = (now - pubTime) / (1000 * 60 * 60);

  // 时间衰减分数
  const timeScore = Math.max(0, 10 - ageHours / 24);

  // 优先级权重
  const priorityWeight = priority === 1 ? 3 : priority === 2 ? 2 : 1;

  return timeScore * priorityWeight;
}

/**
 * 是否最近发布（hours 小时内）
 */
function isRecent(pubDate: string, hours: number): boolean {
  const now = Date.now();
  const pubTime = new Date(pubDate).getTime();
  const ageHours = (now - pubTime) / (1000 * 60 * 60);
  return ageHours <= hours;
}

/**
 * 从 HackerNews API 获取热门内容（备用方案）
 */
async function fetchHackerNews(): Promise<RSSItem[]> {
  try {
    console.log('📡 拉取: Hacker News (API 直连)');

    // 获取前30条 top stories
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!response.ok) {
      throw new Error(`HN API 失败: ${response.status}`);
    }

    const topIds = await response.json();
    const items: RSSItem[] = [];

    // 只拉取前5条（避免太多请求，现在有更多 RSS 源）
    for (let i = 0; i < Math.min(5, topIds.length); i++) {
      const id = topIds[i];
      const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);

      if (itemResponse.ok) {
        const item = await itemResponse.json();

        // 过滤 AI 相关内容
        const title = item.title || '';
        const isAIRelated = /AI|LLM|GPT|Claude|OpenAI|Anthropic|machine learning|neural|model/i.test(title);

        if (isAIRelated && item.url) {
          items.push({
            title: item.title,
            link: item.url,
            description: `HN Score: ${item.score} | Comments: ${item.descendants || 0}`,
            pubDate: new Date(item.time * 1000).toISOString(),
            source: 'Hacker News',
            category: '信号发现',
            priority: 1,
            score: Math.log10(item.score || 1) * 3
          });
        }
      }
    }

    console.log(`  ✅ HN API 获取 ${items.length} 条 AI 相关内容`);
    return items;
  } catch (error) {
    console.error('❌ HN API 失败:', error);
    return [];
  }
}

/**
 * 聚合所有 RSS 源
 */
export async function aggregateRSS(hoursBack: number = 24): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];

  console.log(`开始聚合 ${RSS_SOURCES.length} 个 RSS 源...`);

  // 先尝试 HackerNews API（更可靠）
  const hnItems = await fetchHackerNews();
  allItems.push(...hnItems);

  for (const source of RSS_SOURCES) {
    try {
      console.log(`📡 拉取: ${source.name} (${source.url})`);

      // 添加超时控制（30秒）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Aggregator)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ ${source.name} 失败: ${response.status} ${response.statusText}`);
        console.error(`   URL: ${source.url}`);

        // 如果是 502/503，说明服务暂时不可用，跳过
        if (response.status >= 500) {
          console.log(`   ⏭️  跳过此源，继续处理其他源`);
          continue;
        }

        continue;
      }

      const xml = await response.text();

      // 检查是否真的是 XML
      if (!xml.includes('<rss') && !xml.includes('<feed')) {
        console.error(`❌ ${source.name} 返回的不是有效的 RSS/Atom feed`);
        console.error(`   前100字符: ${xml.substring(0, 100)}`);
        continue;
      }

      const items = await parseRSS(xml);

      console.log(`  找到 ${items.length} 条内容`);

      // 过滤和转换
      const recentItems = items.filter(item => isRecent(item.pubDate, hoursBack));
      console.log(`  时间过滤（${hoursBack}h内）: ${recentItems.length} 条`);

      const filtered = recentItems
        .filter(item => matchKeywords(item.title + ' ' + (item.description || ''), source.keywords))
        .map(item => ({
          title: item.title,
          link: item.link,
          description: item.description?.substring(0, 300), // 限制长度
          pubDate: item.pubDate,
          source: source.name,
          category: source.category,
          priority: source.priority,
          score: calculateScore(item, source.priority)
        }));

      console.log(`  关键词过滤: ${filtered.length} 条`);

      if (filtered.length > 0) {
        console.log(`  ✅ 成功: ${filtered.length} 条（示例: ${filtered[0]?.title?.substring(0, 50)}...）`);
      } else {
        console.log(`  ⚠️  0 条内容通过过滤`);
      }

      allItems.push(...filtered);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`❌ ${source.name} 超时（30秒）`);
        } else {
          console.error(`❌ ${source.name} 错误: ${error.message}`);
        }
      } else {
        console.error(`❌ ${source.name} 未知错误:`, error);
      }
      // 继续处理其他源
      continue;
    }
  }

  // 按分数排序
  allItems.sort((a, b) => b.score - a.score);

  console.log(`\n📊 聚合完成:`);
  console.log(`  - 总内容: ${allItems.length} 条`);
  console.log(`  - Hacker News API: ${hnItems.length} 条`);
  console.log(`  - RSS 源: ${allItems.length - hnItems.length} 条`);

  return allItems;
}

/**
 * 去重（基于 URL）
 */
export function deduplicateItems(items: RSSItem[]): RSSItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}
