import { Link } from "react-router";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Zap, BookOpen, Image as ImageIcon } from "lucide-react";
import { postsApi, trendingApi, agentsApi } from "../../utils/api";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

interface TrendingItem {
  id: string;
  title: string;
  description?: string;
  source: string;
  date: string;
  url?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
}

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载真实数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, trendingRes, agentsRes] = await Promise.all([
          postsApi.getAll(),
          trendingApi.getAll(),
          agentsApi.getAll(),
        ]);

        setPosts((postsRes.data || []).slice(0, 3));
        setTrending((trendingRes.data || []).slice(0, 3));
        setAgents((agentsRes.data || []).slice(0, 6));
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 鼠标跟随效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 滚动视差
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "刚刚";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("zh-CN");
  };


  return (
    <div ref={containerRef} style={{ backgroundColor: 'var(--editorial-warm-white)' }} className="relative min-h-screen overflow-hidden">
      {/* 鼠标跟随光标 */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle, rgba(196, 70, 58, 0.08) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Hero Section - 不规则排版 */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        <div className="max-w-6xl w-full">
          {/* 大标题 - 拆分字母动画 */}
          <div className="relative mb-12">
            <motion.h1
              className="text-7xl md:text-9xl font-bold relative"
              style={{
                fontFamily: 'var(--font-serif-en)',
                color: 'var(--editorial-near-black)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {"Futuralyze".split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: 100, opacity: 0, rotate: 10 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{
                    y: -10,
                    color: 'var(--editorial-vermillion)',
                    transition: { duration: 0.2 },
                  }}
                  style={{ cursor: 'default' }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            {/* 装饰性元素 */}
            <motion.div
              className="absolute -right-4 top-0 text-8xl"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-vermillion)',
                opacity: 0.2,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              *
            </motion.div>
          </div>

          {/* 副标题 - 斜体大字 */}
          <motion.div
            className="relative max-w-3xl mb-16"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <p
              className="text-2xl md:text-4xl italic leading-relaxed"
              style={{
                fontFamily: 'var(--font-serif-cn)',
                color: 'var(--editorial-warm-gray)',
                lineHeight: 1.6,
              }}
            >
              关注企业智能化转型的
              <span
                className="relative mx-2 px-2"
                style={{
                  color: 'var(--editorial-vermillion)',
                  fontStyle: 'normal',
                  fontWeight: 700,
                }}
              >
                独立观察
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 w-full"
                  style={{ backgroundColor: 'var(--editorial-vermillion)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                />
              </span>
              与实践记录
            </p>
          </motion.div>

          {/* 滚动提示 */}
          <motion.div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div
              className="text-xs tracking-widest rotate-90"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-warm-gray)',
              }}
            >
              SCROLL
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Trending Section - 热点速递 */}
      <section className="relative px-6 py-32">
        <div className="max-w-7xl mx-auto">
          {/* Section Label - 浮动效果 */}
          <motion.div
            className="mb-16 flex items-center justify-between"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-sm tracking-widest inline-block relative"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-vermillion)',
                letterSpacing: '3px',
              }}
            >
              热点速递 · TRENDING
              <motion.span
                className="absolute -right-8 top-0"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                ●
              </motion.span>
            </h2>

            <Link
              to="/trending"
              className="group flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-warm-gray)',
                fontSize: '12px',
              }}
            >
              VIEW ALL
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>

          {/* 加载状态 */}
          {loading ? (
            <div className="text-center py-20">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
                style={{ borderColor: 'var(--editorial-vermillion)' }}
              />
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ fontFamily: 'var(--font-sans-cn)', color: 'var(--editorial-warm-gray)' }}>
                暂无热点内容
              </p>
              <Link
                to="/trending"
                className="mt-4 inline-block"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--editorial-vermillion)',
                  fontSize: '14px',
                }}
              >
                去热点页面查看 →
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {trending.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target={item.url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group cursor-pointer relative block"
                  style={{
                    marginLeft: index % 2 === 0 ? '0' : '20%',
                    maxWidth: index === 1 ? '70%' : '80%',
                  }}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ x: 20, transition: { duration: 0.3 } }}
                >
                  <div className="flex items-start gap-8">
                    {/* 序号 - 超大尺寸 */}
                    <motion.div
                      className="text-9xl font-bold leading-none"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--editorial-vermillion)',
                        WebkitTextStroke: '2px var(--editorial-vermillion)',
                        WebkitTextFillColor: 'transparent',
                      }}
                      whileHover={{
                        WebkitTextFillColor: 'var(--editorial-vermillion)',
                        transition: { duration: 0.3 },
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </motion.div>

                    <div className="flex-1 pt-4">
                      {/* 标题 */}
                      <h3
                        className="text-3xl md:text-4xl font-bold mb-4 relative inline-block"
                        style={{
                          fontFamily: 'var(--font-serif-cn)',
                          color: 'var(--editorial-near-black)',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                        {item.url && (
                          <ArrowUpRight
                            className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--editorial-vermillion)' }}
                            size={28}
                          />
                        )}
                      </h3>

                      {/* 摘要 */}
                      {item.description && (
                        <p
                          className="text-base mb-4 max-w-2xl line-clamp-2"
                          style={{
                            fontFamily: 'var(--font-sans-cn)',
                            color: 'var(--editorial-warm-gray)',
                            lineHeight: 1.8,
                          }}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Meta信息 */}
                      <div
                        className="text-xs flex items-center gap-4"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--editorial-warm-gray)',
                          letterSpacing: '2px',
                        }}
                      >
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{formatTime(item.date).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover 下划线 */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-px w-full origin-left"
                    style={{ backgroundColor: 'var(--editorial-divider)' }}
                    initial={{ scaleX: 1 }}
                    whileHover={{ scaleX: 1, backgroundColor: 'var(--editorial-vermillion)' }}
                  />
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 装饰性分隔 */}
      <motion.div
        className="max-w-7xl mx-auto px-6 my-32"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div
          className="h-px w-full"
          style={{ backgroundColor: 'var(--editorial-divider)' }}
        />
      </motion.div>

      {/* Essays Section - 深度文章 */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Label */}
          <motion.div
            className="mb-20 flex items-center justify-between"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-sm tracking-widest"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-vermillion)',
                letterSpacing: '3px',
              }}
            >
              深度文章 · ESSAYS
            </h2>

            <Link
              to="/blog"
              className="group flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-warm-gray)',
                fontSize: '12px',
              }}
            >
              VIEW ALL
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column - 文章列表 */}
            <div className="lg:col-span-8 space-y-16">
              {loading ? (
                <div className="text-center py-20">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
                    style={{ borderColor: 'var(--editorial-vermillion)' }}
                  />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <p style={{ fontFamily: 'var(--font-sans-cn)', color: 'var(--editorial-warm-gray)' }}>
                    暂无文章
                  </p>
                  <Link
                    to="/blog"
                    className="mt-4 inline-block"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--editorial-vermillion)',
                      fontSize: '14px',
                    }}
                  >
                    去博客页面查看 →
                  </Link>
                </div>
              ) : (
                posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={`/blog/${post.id}`}
                    className="block group"
                  >
                    <article className="relative">
                      {/* Hover 背景 */}
                      <motion.div
                        className="absolute inset-0 -mx-8 -my-6 rounded-2xl"
                        style={{ backgroundColor: 'rgba(196, 70, 58, 0.02)' }}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative px-8 py-6">
                        {/* Meta */}
                        <div
                          className="text-xs mb-4 flex items-center gap-4"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--editorial-warm-gray)',
                            letterSpacing: '1.5px',
                          }}
                        >
                          <span>{post.category}</span>
                          <span>·</span>
                          <span>{post.date}</span>
                          <span>·</span>
                          <span>{post.readTime}</span>
                        </div>

                        {/* Title */}
                        <h3
                          className="text-3xl md:text-4xl font-bold mb-6 relative inline-block"
                          style={{
                            fontFamily: 'var(--font-serif-cn)',
                            color: 'var(--editorial-near-black)',
                            lineHeight: 1.3,
                          }}
                        >
                          {post.title}

                          {/* 下划线动画 */}
                          <motion.span
                            className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full"
                            style={{ backgroundColor: 'var(--editorial-vermillion)' }}
                            transition={{ duration: 0.4 }}
                          />
                        </h3>

                        {/* Excerpt */}
                        <p
                          className="text-lg mb-6 max-w-3xl line-clamp-3"
                          style={{
                            fontFamily: 'var(--font-sans-cn)',
                            color: 'var(--editorial-warm-gray)',
                            lineHeight: 1.8,
                          }}
                        >
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-3 flex-wrap">
                            {post.tags.slice(0, 3).map((tag) => (
                              <motion.span
                                key={tag}
                                className="text-xs px-3 py-1.5 border"
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--editorial-navy)',
                                  borderColor: 'var(--editorial-divider)',
                                  letterSpacing: '1.5px',
                                }}
                                whileHover={{
                                  borderColor: 'var(--editorial-vermillion)',
                                  color: 'var(--editorial-vermillion)',
                                  transition: { duration: 0.2 },
                                }}
                              >
                                #{tag}
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )))}
            </div>

            {/* Right Column - 侧边栏 */}
            <motion.div
              className="lg:col-span-4 space-y-12"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* About - 粘性定位 */}
              <div className="lg:sticky lg:top-24 space-y-12">
                <motion.div
                  className="p-8 border relative overflow-hidden group"
                  style={{ borderColor: 'var(--editorial-divider)' }}
                  whileHover={{ borderColor: 'var(--editorial-vermillion)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 装饰性大引号 */}
                  <div
                    className="absolute -top-4 -left-2 text-9xl opacity-5 group-hover:opacity-10 transition-opacity"
                    style={{
                      fontFamily: 'var(--font-serif-en)',
                      color: 'var(--editorial-vermillion)',
                    }}
                  >
                    "
                  </div>

                  <h4
                    className="text-2xl font-bold mb-4 relative"
                    style={{
                      fontFamily: 'var(--font-serif-cn)',
                      color: 'var(--editorial-near-black)',
                    }}
                  >
                    关于
                  </h4>
                  <p
                    className="text-base relative mb-6"
                    style={{
                      fontFamily: 'var(--font-sans-cn)',
                      color: 'var(--editorial-warm-gray)',
                      lineHeight: 1.8,
                    }}
                  >
                    专注于企业 AI 转型与智能化应用。记录实践、分享思考、发现信号。
                  </p>

                  {/* 快速导航 */}
                  <div className="flex flex-wrap gap-3 relative">
                    <Link
                      to="/agents"
                      className="flex items-center gap-2 px-3 py-2 border group/nav"
                      style={{
                        borderColor: 'var(--editorial-divider)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--editorial-warm-gray)',
                      }}
                    >
                      <Zap size={14} />
                      <span className="group-hover/nav:text-[var(--editorial-vermillion)] transition-colors">
                        AGENTS
                      </span>
                    </Link>
                    <Link
                      to="/blog"
                      className="flex items-center gap-2 px-3 py-2 border group/nav"
                      style={{
                        borderColor: 'var(--editorial-divider)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--editorial-warm-gray)',
                      }}
                    >
                      <BookOpen size={14} />
                      <span className="group-hover/nav:text-[var(--editorial-vermillion)] transition-colors">
                        BLOG
                      </span>
                    </Link>
                    <Link
                      to="/gallery"
                      className="flex items-center gap-2 px-3 py-2 border group/nav"
                      style={{
                        borderColor: 'var(--editorial-divider)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--editorial-warm-gray)',
                      }}
                    >
                      <ImageIcon size={14} />
                      <span className="group-hover/nav:text-[var(--editorial-vermillion)] transition-colors">
                        GALLERY
                      </span>
                    </Link>
                  </div>
                </motion.div>

                {/* Agents 预览 */}
                {agents.length > 0 && (
                  <div
                    className="p-8 border"
                    style={{ borderColor: 'var(--editorial-divider)' }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4
                        className="text-xl font-bold"
                        style={{
                          fontFamily: 'var(--font-serif-cn)',
                          color: 'var(--editorial-near-black)',
                        }}
                      >
                        AI Agents
                      </h4>
                      <Link
                        to="/agents"
                        className="text-xs"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--editorial-vermillion)',
                        }}
                      >
                        VIEW ALL →
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {agents.slice(0, 3).map((agent, i) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Link
                            to="/agents"
                            className="block group/agent"
                          >
                            <div
                              className="text-sm font-medium mb-1 group-hover/agent:text-[var(--editorial-vermillion)] transition-colors"
                              style={{
                                fontFamily: 'var(--font-sans-cn)',
                                color: 'var(--editorial-near-black)',
                              }}
                            >
                              {agent.name}
                            </div>
                            <div
                              className="text-xs line-clamp-1"
                              style={{
                                fontFamily: 'var(--font-sans-cn)',
                                color: 'var(--editorial-warm-gray)',
                              }}
                            >
                              {agent.description}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-24 mt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="h-px w-full mb-16"
            style={{ backgroundColor: 'var(--editorial-divider)' }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Left - 大字 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3
                className="text-5xl md:text-6xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-serif-en)',
                  color: 'var(--editorial-near-black)',
                }}
              >
                Let's
                <br />
                <span style={{ color: 'var(--editorial-vermillion)' }}>
                  Connect
                </span>
              </h3>
            </motion.div>

            {/* Right - 链接 */}
            <motion.div
              className="flex flex-col justify-end space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                { label: 'RSS', href: '/rss' },
                { label: '小红书', href: '#' },
                { label: '即刻', href: '#' },
                { label: 'Email', href: 'mailto:hello@example.com' },
              ].map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-4 text-2xl"
                    style={{
                      fontFamily: 'var(--font-sans-cn)',
                      color: 'var(--editorial-warm-gray)',
                    }}
                  >
                    <motion.span
                      className="w-12 h-px"
                      style={{ backgroundColor: 'var(--editorial-divider)' }}
                      whileHover={{
                        width: 48,
                        backgroundColor: 'var(--editorial-vermillion)',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="group-hover:text-[var(--editorial-vermillion)] transition-colors">
                      {link.label}
                    </span>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom - Copyright */}
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              className="text-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-warm-gray)',
                letterSpacing: '1px',
              }}
            >
              © 2026 Shuyu
            </div>

            <motion.div
              className="text-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--editorial-warm-gray)',
                letterSpacing: '1px',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⬤ ONLINE
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
