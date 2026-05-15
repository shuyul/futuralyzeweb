/**
 * 文章格式检查和自动排版工具
 */

export interface FormatIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

/**
 * 检查文章格式问题
 */
export function checkFormat(content: string): FormatIssue[] {
  const issues: FormatIssue[] = [];
  const lines = content.split('\n');

  // 1. 检查标题格式
  const h1Count = content.match(/^# /gm)?.length || 0;
  if (h1Count === 0) {
    issues.push({
      type: 'warning',
      message: '建议添加一级标题 (# 标题)',
    });
  } else if (h1Count > 1) {
    issues.push({
      type: 'warning',
      message: '建议只使用一个一级标题',
    });
  }

  // 2. 检查段落间空行
  let emptyLineCount = 0;
  lines.forEach((line, index) => {
    if (line.trim() === '') {
      emptyLineCount++;
      if (emptyLineCount > 2) {
        issues.push({
          type: 'info',
          message: `第 ${index + 1} 行：连续空行过多`,
          line: index + 1,
        });
      }
    } else {
      emptyLineCount = 0;
    }
  });

  // 3. 检查中英文混排空格
  const chineseEnglishPattern = /([\u4e00-\u9fa5])([a-zA-Z0-9])|([a-zA-Z0-9])([\u4e00-\u9fa5])/g;
  lines.forEach((line, index) => {
    const matches = line.match(chineseEnglishPattern);
    if (matches && matches.length > 2) {
      issues.push({
        type: 'info',
        message: `第 ${index + 1} 行：建议在中英文之间添加空格`,
        line: index + 1,
      });
    }
  });

  // 4. 检查中文标点
  const wrongPunctuation = /[，。！？：；""''（）]/g;
  lines.forEach((line, index) => {
    if (line.match(wrongPunctuation)) {
      issues.push({
        type: 'info',
        message: `第 ${index + 1} 行：检测到中文标点，建议统一使用英文标点`,
        line: index + 1,
      });
    }
  });

  // 5. 检查行尾空格
  lines.forEach((line, index) => {
    if (line.endsWith(' ') && line.trim() !== '') {
      issues.push({
        type: 'info',
        message: `第 ${index + 1} 行：行尾有多余空格`,
        line: index + 1,
      });
    }
  });

  // 6. 检查列表格式
  const listPattern = /^[*\-+] /;
  let inList = false;
  lines.forEach((line, index) => {
    if (listPattern.test(line.trim())) {
      if (!inList && index > 0 && lines[index - 1].trim() !== '') {
        issues.push({
          type: 'info',
          message: `第 ${index + 1} 行：列表前建议添加空行`,
          line: index + 1,
        });
      }
      inList = true;
    } else if (line.trim() !== '') {
      inList = false;
    }
  });

  return issues;
}

/**
 * 自动排版优化
 */
export function autoFormat(content: string): string {
  let formatted = content;

  // 1. 统一换行符
  formatted = formatted.replace(/\r\n/g, '\n');

  // 2. 移除行尾空格
  formatted = formatted.replace(/ +$/gm, '');

  // 3. 统一多个空行为一个空行
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // 4. 智能识别中文序号标题并转换为 Markdown
  // 匹配: 一. 、二. 、三. 等开头的行
  formatted = formatted.replace(/^([一二三四五六七八九十百千万]+)[.、][ ]?(.+)$/gm, '## $1. $2');
  // 匹配: 1. 、2. 、3. 等开头的行（如果后面是标题性内容）
  formatted = formatted.replace(/^(\d+)[.、][ ]?([^，。！？,\.!?]{5,30})$/gm, '## $1. $2');
  // 匹配: (一)、(二)、(三) 等格式
  formatted = formatted.replace(/^[（(]([一二三四五六七八九十]+)[)）][ ]?(.+)$/gm, '### ($1) $2');
  // 匹配: (1)、(2)、(3) 等格式
  formatted = formatted.replace(/^[（(](\d+)[)）][ ]?(.+)$/gm, '### ($1) $2');

  // 5. 中英文之间添加空格
  formatted = formatted.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9@#$%&])/g, '$1 $2');
  formatted = formatted.replace(/([a-zA-Z0-9@#$%&])([\u4e00-\u9fa5])/g, '$1 $2');

  // 6. 中文与数字之间添加空格
  formatted = formatted.replace(/([\u4e00-\u9fa5])(\d)/g, '$1 $2');
  formatted = formatted.replace(/(\d)([\u4e00-\u9fa5])/g, '$1 $2');

  // 7. 全角标点转半角（在代码块外）
  formatted = formatted
    .replace(/，/g, ',')
    .replace(/。/g, '.')
    .replace(/！/g, '!')
    .replace(/？/g, '?')
    .replace(/：/g, ':')
    .replace(/；/g, ';')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/（/g, '(')
    .replace(/）/g, ')');

  // 8. 标题前后添加空行
  formatted = formatted.replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2');
  formatted = formatted.replace(/(#{1,6} .+)\n([^\n#])/g, '$1\n\n$2');

  // 9. 列表前后添加空行
  formatted = formatted.replace(/([^\n])\n([*\-+] )/g, '$1\n\n$2');
  formatted = formatted.replace(/([*\-+] .+)\n([^\n*\-+])/g, '$1\n\n$2');

  // 10. 代码块前后添加空行
  formatted = formatted.replace(/([^\n])\n(```)/g, '$1\n\n$2');
  formatted = formatted.replace(/(```)\n([^\n])/g, '$1\n\n$2');

  // 11. 移除首尾空白
  formatted = formatted.trim();

  // 12. 确保文件以换行符结尾
  if (!formatted.endsWith('\n')) {
    formatted += '\n';
  }

  return formatted;
}

/**
 * 智能段落优化
 */
export function optimizeParagraphs(content: string): string {
  const lines = content.split('\n');
  const optimized: string[] = [];
  let currentParagraph: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    // 标题、列表、代码块等保持原样
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('+') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('>')
    ) {
      if (currentParagraph.length > 0) {
        optimized.push(currentParagraph.join(' '));
        optimized.push('');
        currentParagraph = [];
      }
      optimized.push(trimmed);
      return;
    }

    // 空行分割段落
    if (trimmed === '') {
      if (currentParagraph.length > 0) {
        optimized.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
      optimized.push('');
      return;
    }

    // 累积段落内容
    currentParagraph.push(trimmed);
  });

  // 添加最后一个段落
  if (currentParagraph.length > 0) {
    optimized.push(currentParagraph.join(' '));
  }

  return optimized.join('\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * 生成格式报告
 */
export function generateFormatReport(content: string): string {
  const issues = checkFormat(content);
  
  if (issues.length === 0) {
    return '✅ 格式检查通过，未发现问题！';
  }

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');

  let report = `发现 ${issues.length} 个格式问题：\n\n`;
  
  if (errors.length > 0) {
    report += `❌ 错误 (${errors.length}):\n`;
    errors.forEach(e => report += `  - ${e.message}\n`);
    report += '\n';
  }
  
  if (warnings.length > 0) {
    report += `⚠️ 警告 (${warnings.length}):\n`;
    warnings.forEach(w => report += `  - ${w.message}\n`);
    report += '\n';
  }
  
  if (infos.length > 0) {
    report += `💡 建议 (${infos.length}):\n`;
    infos.forEach(i => report += `  - ${i.message}\n`);
  }

  return report;
}

/**
 * Markdown 预处理
 */
export function preprocessMarkdown(content: string): string {
  let processed = content;

  // 转换常见的 Markdown 语法错误
  processed = processed.replace(/^#([^\s])/gm, '# $1'); // 标题后加空格
  processed = processed.replace(/^##([^\s])/gm, '## $1');
  processed = processed.replace(/^###([^\s])/gm, '### $1');
  processed = processed.replace(/^\*([^\s*])/gm, '* $1'); // 列表后加空格
  processed = processed.replace(/^-([^\s-])/gm, '- $1');

  return processed;
}

/**
 * 获取格式统计信息
 */
export function getFormatStats(content: string) {
  const lines = content.split('\n');
  const words = content.match(/[\u4e00-\u9fa5]+/g)?.join('').length || 0;
  const englishWords = content.match(/[a-zA-Z]+/g)?.length || 0;
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim()).length;
  const headings = content.match(/^#{1,6} /gm)?.length || 0;
  const codeBlocks = content.match(/```/g)?.length || 0;
  const lists = content.match(/^[*\-+] /gm)?.length || 0;

  return {
    lines: lines.length,
    characters: content.length,
    chineseCharacters: words,
    englishWords,
    paragraphs,
    headings,
    codeBlocks: Math.floor(codeBlocks / 2),
    lists,
  };
}