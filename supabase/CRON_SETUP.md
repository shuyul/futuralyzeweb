# RSS 聚合定时任务设置

## 当前实现

目前支持**手动触发** RSS 聚合：
- 在"热点"页面点击"手动刷新"按钮
- 或在管理页面添加专门的聚合按钮

## 如何设置自动定时任务（生产环境）

### 方案 1: Supabase Dashboard (推荐)

1. 登录 Supabase Dashboard
2. 进入项目 → Database → Cron Jobs
3. 创建新任务：

```sql
-- 每天凌晨 2 点执行
SELECT cron.schedule(
  'aggregate-rss-daily',
  '0 2 * * *', 
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-41c81a90/aggregate-rss',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### 方案 2: GitHub Actions (免费)

创建 `.github/workflows/rss-aggregate.yml`:

```yaml
name: RSS Aggregation

on:
  schedule:
    - cron: '0 2 * * *' # 每天凌晨 2 点（UTC）
  workflow_dispatch: # 允许手动触发

jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger RSS Aggregation
        run: |
          curl -X POST \
            https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-41c81a90/aggregate-rss \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### 方案 3: 浏览器端定时（简单但需页面打开）

在前端添加：

```typescript
// 每 2 小时自动聚合（仅当页面打开时）
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      handleAggregate();
    }
  }, 2 * 60 * 60 * 1000); // 2 小时

  return () => clearInterval(interval);
}, []);
```

## 推荐策略

- **开发/测试阶段**: 手动触发
- **个人使用**: 每天手动点击一次 或 GitHub Actions
- **生产环境**: Supabase Cron Jobs

## 成本

- 手动触发: $0
- GitHub Actions: $0 (免费额度充足)
- Supabase Cron: $0 (包含在免费计划中)
