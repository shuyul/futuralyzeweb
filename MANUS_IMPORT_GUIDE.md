# 📱 Manus 导入指南

## 🎯 目标
将 Futuralyze 项目导入 Manus 继续开发

---

## 方法1: GitHub 导入（推荐）⭐

### 步骤1: 准备 GitHub 仓库

1. **访问 GitHub 创建新仓库:**
   - 打开: https://github.com/new
   - 仓库名: `futuralyze` 或 `personal-website`
   - 选择: Public 或 Private
   - ❌ **不要勾选** "Add a README file"
   - ❌ **不要勾选** "Add .gitignore"
   - ❌ **不要勾选** "Choose a license"
   - 点击 "Create repository"

2. **复制仓库地址**
   - 创建成功后，会显示类似：`https://github.com/你的用户名/futuralyze.git`
   - 复制这个地址

### 步骤2: 推送代码到 GitHub

在 Figma Make 终端运行：

```bash
cd /workspaces/default/code

# 1. 创建 .gitignore（如果没有）
cat > .gitignore << 'EOF'
node_modules/
.pnpm-store/
dist/
build/
.env
.env.local
.DS_Store
EOF

# 2. 初始化 Git（如果还没有）
git init

# 3. 配置用户信息
git config user.email "你的邮箱@example.com"
git config user.name "你的名字"

# 4. 添加所有文件
git add .

# 5. 创建提交
git commit -m "Initial commit: Futuralyze editorial website"

# 6. 连接到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/futuralyze.git

# 7. 推送
git branch -M main
git push -u origin main
```

### 步骤3: 在 Manus 中导入

1. **打开 Manus**
2. **选择导入选项**
   - 寻找 "Import from GitHub" 或 "Open from GitHub"
   - 如果没有这个选项，选择 "New Project" → "Import existing code"

3. **粘贴仓库地址**
   - 输入: `https://github.com/你的用户名/futuralyze`

4. **等待导入完成**

---

## 方法2: 直接在 Manus 中对话（如果支持）

如果 Manus 支持直接对话式开发：

### 步骤1: 创建新项目
在 Manus 中选择 "New Project"

### 步骤2: 复制项目上下文
打开 `/workspaces/default/code/SHARE_WITH_AI.md`，复制全部内容

### 步骤3: 发送给 Manus
在 Manus 中发送：

```
我有一个已完成的杂志编辑部风格个人网站，需要你帮我继续开发。

[粘贴 SHARE_WITH_AI.md 的内容]

项目已经完成了基础开发，现在需要[你的需求]。
```

### 步骤4: 逐个复制关键文件

然后依次复制并发送：

1. **package.json**
```bash
cat /workspaces/default/code/package.json
```

2. **主要页面文件**
```bash
# 首页
cat /workspaces/default/code/src/app/pages/Home.tsx

# 样式
cat /workspaces/default/code/src/styles/theme.css
cat /workspaces/default/code/src/styles/fonts.css
```

3. **其他需要的文件**
根据需要复制其他文件

---

## 方法3: 通过压缩包（如果 Manus 支持上传）

### 步骤1: 创建项目压缩包

```bash
cd /workspaces/default/code

# 创建临时目录
mkdir -p /tmp/futuralyze_clean

# 复制关键文件（排除 node_modules）
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '.env' \
  . /tmp/futuralyze_clean/

# 压缩
cd /tmp
tar -czf futuralyze.tar.gz futuralyze_clean/

echo "✅ 压缩包创建完成: /tmp/futuralyze.tar.gz"
ls -lh /tmp/futuralyze.tar.gz
```

### 步骤2: 上传到 Manus
如果 Manus 支持上传项目压缩包，选择刚创建的 `/tmp/futuralyze.tar.gz`

---

## 🎯 给 Manus 的项目说明

无论用哪种方法导入，都建议在 Manus 中先发送这段说明：

```
这是一个杂志编辑部风格的个人网站项目 - Futuralyze

【设计风格】
- 参考 Monocle 杂志和 awwwards 获奖作品
- 配色: 暖白底 #FAF8F5 + 朱砂红强调 #C4463A（克制使用 <5%）
- 字体: 思源宋体（标题）+ 思源黑体（正文）+ JetBrains Mono（等宽）
- 原则: 留白、克制、编辑部质感

【技术栈】
- React 18 + TypeScript
- Tailwind CSS v4
- Motion/React (Framer Motion)
- Supabase Edge Functions
- React Router

【参考设计】
- https://www.awwwards.com/sites/ksenia-litvinenko
- https://www.awwwards.com/sites/cesarolvr-com

【当前功能】
✅ 博客系统（Markdown 支持）
✅ RSS 热点聚合（12个信源）
✅ AI Agents 展示
✅ 照片图册
✅ Obsidian 笔记集成
✅ 后台管理

【开发要求】
⚠️ 保持杂志编辑部的克制与讲究
⚠️ 朱砂红面积严格控制在 5% 以内
⚠️ 动态效果要微妙，不要浮夸
⚠️ 留白是设计的一部分
⚠️ 文字本身就是视觉元素

详细设计规范见项目中的 SHARE_WITH_AI.md 文件。
```

---

## 🚨 常见问题

### Q: Manus 显示缺少依赖？
A: 在 Manus 终端运行：
```bash
pnpm install
```

### Q: Manus 无法识别 Tailwind v4？
A: 确保 Manus 使用的是最新版本，Tailwind v4 是较新的版本

### Q: 需要配置 Supabase？
A: 是的，需要提供：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

这些信息在 `/workspaces/default/code/utils/supabase/info.ts` 中

### Q: Manus 中如何运行项目？
A: 运行：
```bash
pnpm run dev
```

---

## ✅ 推荐流程总结

**最简单的方式:**

1. 推送到 GitHub（5分钟）
2. 在 Manus 中从 GitHub 导入（1分钟）
3. 发送项目说明和设计要求
4. 开始开发！

**如果没有 GitHub:**

1. 在 Manus 创建新项目
2. 复制 `SHARE_WITH_AI.md` 发送给 Manus
3. 逐个复制关键文件
4. 运行 `pnpm install`
5. 开始开发！

---

## 📞 需要帮助？

查看这些文件获取更多信息：
- `SHARE_WITH_AI.md` - 完整项目文档
- `QUICK_SHARE.md` - 快速分享模板
- `FINAL_CONFIGURATION.md` - RSS 配置
- `CURRENT_STATUS.md` - 当前状态

祝开发顺利！🚀
