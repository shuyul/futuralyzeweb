import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

/**
 * 新版首页 - 书籍式 + 数字花园 + 工具感
 * 参考: craigmod.com, maggieappleton.com, alexanderobenauer.com
 */
export function HomeV2() {
  return (
    <div
      style={{
        backgroundColor: "var(--editorial-warm-white)",
        minHeight: "100vh",
      }}
    >
      {/* Hero - 书籍式超大留白 */}
      <section className="max-w-4xl mx-auto px-8 pt-32 pb-24">
        {/* 小标签 - 像书的章节标记 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div
            className="inline-block text-xs tracking-wider uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--editorial-warm-gray)",
              letterSpacing: "0.2em",
            }}
          >
            Digital Garden · 数字花园
          </div>
        </motion.div>

        {/* 主标题 - 不对称布局 */}
        <div className="grid grid-cols-12 gap-8 mb-24">
          {/* 左侧：大标题 */}
          <motion.div
            className="col-span-12 lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1
              className="text-5xl md:text-7xl leading-tight mb-8"
              style={{
                fontFamily: "var(--font-serif-cn)",
                color: "var(--editorial-near-black)",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              思考、记录、
              <br />
              生长
            </h1>

            <p
              className="text-lg leading-relaxed mb-8"
              style={{
                fontFamily: "var(--font-sans-cn)",
                color: "var(--editorial-warm-gray)",
                lineHeight: 1.9,
                maxWidth: "32em", // 最佳阅读宽度
              }}
            >
              这里是一个持续生长的数字空间。记录关于
              <span
                style={{
                  color: "var(--editorial-vermillion)",
                  fontWeight: 500,
                }}
              >
                {" "}
                AI、工具、思考{" "}
              </span>
              的碎片，让知识像植物一样有机地连接与演化。
            </p>

            {/* 元数据 - 像书的出版信息 */}
            <div
              className="flex items-center gap-6 text-sm"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--editorial-warm-gray)",
              }}
            >
              <div>最近更新：2026.05.12</div>
              <div>·</div>
              <div>持续培育中</div>
            </div>
          </motion.div>

          {/* 右侧：导航卡片 - 像工具面板 */}
          <motion.div
            className="col-span-12 lg:col-span-5 lg:pt-12"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <nav className="space-y-3">
              {[
                {
                  label: "Blog",
                  desc: "长篇思考与记录",
                  path: "/blog",
                  count: "24",
                },
                {
                  label: "Notes",
                  desc: "零散的想法",
                  path: "/resources",
                  count: "156",
                },
                {
                  label: "Tools",
                  desc: "正在使用的工具",
                  path: "/agents",
                  count: "12",
                },
                {
                  label: "Gallery",
                  desc: "视觉收藏",
                  path: "/gallery",
                  count: "89",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="group block px-6 py-4 border transition-all duration-300 hover:border-[var(--editorial-vermillion)] hover:shadow-sm"
                    style={{
                      borderColor: "var(--editorial-divider)",
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <span
                            className="text-lg font-medium group-hover:text-[var(--editorial-vermillion)] transition-colors"
                            style={{
                              fontFamily: "var(--font-serif-en)",
                              color: "var(--editorial-near-black)",
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            className="text-xs"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--editorial-warm-gray)",
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            fontFamily: "var(--font-sans-cn)",
                            color: "var(--editorial-warm-gray)",
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                      <ArrowUpRight
                        className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 group-hover:-translate-y-0"
                        style={{ color: "var(--editorial-vermillion)" }}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* 分割线 - 像书页的装饰 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-px origin-left mb-24"
          style={{ backgroundColor: "var(--editorial-divider)" }}
        />

        {/* 最近更新 - 像目录 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h2
            className="text-sm tracking-wider uppercase mb-8"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--editorial-warm-gray)",
              letterSpacing: "0.2em",
            }}
          >
            Recent Updates · 最近更新
          </h2>

          <div className="space-y-8">
            {/* 示例条目 - 像书的目录项 */}
            {[
              {
                date: "05.12",
                title: "关于 Agent 系统设计的几点思考",
                type: "Essay",
                path: "/blog/1",
              },
              {
                date: "05.10",
                title: "使用 Claude 构建个人知识库的实践",
                type: "Note",
                path: "/blog/2",
              },
              {
                date: "05.08",
                title: "工具即思维：我的数字工作流",
                type: "Guide",
                path: "/blog/3",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
              >
                <Link
                  to={item.path}
                  className="group block"
                >
                  <div className="flex items-baseline gap-6">
                    {/* 日期 - 等宽字体 */}
                    <time
                      className="flex-shrink-0 text-sm"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--editorial-warm-gray)",
                      }}
                    >
                      {item.date}
                    </time>

                    {/* 标题 */}
                    <div className="flex-1">
                      <h3
                        className="text-lg group-hover:text-[var(--editorial-vermillion)] transition-colors inline"
                        style={{
                          fontFamily: "var(--font-serif-cn)",
                          color: "var(--editorial-near-black)",
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* 类型标签 */}
                    <span
                      className="flex-shrink-0 text-xs px-2 py-1 border"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--editorial-navy)",
                        borderColor: "var(--editorial-divider)",
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 查看全部 */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm group"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--editorial-vermillion)",
              }}
            >
              View all posts
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer - 极简 */}
      <footer
        className="max-w-4xl mx-auto px-8 py-12 border-t"
        style={{ borderColor: "var(--editorial-divider)" }}
      >
        <div
          className="text-xs text-center"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--editorial-warm-gray)",
          }}
        >
          © 2026 · Tended with care
        </div>
      </footer>
    </div>
  );
}
