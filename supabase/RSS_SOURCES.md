# RSS 信源配置说明

## 当前信源（已优化）

### 1. Hacker News - API 直连 ✅
- **方式**: Firebase API（官方）
- **可靠性**: ⭐⭐⭐⭐⭐ 极高
- **内容**: Top 10 AI 相关话题
- **优先级**: 1（必读）
- **速度**: 快（~2秒）

### 2. Simon Willison - RSS ✅
- **URL**: https://simonwillison.net/atom/everything/
- **可靠性**: ⭐⭐⭐⭐⭐ 极高
- **内容**: AI 工程实践、Prompt Engineering
- **优先级**: 1（必读）
- **关键词**: AI, LLM, Agent, prompt, Claude, GPT

### 3. The Verge AI - RSS ✅
- **URL**: https://www.theverge.com/rss/ai-artificial-intelligence/index.xml
- **可靠性**: ⭐⭐⭐⭐ 高
- **内容**: AI 行业新闻
- **优先级**: 2（按需）

### 4. MIT Technology Review AI - RSS ✅
- **URL**: https://www.technologyreview.com/topic/artificial-intelligence/feed/
- **可靠性**: ⭐⭐⭐⭐ 高
- **内容**: AI 技术深度分析
- **优先级**: 2（按需）

---

## 为什么移除了之前的源

### ❌ hnrss.org
- **问题**: 经常 502 错误，不稳定
- **替代**: 直接用 HackerNews 官方 API

### ❌ Latent Space RSS
- **问题**: Feed 格式可能不稳定
- **未来**: 可以在稳定后重新添加

---

## 如何添加新信源

编辑 `/supabase/functions/server/rss-aggregator.ts`:

```typescript
export const RSS_SOURCES: RSSSource[] = [
  {
    name: '信源名称',
    url: 'RSS Feed URL',
    category: 'L1-L6 层级',
    priority: 1, // 1=必读, 2=按需, 3=扫描
    keywords: ['关键词1', '关键词2'] // 可选
  },
  // ... 其他源
];
```

### 推荐添加的源

1. **Stratechery** (付费)
   - URL: `https://stratechery.com/feed/`
   - 商业战略分析

2. **a16z** (免费)
   - URL: `https://a16z.com/feed/`
   - 科技投资视角

3. **Ars Technica AI** (免费)
   - URL: `https://feeds.arstechnica.com/arstechnica/technology-lab`
   - 技术深度报道

---

## 容错机制

系统现在具备：
- ✅ 30秒超时保护
- ✅ 单源失败不影响其他源
- ✅ 5xx 错误自动跳过
- ✅ XML 格式验证
- ✅ HackerNews 双重备份（API + RSS）

即使所有 RSS 源都失败，HackerNews API 仍能提供基础内容。
