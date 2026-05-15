# 🎬 卡皮巴拉冒险启动页 - 实施指南

## ✅ 已完成

- ✅ 创建了启动页组件 `SplashScreen.tsx`
- ✅ 添加了路由配置
- ✅ 实现了视频播放 + 星星绘制 + 文字动画
- ✅ 添加了 Skip 按钮和进度条

---

## 🎥 第一步：生成AI视频

### 推荐工具

#### **方案A：可灵 Kling（推荐）** 🇨🇳
- 网址：https://klingai.kuaishou.com
- 优点：免费额度、效果好、中文友好
- 注册后每天有免费生成次数

#### **方案B：Pika Labs** 🌍
- 网址：https://pika.art
- 优点：免费、简单易用
- 效果不错

#### **方案C：Runway Gen-3** 🌍
- 网址：https://runwayml.com
- 优点：效果最好
- 缺点：需要付费（$12/月起）

---

### 生成步骤

#### **场景1：冰山穿越（0-3秒）**

**提示词：**
```
A cute capybara adventurer wearing a small backpack and explorer hat, 
walking through a snowy mountain landscape with ice peaks in the background, 
cinematic lighting, warm golden hour light, fantasy illustration style, 
highly detailed, 4K
```

**中文提示词（可灵）：**
```
一只可爱的卡皮巴拉冒险者，背着小背包，戴着探险帽，
穿越雪山风景，背景是冰峰，
电影般的光线，温暖的黄金时段光线，
奇幻插画风格，高度细节，4K
```

---

#### **场景2：火山区域（3-6秒）**

**提示词：**
```
Same capybara adventurer walking past a volcanic landscape 
with flowing lava streams, orange and red dramatic lighting, 
smoke and embers in the air, epic adventure mood
```

**中文：**
```
同一只卡皮巴拉冒险者，走过火山景观，
岩浆流淌，橙红色戏剧性光线，
空气中有烟雾和火星，史诗冒险氛围
```

---

#### **场景3：丛林穿越（6-9秒）**

**提示词：**
```
Capybara adventurer trekking through a lush tropical jungle, 
tall trees and vines, rays of sunlight filtering through canopy, 
magical atmosphere, adventure continues
```

**中文：**
```
卡皮巴拉冒险者穿越茂密的热带丛林，
高大的树木和藤蔓，阳光透过树冠，
神奇的氛围，冒险继续
```

---

#### **场景4：爬向天际（9-12秒）**

**提示词：**
```
Capybara climbing a wooden ladder towards a starry night sky, 
transitioning from jungle to cosmos, magical twilight colors, 
stars beginning to appear, ethereal and inspirational mood
```

**中文：**
```
卡皮巴拉爬着木梯子向星空攀登，
从丛林过渡到宇宙，神奇的暮光色彩，
星星开始出现，空灵而鼓舞人心的氛围
```

---

#### **场景5：画星星（可选，代码实现更灵活）**

如果想用视频：
```
Capybara holding a glowing paintbrush, 
painting a bright golden star in the night sky, 
magical sparkles and light particles, 
triumphant moment, wide shot
```

**建议：** 这一段用代码实现更灵活（已包含在组件中）

---

### 视频拼接

生成5段视频后，需要拼接：

#### **方案A：在线工具**
- **Clipchamp**（微软出品，免费）
- **Kapwing**（简单易用）
- **Canva Video**（免费模板）

#### **方案B：本地软件**
- **剪映**（免费，简单）
- **DaVinci Resolve**（免费，专业）
- **iMovie/Final Cut**（Mac）

#### **拼接要求：**
1. 总时长：10-12秒
2. 分辨率：1920x1080 或 1280x720
3. 格式：MP4（H.264编码）
4. 文件大小：尽量控制在 5MB 以内
5. 场景之间添加 0.5秒淡入淡出过渡

---

## 📂 第二步：添加视频文件

### 1. 导出视频

拼接完成后，导出为 `splash-video.mp4`

### 2. 放置文件

将视频文件放在 `public/` 文件夹：

```bash
/workspaces/default/code/
└── public/
    └── splash-video.mp4   ← 放这里
```

### 3. 优化视频（可选）

如果文件太大，可以压缩：

**在线工具：**
- https://www.freeconvert.com/video-compressor
- https://www.videosmaller.com

**命令行（如果有ffmpeg）：**
```bash
ffmpeg -i splash-video.mp4 -vcodec h264 -crf 28 -preset slow splash-video-compressed.mp4
```

---

## 🧪 第三步：测试

### 1. 访问测试页面

启动开发服务器后，访问：
```
http://localhost:5173/splash
```

### 2. 检查效果

- ✅ 视频是否正常播放
- ✅ 10秒后星星是否绘制
- ✅ 12秒后文字是否显示
- ✅ Skip 按钮是否可用
- ✅ 15秒后是否自动跳转首页

### 3. 调整时间点

如果需要调整动画时机，修改 `SplashScreen.tsx` 中的时间：

```typescript
// 3秒后允许跳过
const skipTimer = setTimeout(() => setCanSkip(true), 3000);

// 10秒后显示星星（视频结束时）
const starTimer = setTimeout(() => setShowStar(true), 10000);

// 12秒后显示文字
const textTimer = setTimeout(() => setShowText(true), 12000);

// 15秒后自动跳转
const autoNavigate = setTimeout(() => navigate("/"), 15000);
```

---

## 🎨 第四步：自定义样式

### 修改星星颜色

```typescript
stroke="#FFD700"  // 改成你喜欢的颜色
fill="#FFD700"
```

### 修改文字样式

```typescript
className="text-4xl md:text-6xl font-serif text-white"
```

### 添加背景音乐（可选）

```typescript
<audio autoPlay loop>
  <source src="/splash-music.mp3" type="audio/mpeg" />
</audio>
```

---

## 🚀 第五步：集成到首页

### 方案A：首次访问显示（推荐）

修改 `App.tsx`，添加首次访问检测：

```typescript
import { useState, useEffect } from "react";
import { SplashScreen } from "./pages/SplashScreen";

export function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // 检查是否是首次访问
    const hasVisited = localStorage.getItem("hasVisited");
    
    if (!hasVisited) {
      setShowSplash(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <RouterProvider router={router} />;
}
```

### 方案B：每次访问显示

修改路由，让 `/` 直接指向 `SplashScreen`，完成后跳转到 `/home`

### 方案C：特定页面显示

在特定页面（如关于页）加入启动按钮

---

## 🎭 高级优化

### 1. 预加载视频

```typescript
useEffect(() => {
  const video = videoRef.current;
  if (video) {
    video.load(); // 预加载
  }
}, []);
```

### 2. 移动端优化

```typescript
// 检测移动设备，使用压缩版视频
const isMobile = window.innerWidth < 768;
const videoSrc = isMobile 
  ? "/splash-video-mobile.mp4" 
  : "/splash-video.mp4";
```

### 3. 添加加载状态

```typescript
const [isLoading, setIsLoading] = useState(true);

<video
  onLoadedData={() => setIsLoading(false)}
  // ...
>
```

---

## 📦 快速测试方案（无AI视频）

如果暂时没有视频，可以用纯色背景测试：

```typescript
// 临时替代方案
<div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
  {/* 渐变背景 */}
</div>
```

---

## 🎉 完成清单

- [ ] 使用AI工具生成5段视频
- [ ] 拼接视频（10-12秒）
- [ ] 优化文件大小（<5MB）
- [ ] 放置到 `public/splash-video.mp4`
- [ ] 访问 `/splash` 测试
- [ ] 调整动画时间点
- [ ] 集成到首页访问流程
- [ ] 移动端测试
- [ ] 性能优化

---

## 💡 替代方案建议

如果AI视频生成不满意，还可以：

### 1. **纯代码动画版**
- 用 SVG + CSS 动画实现
- 扁平风格的卡皮巴拉
- 场景切换用颜色渐变

### 2. **静态插画 + 视差滚动**
- 找5张插画（或AI生成单帧）
- 用 Motion 实现视差效果
- 卡皮巴拉移动穿过场景

### 3. **Lottie 动画**
- 在 LottieFiles 找相似动画
- 或请设计师制作
- 轻量级，效果好

---

## 🆘 遇到问题？

**视频不播放：**
- 检查文件路径是否正确
- 检查视频格式（必须是 MP4）
- 检查浏览器控制台错误

**性能问题：**
- 压缩视频文件
- 降低视频分辨率
- 使用更高效的编码

**动画不同步：**
- 调整 `setTimeout` 的时间
- 监听视频的 `timeupdate` 事件精确控制

---

**现在就去生成视频吧！** 🎬✨

期待看到卡皮巴拉的冒险旅程！
