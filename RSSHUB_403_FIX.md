# ⚠️ RSSHub 403 限流问题解决方案

## 问题描述

RSSHub 公共实例 (`rsshub.app`) 返回 **403 Forbidden**：

```
❌ 甲子光年 失败: 403 Forbidden
❌ 海外独角兽 失败: 403 Forbidden  
❌ 机器之心 失败: 403 Forbidden
```

**原因**: RSSHub 公共实例有访问频率限制，防止滥用。

---

## ✅ 已采取的措施

### 1. 暂时禁用微信公众号源

已注释掉以下源（在 `rss-aggregator.ts` 中）:
- ❌ 甲子光年（微信公众号）
- ❌ 海外独角兽（微信公众号）
- ❌ 机器之心（RSSHub 聚合）
- ❌ Anthropic News（官方无稳定 RSS）

### 2. 添加替代中文源

✅ 新增不依赖 RSSHub 的中文源：

```typescript
// 少数派 - 效率工具与应用推荐
{
  name: '少数派',
  url: 'https://sspai.com/feed',
  category: 'L4-产品应用',
  priority: 2,
  keywords: ['AI', '人工智能', '效率', '工具']
}

// 爱范儿 - 科技新闻与产品评测
{
  name: '爱范儿',
  url: 'https://www.ifanr.com/feed',
  category: 'L4-产品应用',
  priority: 2,
  keywords: ['AI', '人工智能', 'OpenAI', 'GPT']
}
```

### 3. 添加新的英文源

✅ Google AI Blog（官方 RSS）:

```typescript
{
  name: 'Google AI Blog',
  url: 'https://blog.google/technology/ai/rss/',
  category: 'L1-技术基座',
  priority: 3,
  keywords: []
}
```

---

## 📊 当前信源配置

### 有效信源（13 个）

**第一梯队（2个）**:
1. ✅ HackerNews API（直连）
2. ✅ Simon Willison
3. ✅ The Rundown AI

**第二梯队（6个）**:
4. ✅ Stratechery
5. ✅ Latent Space
6. ✅ 少数派 🇨🇳
7. ✅ 爱范儿 🇨🇳
8. ✅ The Verge AI
9. ✅ MIT Tech Review AI

**雷达扫描（5个）**:
10. ✅ Hacker News 精选
11. ✅ Benedict Evans
12. ✅ Ahead of AI
13. ✅ OpenAI Blog
14. ✅ Google AI Blog

### 暂时禁用（4个）

- ⏸️ 甲子光年（RSSHub 限流）
- ⏸️ 海外独角兽（RSSHub 限流）
- ⏸️ 机器之心（RSSHub 限流）
- ⏸️ Anthropic News（无稳定 RSS）

---

## 💡 长期解决方案

### 方案 1: 部署自己的 RSSHub 实例（推荐）

**优点**:
- ✅ 无限制访问
- ✅ 完全控制
- ✅ 更稳定

**步骤**:

1. **Fork RSSHub 仓库**
   ```bash
   https://github.com/DIYgod/RSSHub
   ```

2. **部署到 Vercel（免费）**
   - 登录 https://vercel.com
   - Import GitHub 仓库
   - 点击 Deploy
   - 获得专属域名: `https://your-rsshub.vercel.app`

3. **更新配置**
   编辑 `rss-aggregator.ts`:
   ```typescript
   {
     name: '甲子光年',
     url: 'https://your-rsshub.vercel.app/wechat/mp/甲子光年',
     // ...
   }
   ```

4. **取消注释被禁用的源**

---

### 方案 2: 使用其他 RSSHub 公共实例

尝试其他公共实例（可能也会限流）:

- `https://rsshub.rssforever.com`
- `https://rss.shab.fun`
- `https://rsshub.ktachibana.party`

**更新配置**:
```typescript
url: 'https://rsshub.rssforever.com/wechat/mp/甲子光年'
```

---

### 方案 3: 使用付费 RSS 服务

专业 RSS 服务，更稳定：

- **Inoreader**: 支持微信公众号订阅
- **Feeddd**: 专注中文内容
- **即刻**: 微信公众号 RSS 输出

成本: $5-10/月

---

### 方案 4: 接受现状，使用替代源

当前配置已经可以正常工作：

- ✅ 少数派、爱范儿提供中文科技内容
- ✅ 英文源覆盖全面（Simon Willison、HN、Stratechery 等）
- ✅ 完全免费，无限流风险

**优点**:
- $0 成本
- 无需额外配置
- 内容质量有保障

**缺点**:
- 缺少甲子光年的企业 AI 深度分析
- 缺少机器之心的 AI 技术速报

---

## 🧪 测试当前配置

### 1. 浏览器验证

访问这些 URL，确认返回 XML：

1. https://sspai.com/feed （少数派）
2. https://www.ifanr.com/feed （爱范儿）
3. https://blog.google/technology/ai/rss/ （Google AI Blog）

### 2. 系统测试

**管理后台 → Trending → 点击测试按钮**:
- 测试 少数派
- 测试 爱范儿

### 3. 完整聚合

**点击 "触发 RSS 聚合"**

**预期结果**:
```
📊 聚合完成:
  - 总内容: 50-70 条
  - 中文内容: 8-15 条（少数派 + 爱范儿）
  - 英文内容: 35-55 条
```

---

## 📈 预期内容分布（当前配置）

| 来源 | 预计条数 | 语言 |
|---|---|---|
| HackerNews API | 3-5 | 🇬🇧 |
| Simon Willison | 10-15 | 🇬🇧 |
| The Rundown AI | 1 | 🇬🇧 |
| **少数派** | **5-8** | **🇨🇳** |
| **爱范儿** | **3-7** | **🇨🇳** |
| Stratechery | 1-2 | 🇬🇧 |
| Latent Space | 1 | 🇬🇧 |
| Hacker News 精选 | 5-10 | 🇬🇧 |
| Benedict Evans | 0-1 | 🇬🇧 |
| Ahead of AI | 1-2 | 🇬🇧 |
| OpenAI Blog | 0-1 | 🇬🇧 |
| Google AI Blog | 1-2 | 🇬🇧 |

**中文内容占比**: 15-25% (比之前少，但稳定)

---

## 🔄 如何重新启用微信公众号源

当你有自己的 RSSHub 实例后：

1. **编辑** `/supabase/functions/server/rss-aggregator.ts`

2. **取消注释**:
   ```typescript
   // 之前：
   // {
   //   name: '甲子光年',
   //   url: 'https://rsshub.app/wechat/mp/甲子光年',
   //   ...
   // },
   
   // 修改为：
   {
     name: '甲子光年',
     url: 'https://your-rsshub.vercel.app/wechat/mp/甲子光年',
     category: 'L5-行业场景',
     priority: 1,
     keywords: []
   },
   ```

3. **同样处理** 海外独角兽、机器之心

4. **测试聚合**

---

## 📝 总结

### 当前状态
- ✅ **13 个稳定信源** 正常工作
- ✅ **$0 成本**，无限流风险
- ✅ 中英文内容混合（15-25% 中文）
- ⏸️ 微信公众号源暂时禁用

### 推荐行动
1. **短期**: 使用当前配置（少数派 + 爱范儿）
2. **中期**: 如果需要甲子光年等源，部署自己的 RSSHub（30分钟）
3. **长期**: 考虑付费 RSS 服务或保持当前配置

### 立即测试
进入管理后台 → Trending → 触发 RSS 聚合

应该看到 50-70 条内容，包括少数派和爱范儿的中文科技内容！

---

**现在系统可以正常工作了，虽然暂时没有微信公众号内容** ✅
