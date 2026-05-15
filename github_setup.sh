#!/bin/bash

echo "🚀 准备推送到 GitHub..."

# 检查是否已经初始化
if [ ! -d .git ]; then
  echo "📦 初始化 Git 仓库..."
  git init
  git add .
  git commit -m "Futuralyze - Editorial style personal website

Project Stack:
- React 18 + TypeScript
- Tailwind CSS v4
- Motion/React (Framer Motion)
- Supabase Edge Functions

Design Style:
- Editorial/Magazine aesthetic (Monocle-inspired)
- Color: Warm white #FAF8F5 + Vermillion #C4463A
- Typography: Noto Serif SC + Noto Sans SC + JetBrains Mono

Features:
- Blog system with markdown
- RSS aggregation (12 sources)
- AI Agents showcase
- Photo gallery
- Obsidian integration
- Admin panel

See SHARE_WITH_AI.md for complete documentation."
else
  echo "✅ Git 仓库已存在"
fi

echo ""
echo "📝 下一步操作:"
echo "1. 在 GitHub 创建新仓库: https://github.com/new"
echo "2. 仓库名建议: futuralyze 或 personal-website"
echo "3. 不要勾选 README、.gitignore、license（我们已经有了）"
echo "4. 创建后，复制仓库地址"
echo "5. 运行以下命令（替换仓库地址）:"
echo ""
echo "   git remote add origin https://github.com/你的用户名/仓库名.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
