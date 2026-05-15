# RSSHub 信源配置

## ✅ 已修复的问题

### 1. Anthropic Blog - 404 错误
- ❌ 旧 URL: `https://www.anthropic.com/rss.xml`
- ✅ 新 URL: `https://www.anthropic.com/news/rss`

### 2. OpenAI Blog - URL 更新
- ❌ 旧 URL: `https://openai.com/news/rss.xml`
- ✅ 新 URL: `https://openai.com/blog/rss.xml`

### 3. 甲子光年 & 海外独角兽 - DNS 错误
- ❌ 旧代理: `werss.bestblogs.dev` (DNS 无法解析)
- ✅ 新代理: `rsshub.app` (RSSHub 官方公共实例)

### 4. 机器之心 - 非有效 RSS
- ❌ 旧 URL: `https://www.jiqizhixin.com/rss` (返回 HTML)
- ✅ 新 URL: `https://rsshub.app/jiqizhixin/latest` (RSSHub 聚合)

---

## 🌐 关于 RSSHub

RSSHub 是一个开源的万物皆可 RSS 的工具，特别适合：
- 微信公众号（不提供官方 RSS）
- 网站内容聚合
- 社交媒体动态

### 官方公共实例
- **主站**: https://rsshub.app
- **备用**: 
  - https://rsshub.rssforever.com
  - https://rss.shab.fun

### 优点
✅ 免费开源  
✅ 支持海量网站  
✅ 社区维护活跃  
✅ 可自己部署

### 缺点
⚠️ 公共实例有频率限制  
⚠️ 可能偶尔不稳定  
⚠️ 微信公众号抓取有延迟（1-24小时）

---

## 📡 当前中文源配置

```typescript
// 甲子光年 - 微信公众号
{
  name: '甲子光年',
  url: 'https://rsshub.app/wechat/mp/甲子光年',
  category: 'L5-行业场景',
  priority: 1
}

// 海外独角兽 - 微信公众号
{
  name: '海外独角兽',
  url: 'https://rsshub.app/wechat/mp/海外独角兽',
  category: 'L4-产品应用',
  priority: 2
}

// 机器之心 - 官网聚合
{
  name: '机器之心',
  url: 'https://rsshub.app/jiqizhixin/latest',
  category: 'L1-技术基座',
  priority: 2
}
```

---

## 🔄 备用方案

### 如果 rsshub.app 失败

#### 方案 1: 切换到其他公共实例

```typescript
// 使用 rsshub.rssforever.com
url: 'https://rsshub.rssforever.com/wechat/mp/甲子光年'

// 或使用 rss.shab.fun
url: 'https://rss.shab.fun/wechat/mp/甲子光年'
```

#### 方案 2: 自己部署 RSSHub（推荐长期使用）

**Vercel 一键部署（免费）**:
1. Fork https://github.com/DIYgod/RSSHub
2. 登录 https://vercel.com
3. Import GitHub 仓库
4. 点击 Deploy
5. 获得你的专属域名: `https://your-app.vercel.app`

**使用自己的实例**:
```typescript
url: 'https://your-rsshub.vercel.app/wechat/mp/甲子光年'
```

#### 方案 3: 使用 RSS 订阅服务

如果 RSSHub 完全不可用，可以考虑付费服务：
- **Inoreader**: 支持微信公众号订阅
- **即刻**: 支持微信公众号 RSS 输出
- **Feeddd**: 专注中文内容聚合

---

## 🧪 测试 RSSHub 是否可用

### 浏览器测试
直接访问：https://rsshub.app/wechat/mp/甲子光年

**成功**: 看到 XML/RSS 内容  
**失败**: 看到错误页面或超时

### 命令行测试
```bash
curl -I https://rsshub.app/wechat/mp/甲子光年
# 应该返回 200 OK
```

### 系统内测试
在管理后台 → Trending 标签 → 点击"测试 甲子光年"

---

## 📊 RSSHub 微信公众号抓取机制

### 工作原理
1. RSSHub 定期爬取微信公众号历史文章页面
2. 解析文章列表生成 RSS
3. 缓存结果（通常 1-6 小时）

### 更新频率
- **高频公众号**（每天发文）: 1-6 小时延迟
- **低频公众号**（每周发文）: 可能 12-24 小时延迟

### 限制
- 每个公众号最多返回最近 10-20 篇文章
- 可能因为微信反爬虫机制偶尔失败

---

## 🔧 故障排查

### 问题: RSSHub 返回 429 (Too Many Requests)

**原因**: 公共实例被限流

**解决**:
1. 等待 10-30 分钟后重试
2. 切换到其他公共实例
3. 部署自己的 RSSHub 实例

### 问题: 微信公众号内容为空

**原因**: 
- 公众号最近没有发文
- 微信反爬虫拦截
- RSSHub 缓存未更新

**解决**:
1. 浏览器访问 RSS URL 看是否有内容
2. 等待 1-6 小时后重试
3. 检查公众号是否真的有新文章

### 问题: 机器之心内容过时

**原因**: RSSHub 缓存时间

**解决**:
- RSSHub 通常每 1-6 小时更新一次
- 如果需要实时内容，考虑直接访问机器之心官网

---

## 🚀 优化建议

### 短期（当前配置已足够）
✅ 使用 rsshub.app 公共实例  
✅ 设置 72 小时时间窗口（覆盖延迟）  
✅ 移除关键词过滤（保留全部中文内容）

### 中期（如果经常使用）
📦 部署自己的 RSSHub 实例到 Vercel  
⏰ 配置定时任务每 6 小时聚合一次  
📊 监控聚合成功率

### 长期（生产级）
🔐 使用付费 RSS 服务（更稳定）  
🌍 配置多个备用 RSSHub 实例  
🤖 添加失败重试机制

---

## 📝 配置示例

### 完整配置（带备用）

```typescript
export const RSS_SOURCES: RSSSource[] = [
  // 第一梯队
  {
    name: '甲子光年',
    url: 'https://rsshub.app/wechat/mp/甲子光年',
    fallbackUrls: [
      'https://rsshub.rssforever.com/wechat/mp/甲子光年',
      'https://rss.shab.fun/wechat/mp/甲子光年'
    ],
    category: 'L5-行业场景',
    priority: 1,
    keywords: []
  },
  // ... 其他源
];
```

### 实现备用机制（未来优化）

```typescript
async function fetchWithFallback(urls: string[]) {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      console.log(`尝试备用 URL: ${url} 失败`);
      continue;
    }
  }
  throw new Error('所有 URL 都失败');
}
```

---

## 📚 相关资源

- **RSSHub 官方文档**: https://docs.rsshub.app
- **微信公众号路由**: https://docs.rsshub.app/routes/social-media#wei-xin
- **机器之心路由**: https://docs.rsshub.app/routes/new-media#ji-qi-zhi-xin
- **部署指南**: https://docs.rsshub.app/deploy/

---

## ✅ 修复验证

修复后再次聚合，应该看到：

```
✅ HN API 获取 4 条 AI 相关内容
📡 拉取: Simon Willison
  ✅ 成功: 15 条
📡 拉取: The Rundown AI
  ✅ 成功: 1 条
📡 拉取: 甲子光年
  ✅ 成功: 2-3 条
📡 拉取: 海外独角兽
  ✅ 成功: 1-2 条
📡 拉取: 机器之心
  ✅ 成功: 10-20 条
📡 拉取: Anthropic News
  ✅ 成功: 1 条
📡 拉取: OpenAI Blog
  ✅ 成功: 1 条
...

📊 聚合完成:
  - 总内容: 50-80 条
  - 包含中文内容: 15-25 条 ✅
```

热点页面应该看到中文标题的内容！🎉
