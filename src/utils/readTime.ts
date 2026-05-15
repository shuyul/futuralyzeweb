/**
 * 计算文章阅读时间
 * 基于平均阅读速度：中文 300 字/分钟，英文 200 词/分钟
 */
export function calculateReadTime(content: string): string {
  if (!content) return "1 分钟";
  
  // 统计中文字符数（包括中文标点）
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || [];
  const chineseCount = chineseChars.length;
  
  // 统计英文单词数
  const englishWords = content.match(/[a-zA-Z]+/g) || [];
  const englishCount = englishWords.length;
  
  // 计算阅读时间（分钟）
  // 中文按 300 字/分钟，英文按 200 词/分钟
  const chineseTime = chineseCount / 300;
  const englishTime = englishCount / 200;
  const totalMinutes = Math.ceil(chineseTime + englishTime);
  
  // 至少显示 1 分钟
  const minutes = Math.max(1, totalMinutes);
  
  return `${minutes} 分钟`;
}
