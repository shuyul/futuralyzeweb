# 分享给其他 Coding AI 的完整指南

## 🎯 项目概述

**Futuralyze** - 杂志编辑部风格的个人网站

### 技术栈
- React 18 + TypeScript
- Tailwind CSS v4
- Motion/React (Framer Motion)
- Supabase Edge Functions
- React Router

### 设计风格
**参考作品:**
- Monocle 杂志
- https://www.awwwards.com/sites/ksenia-litvinenko
- https://www.awwwards.com/sites/cesarolvr-com

**配色方案 (杂志编辑部风格):**
```css
--editorial-warm-white: #FAF8F5;  /* 暖白底色 */
--editorial-near-black: #1A1A1A;  /* 近黑文字 */
--editorial-warm-gray: #6B6560;   /* 暖灰辅助 */
--editorial-vermillion: #C4463A;  /* 朱砂红强调（克制使用 <5%） */
--editorial-navy: #2C3E50;        /* 藏蓝辅助 */
--editorial-divider: #E8E3DD;     /* 分割线 */
```

**字体系统:**
- 中文标题: 思源宋体 (Noto Serif SC)
- 中文正文: 思源黑体 (Noto Sans SC)
- 英文标题: Playfair Display
- 英文正文: Source Sans 3
- 等宽字体: JetBrains Mono (日期、编号、标签)

---

## 📐 设计原则

### ✅ 要做的
- 纸感 - 让人想到高品质印刷物
- 留白是设计的一部分，不是"没东西放"
- 文字本身就是视觉元素
- 少量、克制的装饰性元素（分割线、引号标记、编号）
- 不规则布局打破网格
- 微妙的动态交互

### ❌ 避免的
- 科技蓝 + 渐变的 SaaS 官网既视感
- 暗色霓虹的"赛博朋克"风
- 纯白极简到没有性格
- 卡片堆砌的仪表盘式布局
- 过度的动画效果

---

## 📁 项目结构

```
/workspaces/default/code/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # 首页（最新重新设计）⭐
│   │   │   ├── Blog.tsx          # 博客列表
│   │   │   ├── BlogPost.tsx      # 文章详情
│   │   │   ├── Trending.tsx      # RSS热点聚合
│   │   │   ├── Agents.tsx        # AI Agents展示
│   │   │   ├── Gallery.tsx       # 照片图册
│   │   │   ├── Resources.tsx     # Obsidian资料库
│   │   │   └── Admin.tsx         # 后台管理
│   │   ├── App.tsx               # 主应用
│   │   └── routes.tsx            # 路由配置
│   ├── styles/
│   │   ├── fonts.css             # 字体引用 ⭐
│   │   ├── theme.css             # 设计token ⭐
│   │   └── index.css             # 全局样式
│   └── utils/
│       ├── api.ts                # API封装
│       └── supabase/             # Supabase配置
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx         # 服务器入口
│           ├── routes.ts         # API路由
│           ├── rss-aggregator.ts # RSS聚合逻辑
│           └── kv_store.tsx      # 数据存储
└── package.json
```

---

## 🎨 关键设计细节

### 排版规则
- 正文区域最大宽度: 680px
- 标题与正文间距: ≥32px
- 段落间距: 用 margin 而非空行
- 中英文之间: 自动加半角空格

### 微细节（让"好看"变成"讲究"）
- 文章列表序号: 等宽字体 + 朱砂色
- 标签样式: 小号字 + letter-spacing 1.5px + 细线框
- 日期格式: 统一 2026.04.22 格式
- Hover效果: 文字下划线从左向右展开
- 页面切换: 轻微 fade 过渡（200ms）
- 引用块: 左侧 3px 朱砂色竖线，上下圆角

### 响应式
- 移动端正文字号: 不小于 16px
- 移动端行高: 可适当缩小到 1.75
- 导航: 变为汉堡菜单
- 卡片布局: 从多列变一列

---

## 🔧 核心功能

### 1. 博客系统
- 文章 CRUD
- 分类筛选
- 标签系统
- Markdown 渲染

### 2. RSS 热点聚合
- 12个信源自动抓取
- 时间窗口过滤（72小时）
- 关键词匹配
- 去重 + 优先级排序

### 3. AI Agents 展示
- 工具展示卡片
- iframe嵌入模式
- 分类导航

### 4. Obsidian 集成
- GitHub 仓库同步
- YAML front matter 解析
- publish: true 过滤
- 双向链接支持

### 5. 照片图册
- 网格布局
- 灯箱查看
- 分类筛选

---

## 🚀 分享给不同 AI 的方法

### 方法 A: 给 Cursor / Windsurf

1. **推送到 GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - Futuralyze editorial website"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

2. **创建 .cursorrules 文件:**
```
这是杂志编辑部风格的个人网站项目。

设计风格参考：
- Monocle 杂志
- awwwards.com/sites/ksenia-litvinenko
- awwwards.com/sites/cesarolvr-com

配色方案：
- 暖白底 #FAF8F5
- 近黑文字 #1A1A1A
- 朱砂红强调 #C4463A（克制使用<5%）

技术栈：React + TypeScript + Tailwind v4 + Motion/React + Supabase

修改时遵循：
1. 保持杂志编辑部的克制与讲究
2. 动态交互但不过度
3. 留白是设计的一部分
4. 文字本身就是视觉元素
```

---

### 方法 B: 给 v0.dev / Bolt.new

**提示词模板:**

```
我有一个杂志编辑部风格的个人网站，需要你帮我[修改内容]。

【项目背景】
- 设计风格: 杂志编辑部（参考 Monocle、awwwards 获奖作品）
- 技术栈: React 18 + TypeScript + Tailwind v4 + Motion/React
- 字体: 思源宋体(标题) + 思源黑体(正文) + JetBrains Mono(等宽)

【配色方案】
- 暖白底色: #FAF8F5
- 近黑文字: #1A1A1A
- 暖灰辅助: #6B6560
- 朱砂红强调: #C4463A（克制使用，面积<5%）
- 藏蓝辅助: #2C3E50
- 分割线: #E8E3DD

【设计原则】
1. 留白是设计的一部分
2. 文字本身就是视觉元素
3. 克制的动态效果（参考 awwwards.com/sites/ksenia-litvinenko）
4. 不规则布局打破网格
5. 编辑部级别的排版讲究

【参考链接】
- https://www.awwwards.com/sites/ksenia-litvinenko
- https://www.awwwards.com/sites/cesarolvr-com

【当前代码】
[粘贴具体文件代码]

【具体需求】
[描述你想修改什么]
```

---

### 方法 C: 给 Claude / ChatGPT（对话式）

**第一条消息:**
```
我有一个杂志编辑部风格的个人网站项目需要你帮忙。先了解一下项目背景：

技术栈:
- React 18 + TypeScript
- Tailwind CSS v4
- Motion/React (framer-motion)
- Supabase

设计风格:
- 参考 Monocle 杂志和 awwwards 获奖作品
- 配色: 暖白底#FAF8F5 + 朱砂红强调#C4463A
- 字体: 思源宋体（标题）+ 思源黑体（正文）
- 原则: 留白、克制、编辑部质感

设计参考网站:
- https://www.awwwards.com/sites/ksenia-litvinenko
- https://www.awwwards.com/sites/cesarolvr-com

准备好后我会发送具体代码和需求。
```

**第二条消息:**
```
[粘贴关键文件代码，比如 Home.tsx]

我需要你帮我[具体需求]。

注意保持：
1. 杂志编辑部的克制感
2. 朱砂红的使用不超过5%
3. 动态效果要微妙不浮夸
4. 排版讲究、留白充足
```

---

## 📦 关键文件内容速查

### 1. fonts.css
路径: `/workspaces/default/code/src/styles/fonts.css`
作用: 引入Google Fonts字体

### 2. theme.css  
路径: `/workspaces/default/code/src/styles/theme.css`
作用: CSS变量定义（包含编辑部配色）

### 3. Home.tsx
路径: `/workspaces/default/code/src/app/pages/Home.tsx`
作用: 首页设计（最新重新设计，包含动态效果）

### 4. api.ts
路径: `/workspaces/default/code/src/utils/api.ts`
作用: 所有API调用封装

---

## 💡 常见需求提示词

### 需求1: 优化移动端适配
```
帮我优化这个页面的移动端适配。

要求:
- 保持杂志编辑部风格
- 移动端字号不小于16px
- 行高适当缩小到1.75
- 多列布局改为单列
- 保留核心动态效果
- 简化复杂的鼠标hover效果

[粘贴代码]
```

### 需求2: 增加页面过渡动画
```
帮我为路由切换添加过渡动画。

要求:
- 轻微fade效果（200ms）
- 符合杂志风格的克制感
- 使用Motion/React实现
- 不要过度动画

[粘贴代码]
```

### 需求3: 调整配色
```
我觉得朱砂红#C4463A使用面积有点大，帮我调整。

要求:
- 朱砂红面积控制在5%以内
- 保持重点强调作用
- 其他颜色保持不变
- 维持整体杂志风格

[粘贴代码]
```

---

## 🔗 重要链接

- **设计参考1:** https://www.awwwards.com/sites/ksenia-litvinenko
- **设计参考2:** https://www.awwwards.com/sites/cesarolvr-com
- **字体: 思源宋体:** https://fonts.google.com/noto/specimen/Noto+Serif+SC
- **字体: Playfair Display:** https://fonts.google.com/specimen/Playfair+Display
- **Motion文档:** https://motion.dev/docs/react-quick-start

---

## ✅ 当前状态

**已完成:**
- ✅ 首页重新设计（杂志风格 + awwwards动态元素）
- ✅ 所有数据使用真实API（不再是mock）
- ✅ RSS聚合系统运行（12个信源）
- ✅ Obsidian GitHub同步集成
- ✅ 配色系统完善
- ✅ 字体系统完整

**待优化:**
- 移动端适配优化
- 页面切换过渡动画
- SEO优化
- 性能优化（图片懒加载等）

---

## 📞 使用建议

1. **先阅读设计原则** - 了解"杂志编辑部风格"的核心理念
2. **查看参考链接** - 理解"克制的丰富"是什么感觉
3. **复制关键文件** - 特别是 theme.css 和 Home.tsx
4. **使用提示词模板** - 确保AI理解设计方向
5. **强调配色克制** - 朱砂红<5%很重要！

---

**最后提醒:** 这是一个注重品质感和克制的项目，任何修改都应该保持"编辑部级别的讲究"，而不是"炫技式的花哨"。
