# 快速分享版 - 复制粘贴即用

## 📋 复制给其他AI的完整提示词

```
我有一个杂志编辑部风格的个人网站项目，需要你帮我[修改内容]。

【技术栈】
- React 18 + TypeScript
- Tailwind CSS v4
- Motion/React (motion/react，即 Framer Motion)
- Supabase Edge Functions
- React Router

【设计风格】
**核心理念:** 杂志编辑部风格（参考 Monocle、Stratechery）

**配色方案（严格遵守）:**
- 暖白底色: #FAF8F5
- 近黑文字: #1A1A1A
- 暖灰辅助: #6B6560
- 朱砂红强调: #C4463A（⚠️ 克制使用，面积<5%）
- 藏蓝辅助: #2C3E50
- 分割线: #E8E3DD

**字体系统:**
- 中文标题: 思源宋体 (Noto Serif SC, 700, 32-48px)
- 中文正文: 思源黑体 (Noto Sans SC, 400, 16-17px, 行高1.8)
- 英文标题: Playfair Display
- 英文正文: Source Sans 3
- 等宽字体: JetBrains Mono (日期/编号/标签, 小字号, letter-spacing加大)

**设计原则（必须遵循）:**
1. ✅ 留白是设计的一部分，不是"没东西放"
2. ✅ 文字本身就是视觉元素
3. ✅ 克制的动态效果（微妙的hover、轻微的过渡）
4. ✅ 不规则布局打破网格（参考awwwards获奖作品）
5. ✅ 编辑部级别的排版讲究

**避免的设计:**
- ❌ 科技蓝渐变 SaaS 风格
- ❌ 暗色霓虹赛博朋克
- ❌ 卡片堆砌仪表盘
- ❌ 过度的动画效果

**参考网站（务必查看）:**
- https://www.awwwards.com/sites/ksenia-litvinenko
- https://www.awwwards.com/sites/cesarolvr-com
- https://monocle.com
- https://stratechery.com

【当前CSS变量定义】
```css
:root {
  /* 编辑部配色 */
  --editorial-warm-white: #FAF8F5;
  --editorial-near-black: #1A1A1A;
  --editorial-warm-gray: #6B6560;
  --editorial-vermillion: #C4463A;
  --editorial-navy: #2C3E50;
  --editorial-divider: #E8E3DD;

  /* 字体 */
  --font-serif-cn: 'Noto Serif SC', serif;
  --font-sans-cn: 'Noto Sans SC', sans-serif;
  --font-serif-en: 'Playfair Display', serif;
  --font-sans-en: 'Source Sans 3', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

【排版细节】
- 正文区域最大宽度: 680px
- 标题与正文间距: ≥32px
- 段落间距: 24px margin
- 序号: 等宽字体 + 朱砂色
- 标签: 小号字 + letter-spacing 1.5px + 细线框
- 日期格式: 2026.04.22
- Hover: 文字下划线从左向右展开（0.4s）
- 引用块: 左侧3px朱砂色竖线

【具体需求】
[在这里描述你的需求]

【当前代码】
[在这里粘贴需要修改的代码]
```

---

## 🎯 针对不同AI的快速提示

### 给 Cursor AI:
1. 打开项目后，创建 `.cursorrules` 文件
2. 复制以下内容：

```
杂志编辑部风格网站 - Futuralyze

设计参考: Monocle、awwwards.com/sites/ksenia-litvinenko
配色: 暖白#FAF8F5 + 朱砂红#C4463A(克制<5%)
字体: 思源宋体(标题) + 思源黑体(正文) + JetBrains Mono(等宽)
技术: React18 + TS + Tailwind v4 + Motion/React + Supabase

原则:
1. 留白是设计的一部分
2. 文字即设计，不是装饰
3. 动态效果克制（微妙hover，轻过渡）
4. 不规则布局打破网格
5. 编辑部级别的讲究

避免:
- SaaS科技蓝渐变风格
- 赛博朋克霓虹暗色
- 卡片堆砌仪表盘
- 过度动画
```

### 给 v0.dev:
```
帮我[修改内容]，保持杂志编辑部风格。

样式要求:
- 参考 https://www.awwwards.com/sites/ksenia-litvinenko
- 配色: #FAF8F5底 + #C4463A强调色(克制<5%)
- 字体: Noto Serif SC(标题) + Noto Sans SC(正文)
- 动效: 微妙hover + 轻过渡，不要炫技

代码:
[粘贴代码]
```

### 给 ChatGPT/Claude (长对话):

**第1条消息:**
```
我有个杂志编辑部风格的个人网站，准备发送代码让你修改。

设计风格:
- 参考 Monocle 杂志 + awwwards 获奖作品
- 配色: 暖白#FAF8F5 + 朱砂红#C4463A(克制)
- 字体: 思源宋体+黑体
- 动效: 克制、微妙

技术栈: React18 + TS + Tailwind v4 + Motion/React

参考: https://www.awwwards.com/sites/ksenia-litvinenko

准备好说"ready"
```

**第2条消息(对方回复ready后):**
```
[粘贴SHARE_WITH_AI.md的完整内容]
```

**第3条消息:**
```
[粘贴具体代码]

需求: [具体描述]

记住保持:
- 杂志克制感
- 朱砂红<5%
- 动效微妙
- 留白充足
```

---

## 📝 常用代码片段

### 获取完整首页代码:
```bash
# 查看首页文件
cat /workspaces/default/code/src/app/pages/Home.tsx
```

### 获取CSS变量:
```bash
# 查看主题文件
cat /workspaces/default/code/src/styles/theme.css
```

### 获取字体配置:
```bash
# 查看字体文件
cat /workspaces/default/code/src/styles/fonts.css
```

---

## 🚀 GitHub分享步骤

如果你想用Git分享给其他AI:

```bash
cd /workspaces/default/code

# 1. 初始化
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Futuralyze - Editorial style personal website

- Monocle magazine inspired design
- React18 + TypeScript + Tailwind v4
- Motion/React animations
- Supabase backend
- RSS aggregation system
- Obsidian integration"

# 4. 连接远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/仓库名.git

# 5. 推送
git push -u origin main
```

然后发给AI:
```
我的项目在 https://github.com/你的用户名/仓库名

这是杂志编辑部风格的个人网站:
- 参考 Monocle、awwwards
- 配色: 暖白#FAF8F5 + 朱砂红#C4463A(克制)
- React18 + Tailwind v4 + Motion/React

请帮我[具体需求]
```

---

## ⚡ 极简版(50字内)

```
杂志编辑部风格网站
配色: #FAF8F5底+#C4463A强调(<5%)
字体: Noto Serif SC
技术: React+Tailwind v4+Motion
参考: awwwards.com/sites/ksenia-litvinenko
需求: [描述]
```
