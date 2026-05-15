import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

/**
 * 临时演示版本 - 纯代码实现
 * 不需要AI视频，立即可以看效果
 */
export function SplashScreenDemo() {
  const navigate = useNavigate();
  const [scene, setScene] = useState(0); // 0=冰山, 1=火山, 2=丛林, 3=天空, 4=画星星, 5=文字
  const [showStar, setShowStar] = useState(false);
  const [showText, setShowText] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // 场景切换时间表
    const sceneTimers = [
      setTimeout(() => setScene(1), 2500),   // 2.5s -> 火山
      setTimeout(() => setScene(2), 5000),   // 5s -> 丛林
      setTimeout(() => setScene(3), 7500),   // 7.5s -> 天空
      setTimeout(() => setScene(4), 10000),  // 10s -> 画星星
      setTimeout(() => setShowStar(true), 10000),
      setTimeout(() => setShowText(true), 12000),
      setTimeout(() => navigate("/"), 15000), // 15s -> 首页
    ];

    const skipTimer = setTimeout(() => setCanSkip(true), 3000);

    return () => {
      sceneTimers.forEach(clearTimeout);
      clearTimeout(skipTimer);
    };
  }, [navigate]);

  const handleSkip = () => navigate("/");

  // 场景配色
  const sceneColors = {
    0: { from: "#0EA5E9", via: "#38BDF8", to: "#93C5FD" }, // 冰山 - 蓝色
    1: { from: "#DC2626", via: "#F97316", to: "#FBBF24" }, // 火山 - 红橙
    2: { from: "#059669", via: "#10B981", to: "#34D399" }, // 丛林 - 绿色
    3: { from: "#1E1B4B", via: "#4C1D95", to: "#312E81" }, // 星空 - 深紫
    4: { from: "#1E1B4B", via: "#4C1D95", to: "#312E81" }, // 画星星 - 保持星空
  };

  const currentColors = sceneColors[scene as keyof typeof sceneColors];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 动态渐变背景 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${currentColors.from}, ${currentColors.via}, ${currentColors.to})`,
        }}
        animate={{
          background: `linear-gradient(135deg, ${currentColors.from}, ${currentColors.via}, ${currentColors.to})`,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* 场景装饰元素 */}
      <AnimatePresence mode="wait">
        {/* 冰山场景 */}
        {scene === 0 && (
          <motion.div
            key="ice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* 山峰图形 */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${20 + i * 30}%`,
                  width: 0,
                  height: 0,
                  borderLeft: "150px solid transparent",
                  borderRight: "150px solid transparent",
                  borderBottom: "300px solid rgba(255, 255, 255, 0.3)",
                }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.2, duration: 1 }}
              />
            ))}
          </motion.div>
        )}

        {/* 火山场景 */}
        {scene === 1 && (
          <motion.div
            key="volcano"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* 岩浆流动效果 */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 rounded-full blur-3xl"
                style={{
                  left: `${i * 20}%`,
                  width: "200px",
                  height: "200px",
                  background: "radial-gradient(circle, rgba(255,100,0,0.8), transparent)",
                }}
                animate={{
                  y: [0, -50, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {/* 丛林场景 */}
        {scene === 2 && (
          <motion.div
            key="jungle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* 树叶形状 */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: "60px",
                  height: "100px",
                  background: "rgba(16, 185, 129, 0.3)",
                  borderRadius: "0 100% 0 100%",
                  transform: "rotate(45deg)",
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: Math.random() * 360 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        )}

        {/* 星空场景 */}
        {(scene === 3 || scene === 4) && (
          <motion.div
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* 星星 */}
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 卡皮巴拉（简化版 - SVG剪影） */}
      <motion.div
        className="absolute bottom-20"
        initial={{ left: "-10%" }}
        animate={{
          left: scene < 3 ? "45%" : "75%",
          bottom: scene < 3 ? "20%" : "40%",
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        {/* 简化的卡皮巴拉剪影 */}
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          {/* 身体 */}
          <ellipse cx="40" cy="35" rx="25" ry="20" fill="#3F2A1D" />
          {/* 头 */}
          <circle cx="55" cy="25" r="15" fill="#5C4033" />
          {/* 耳朵 */}
          <circle cx="50" cy="18" r="5" fill="#5C4033" />
          <circle cx="60" cy="18" r="5" fill="#5C4033" />
          {/* 腿 */}
          <rect x="25" y="50" width="8" height="10" rx="2" fill="#3F2A1D" />
          <rect x="45" y="50" width="8" height="10" rx="2" fill="#3F2A1D" />
          {/* 背包（简化） */}
          <rect x="30" y="25" width="15" height="20" rx="2" fill="#8B4513" opacity="0.8" />
        </svg>

        {/* 梯子（天空场景显示） */}
        {scene >= 3 && (
          <motion.svg
            width="40"
            height="150"
            viewBox="0 0 40 150"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-32 left-10"
          >
            <line x1="10" y1="0" x2="10" y2="150" stroke="#8B4513" strokeWidth="4" />
            <line x1="30" y1="0" x2="30" y2="150" stroke="#8B4513" strokeWidth="4" />
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="10"
                y1={i * 20}
                x2="30"
                y2={i * 20}
                stroke="#8B4513"
                strokeWidth="3"
              />
            ))}
          </motion.svg>
        )}
      </motion.div>

      {/* 画星星动画 */}
      <AnimatePresence>
        {showStar && (
          <motion.svg
            className="absolute top-1/4 right-1/3 w-32 h-32"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            {/* 星星描边 */}
            <motion.path
              d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
              fill="none"
              stroke="#FFD700"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            {/* 星星填充 */}
            <motion.path
              d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
              fill="#FFD700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            />
            {/* 光芒四射 */}
            <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }} transition={{ delay: 2.5, duration: 1 }}>
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 40 * Math.cos((i * Math.PI) / 4)}
                  y2={50 + 40 * Math.sin((i * Math.PI) / 4)}
                  stroke="#FFD700"
                  strokeWidth="2"
                  opacity="0.6"
                />
              ))}
            </motion.g>
          </motion.svg>
        )}
      </AnimatePresence>

      {/* 文字浮现 */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-serif text-white text-center px-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(255,215,0,0.3)",
                letterSpacing: "0.1em",
              }}
            >
              {/* 逐字显示 */}
              {"ad astra per aspera".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip 按钮 */}
      <AnimatePresence>
        {canSkip && (
          <motion.button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/30 hover:bg-white/20 transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              Skip
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                →
              </motion.span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 15, ease: "linear" }}
        />
      </div>
    </div>
  );
}
