# 🇨🇳 中文信源调试指南

## 问题：看不到中文内容

如果聚合后没有看到中文信源（甲子光年、海外独角兽、机器之心），可能的原因：

---

## 🔍 诊断步骤

### 1. 测试单个中文源（最快）

**在管理后台 → Trending 标签页**

找到黄色卡片"🧪 测试中文信源"，点击：
- 测试 甲子光年
- 测试 海外独角兽  
- 测试 机器之心

**如果测试成功**（✅ 显示内容长度和预览）→ 说明源可用，问题在过滤或时间窗口

**如果测试失败**（❌ HTTP 错误）→ 说明源本身有问题

---

## 🐛 常见问题

### 问题 1: 微信公众号代理失败

**症状**:
```
❌ 甲子光年 失败: 502
❌ 海外独角兽 失败: 502
```

**原因**: `werss.bestblogs.dev` 第三方代理服务可能：
- 暂时不可用
- 被限流
- 微信公众号 ID 变更

**解决方案**:

#### 方案 A: 等待恢复
第三方服务通常会自动恢复，等待 1-24 小时后重试

#### 方案 B: 使用备用代理（推荐）
编辑 `/supabase/functions/server/rss-aggregator.ts`:

```typescript
// 甲子光年备用代理
{
  name: '甲子光年',
  url: 'https://rsshub.app/wechat/mp/甲子光年', // RSSHub 公共实例
  category: 'L5-行业场景',
  priority: 1,
  keywords: []
}
```

或使用其他 RSSHub 实例：
- `https://rsshub.rssforever.com/wechat/mp/甲子光年`
- `https://rss.shab.fun/wechat/mp/甲子光年`

#### 方案 C: 自己部署 RSSHub
1. Fork https://github.com/DIYgod/RSSHub
2. 部署到 Vercel（免费）
3. 使用自己的域名

---

### 问题 2: 关键词过滤太严格

**症状**: 测试源成功，但聚合后 0 条内容

**原因**: 之前的关键词过滤可能排除了一些内容

**解决**: ✅ 已修复
- 甲子光年: 移除关键词过滤
- 海外独角兽: 移除关键词过滤
- 机器之心: 移除关键词过滤

所有中文源现在保留全部内容。

---

### 问题 3: 时间窗口太短

**症状**: 
```
找到 5 条内容
时间过滤（24h内）: 0 条
```

**原因**: 甲子光年每周只发 3-5 篇，24 小时窗口太短

**解决**: ✅ 已修复
- 时间窗口从 24 小时 → **72 小时（3 天）**
- 这样可以覆盖甲子光年的发文周期

---

### 问题 4: 机器之心 RSS 格式问题

**症状**:
```
❌ 机器之心 返回的不是有效的 RSS/Atom feed
```

**原因**: 机器之心官网可能改版或限制 RSS

**解决**: 尝试备用 URL

```typescript
{
  name: '机器之心',
  url: 'https://rsshub.app/jiqizhixin/latest', // RSSHub 代理
  category: 'L1-技术基座',
  priority: 2,
  keywords: []
}
```

---

## ✅ 已优化的配置

当前中文源配置（已移除过滤）:

```typescript
{
  name: '甲子光年',
  url: 'https://werss.bestblogs.dev/feeds/MP_WXS_3599245772.atom',
  category: 'L5-行业场景',
  priority: 1,
  keywords: [] // ✅ 无过滤，保留全部
},
{
  name: '海外独角兽',
  url: 'https://werss.bestblogs.dev/feeds/MP_WXS_3869640945.atom',
  category: 'L4-产品应用',
  priority: 2,
  keywords: [] // ✅ 无过滤，保留全部
},
{
  name: '机器之心',
  url: 'https://www.jiqizhixin.com/rss',
  category: 'L1-技术基座',
  priority: 2,
  keywords: [] // ✅ 无过滤，保留全部
}
```

---

## 🧪 手动测试 RSS 源

### 方法 1: 浏览器直接访问

在浏览器打开以下 URL，看是否返回 XML：

1. **甲子光年**: https://werss.bestblogs.dev/feeds/MP_WXS_3599245772.atom
2. **海外独角兽**: https://werss.bestblogs.dev/feeds/MP_WXS_3869640945.atom
3. **机器之心**: https://www.jiqizhixin.com/rss

如果看到 XML 内容 → 源正常  
如果看到错误页面 → 源有问题

### 方法 2: 使用 curl 测试

```bash
# 测试甲子光年
curl -I https://werss.bestblogs.dev/feeds/MP_WXS_3599245772.atom

# 应该看到 200 OK
```

### 方法 3: RSS 阅读器测试

用 Feedly 或 Inoreader 订阅这些 URL，看是否能正常显示。

---

## 📊 预期聚合结果

成功配置后，每次聚合应该看到：

```
📡 拉取: 甲子光年
  找到 10 条内容
  时间过滤（72h内）: 3 条
  关键词过滤: 3 条
  ✅ 成功: 3 条（示例: 请回答 2026：38 位 AI 关键人物...）

📡 拉取: 海外独角兽
  找到 8 条内容
  时间过滤（72h内）: 2 条
  关键词过滤: 2 条
  ✅ 成功: 2 条

📡 拉取: 机器之心
  找到 50 条内容
  时间过滤（72h内）: 30 条
  关键词过滤: 30 条
  ✅ 成功: 30 条
```

---

## 🔧 快速修复建议

### 如果甲子光年/海外独角兽都失败

**立即行动**: 切换到 RSSHub

```typescript
// 编辑 rss-aggregator.ts
{
  name: '甲子光年',
  url: 'https://rsshub.app/wechat/mp/甲子光年',
  // ... 其他配置
}
```

### 如果机器之心失败

**立即行动**: 使用 RSSHub 代理

```typescript
{
  name: '机器之心',
  url: 'https://rsshub.app/jiqizhixin/latest',
  // ... 其他配置
}
```

---

## 📞 获取帮助

1. **查看控制台日志** (F12 → Console)
   - 看具体哪个源失败
   - 看错误码（502/503/超时）

2. **使用测试功能**
   - 管理后台 → Trending → 测试中文信源

3. **检查备用方案**
   - RSSHub 公共实例列表: https://docs.rsshub.app/guide/instances

---

## ✨ 成功标志

聚合成功后，热点页面应该看到：
- 🇨🇳 中文标题的内容
- 来源显示：甲子光年、海外独角兽、机器之心
- 描述包含中文内容

如果还是看不到，请查看控制台完整日志并反馈具体错误。
