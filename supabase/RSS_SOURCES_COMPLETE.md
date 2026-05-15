# 完整 RSS 信源配置

基于您的 OPML 清单，已配置 **13 个 RSS 源 + 1 个 API 直连**

---

## 第一梯队 · 必读（优先级 1）

### 1. Simon Willison ⭐⭐⭐⭐⭐
- **URL**: https://simonwillison.net/atom/everything/
- **定位**: AI 工程实践第一人，Django 联合创始人
- **层级**: L2-工程实践
- **关键词**: AI, LLM, Agent, prompt, Claude, GPT
- **更新频率**: 几乎每天
- **可靠性**: 极高

### 2. The Rundown AI ⭐⭐⭐⭐⭐
- **URL**: https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml
- **定位**: 每日 AI 新闻速报（200万+订阅）
- **层级**: L1-技术基座
- **关键词**: 无过滤（每日速报全部保留）
- **更新频率**: 每日
- **可靠性**: 极高

### 3. 甲子光年 ⭐⭐⭐⭐⭐
- **URL**: https://rsshub.app/wechat/mp/甲子光年
- **定位**: 中国 AI 产业商业分析
- **层级**: L5-行业场景
- **关键词**: 无（保留全部）
- **更新频率**: 每周 3-5 篇
- **可靠性**: 高（RSSHub 公共实例）
- **说明**: 通过 RSSHub 代理微信公众号

---

## 第二梯队 · 按需深读（优先级 2）

### 4. Stratechery ⭐⭐⭐⭐⭐
- **URL**: https://stratechery.com/feed/
- **定位**: 科技商业战略分析标杆
- **层级**: L6-商业战略
- **关键词**: AI, OpenAI, Google, Microsoft, strategy
- **更新频率**: 每周 2-3 篇
- **可靠性**: 极高
- **成本**: 付费订阅 $12/月

### 5. Latent Space ⭐⭐⭐⭐
- **URL**: https://www.latent.space/feed
- **定位**: AI 工程师社区深度播客
- **层级**: L2-工程实践
- **关键词**: AI, engineering, infrastructure, agent
- **更新频率**: 每周
- **可靠性**: 高

### 6. 海外独角兽 ⭐⭐⭐⭐
- **URL**: https://rsshub.app/wechat/mp/海外独角兽
- **定位**: 翻译海外 AI 产品动态
- **层级**: L4-产品应用
- **关键词**: 无（保留全部）
- **更新频率**: 每周 2-3 篇
- **可靠性**: 高（RSSHub 公共实例）
- **说明**: 通过 RSSHub 代理微信公众号

### 7. 机器之心 ⭐⭐⭐⭐
- **URL**: https://rsshub.app/jiqizhixin/latest
- **定位**: AI 技术新闻覆盖最广的中文媒体
- **层级**: L1-技术基座
- **关键词**: 无（保留全部）
- **更新频率**: 每日多篇
- **可靠性**: 高（RSSHub 聚合）

---

## 雷达扫描 · 信号发现（优先级 3）

### 8. Hacker News 精选 ⭐⭐⭐
- **URL**: https://hnrss.org/best
- **定位**: HN 最佳帖子聚合
- **层级**: 信号发现
- **关键词**: AI, LLM, GPT, Claude, machine learning
- **更新频率**: 持续
- **可靠性**: 中等（第三方服务）
- **备注**: 系统还有 HackerNews API 直连作为备份

### 9. Benedict Evans ⭐⭐⭐⭐
- **URL**: https://www.ben-evans.com/benedictevans?format=rss
- **定位**: 宏观科技趋势分析
- **层级**: L6-商业战略
- **关键词**: AI, tech, strategy
- **更新频率**: 每月几篇
- **可靠性**: 高

### 10. Ahead of AI (Sebastian Raschka) ⭐⭐⭐⭐
- **URL**: https://magazine.sebastianraschka.com/feed
- **定位**: AI 研究与实践（Lightning AI 联合创始人）
- **层级**: L1-技术基座
- **关键词**: AI, machine learning, research
- **更新频率**: 每周
- **可靠性**: 高

### 11. OpenAI Blog ⭐⭐⭐⭐⭐
- **URL**: https://openai.com/blog/rss.xml
- **定位**: OpenAI 官方博客
- **层级**: L1-技术基座
- **关键词**: 无（全部保留）
- **更新频率**: 不定期（重大更新）
- **可靠性**: 极高

### 12. Anthropic News ⭐⭐⭐⭐⭐
- **URL**: https://www.anthropic.com/news/rss
- **定位**: Anthropic 官方新闻
- **层级**: L1-技术基座
- **关键词**: 无（全部保留）
- **更新频率**: 不定期（重大更新）
- **可靠性**: 极高

---

## 备用方案（API 直连）

### HackerNews API ⭐⭐⭐⭐⭐
- **方式**: Firebase API 直连
- **URL**: https://hacker-news.firebaseio.com/v0/
- **定位**: HN Top Stories AI 相关内容
- **拉取数量**: 前 5 条 AI 话题
- **可靠性**: 极高（官方 API）
- **作用**: 当 hnrss.org 失败时的备份

---

## 关于微信公众号代理

**RSSHub (rsshub.app)** 是开源的 "万物皆可 RSS" 工具：

✅ **优点**:
- 免费开源
- 支持海量网站和平台
- 社区维护活跃
- 可自己部署

⚠️ **注意**:
- 公共实例有频率限制
- 微信公众号抓取有 1-24 小时延迟
- 偶尔可能不稳定（可切换备用实例）

📌 **已代理的公众号**:
- 甲子光年: `https://rsshub.app/wechat/mp/甲子光年`
- 海外独角兽: `https://rsshub.app/wechat/mp/海外独角兽`

📌 **备用公共实例**:
- `https://rsshub.rssforever.com`
- `https://rss.shab.fun`

💡 **自己部署** (推荐长期使用):
- Fork https://github.com/DIYgod/RSSHub
- 部署到 Vercel（免费）
- 获得专属实例，无限制

---

## 聚合策略

### 内容保留
- **总计**: 前 50 条（从所有源中筛选）
- **去重**: 基于 URL
- **时间窗口**: 24 小时内发布

### 优先级权重
```typescript
优先级 1: 权重 × 3  (第一梯队 - 必读)
优先级 2: 权重 × 2  (第二梯队 - 按需)
优先级 3: 权重 × 1  (雷达扫描)
```

### 热度算法
```typescript
score = (10 - 发布时间/24小时) × 优先级权重
```

---

## 预期聚合结果

每次聚合预计获得：
- **总抓取**: 80-150 条原始内容
- **关键词过滤后**: 40-80 条相关内容
- **去重后**: 30-60 条独特内容
- **最终保存**: 前 50 条

### 来源分布（估算）
- 第一梯队: 15-25 条
- 第二梯队: 15-20 条
- 雷达扫描: 10-15 条

---

## 成本分析

| 项目 | 成本 |
|---|---|
| RSS 拉取 | $0 (免费) |
| 数据存储 | $0 (KV store 免费额度) |
| HackerNews API | $0 (免费) |
| werss 代理 | $0 (免费第三方) |
| Stratechery 订阅 | $12/月 (可选) |

**总计**: $0 (不订阅 Stratechery)

---

## 故障降级

系统设计了多层容错：

1. **单源失败**: 不影响其他源
2. **超时保护**: 30秒自动跳过
3. **5xx 错误**: 自动跳过并记录
4. **HN 备份**: API 直连作为 RSS 失败的备份
5. **格式验证**: 非 XML 自动跳过

即使 50% 的源失败，仍能聚合到 20-30 条高质量内容。

---

## 如何测试

1. 进入管理后台 → Trending 标签
2. 点击"触发 RSS 聚合"
3. 查看浏览器控制台（F12）日志
4. 预期看到：

```
📡 拉取: Hacker News (API 直连)
  ✅ HN API 获取 3-5 条 AI 相关内容
📡 拉取: Simon Willison
  找到 20 条内容
  ✅ 通过过滤: 15 条
📡 拉取: The Rundown AI
  找到 1 条内容
  ✅ 通过过滤: 1 条
... (其他源)

📊 聚合完成:
  - 总内容: 45 条
  - Hacker News API: 4 条
  - RSS 源: 41 条
```

成功！🚀
