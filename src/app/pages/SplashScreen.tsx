import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

export function SplashScreen() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showText, setShowText] = useState(false);
  const [showStar, setShowStar] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // 3秒后允许跳过
    const skipTimer = setTimeout(() => setCanSkip(true), 3000);

    // 10秒后显示星星
    const starTimer = setTimeout(() => setShowStar(true), 10000);

    // 12秒后显示文字
    const textTimer = setTimeout(() => setShowText(true), 12000);

    // 15秒后自动跳转
    const autoNavigate = setTimeout(() => {
      navigate("/");
    }, 15000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(starTimer);
      clearTimeout(textTimer);
      clearTimeout(autoNavigate);
    };
  }, [navigate]);

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* AI生成的视频背景 */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      >
        <source src="/splash-video.mp4" type="video/mp4" />
        {/* 视频需要放在 public/splash-video.mp4 */}
      </video>

      {/* 深色遮罩层（可选） */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 星星绘制动画 */}
      <AnimatePresence>
        {showStar && (
          <motion.svg
            className="absolute top-1/4 right-1/4 w-32 h-32"
            viewBox="0 0 100 100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* 星星路径 - 描边动画 */}
            <motion.path
              d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
              fill="none"
              stroke="#FFD700"
              strokeWidth="2"
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
            {/* 闪烁效果 */}
            <motion.circle
              cx="50"
              cy="50"
              r="50"
              fill="#FFD700"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                delay: 2.5,
                duration: 1,
                times: [0, 0.5, 1]
              }}
            />
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
              className="text-4xl md:text-6xl font-serif text-white text-center"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 0 20px rgba(0,0,0,0.8)",
              }}
            >
              {/* 逐字显示 */}
              {"ad astra per aspera".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  {char === " " ? " " : char}
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
            className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>

      {/* 加载进度条（可选） */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-white/50"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 15, ease: "linear" }}
        />
      </div>
    </div>
  );
}
