import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { postsApi, kv } from "../../utils/api";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}
import { Logo } from "../components/Logo";
import heroPortal from "/src/imports/hero-bg.webp";
import tileTrending from "/src/imports/image-46.png";
import tileAgents from "/src/imports/image-47.png";
import tileResources from "/src/imports/image-48.png";
import tileGallery from "/src/imports/image-49.png";

const navItems = [
  { label: "博客", to: "/blog" },
  { label: "Agents", to: "/agents" },
  { label: "图册", to: "/gallery" },
  { label: "资料库", to: "/resources" },
  { label: "热点", to: "/trending" },
];

type LinkItem = { kind: "文章" | "资料" | "Agent" | "热点"; title: string; to: string; draft?: true };

const coreQuestions: {
  id: string;
  title: string;
  desc: string;
  links: LinkItem[];
}[] = [
  {
    id: "q1",
    title: "AI 如何重塑组织结构？",
    desc: "从层级化走向网络化，决策权与执行权的边界正在被重新划定。",
    links: [
      { kind: "文章", title: "组织内的 AI 引入路径", to: "/blog", draft: true },
      { kind: "资料", title: "麦肯锡《AI 与组织设计》PDF", to: "/resources" },
      { kind: "Agent", title: "组织诊断 Agent", to: "/agents" },
    ],
  },
  {
    id: "q2",
    title: "人才的能力坐标如何迁移？",
    desc: "工具使用、判断力、与机器协作的节奏感正在成为新的核心素养。",
    links: [
      { kind: "文章", title: "判断力作为新稀缺", to: "/blog", draft: true },
      { kind: "文章", title: "工具流畅度：被低估的能力", to: "/blog", draft: true },
      { kind: "资料", title: "World Economic Forum · 未来工作 2025", to: "/resources" },
    ],
  },
  {
    id: "q3",
    title: "教育与培训如何回应？",
    desc: "知识传递的成本趋零，学习的真正价值回到提问与判断本身。",
    links: [
      { kind: "文章", title: "提问的艺术：从答案回到问题", to: "/blog", draft: true },
      { kind: "资料", title: "OECD · 教育与生成式 AI 报告", to: "/resources" },
      { kind: "Agent", title: "学习路径规划 Agent", to: "/agents" },
    ],
  },
  {
    id: "q4",
    title: "什么样的组织率先获益？",
    desc: "拥有清晰任务结构与高质量数据资产的团队，迁移成本最低。",
    links: [
      { kind: "文章", title: "数据资产盘点清单", to: "/blog", draft: true },
      { kind: "热点", title: "本周：哪些公司在落地 Agent？", to: "/trending" },
      { kind: "资料", title: "a16z · Enterprise AI 现状", to: "/resources" },
    ],
  },
  {
    id: "q5",
    title: "未来五年的关键变量是什么？",
    desc: "模型成本、监管节奏、与组织内部的信任系统将共同决定速度。",
    links: [
      { kind: "文章", title: "信任系统：组织内的 AI 治理", to: "/blog", draft: true },
      { kind: "热点", title: "监管动态周报", to: "/trending" },
      { kind: "资料", title: "Stanford AI Index 2026", to: "/resources" },
    ],
  },
];


// Normalise kv data (uses 'question'/'description' keys) to the internal shape
function normaliseQuestions(raw: any[]): typeof coreQuestions {
  return raw.map((q) => ({
    id: q.id,
    title: q.question ?? q.title ?? "",
    desc: q.description ?? q.desc ?? "",
    links: (q.links ?? []).map((l: any) => ({
      kind: l.kind as LinkItem["kind"],
      title: l.label ?? l.title ?? "",
      to: l.to ?? "",
      ...(l.draft ? { draft: true as const } : {}),
    })),
  }));
}

export function HomeV3() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [questions, setQuestions] = useState(coreQuestions);
  const [issueIntro, setIssueIntro] = useState("");

  useEffect(() => {
    // Load issue questions from kv (admin-editable), fall back to hardcoded defaults
    kv.get("issue_questions").then(({ data }) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setQuestions(normaliseQuestions(data));
      }
    });
    kv.get("issue_intro").then(({ data }) => {
      if (data) setIssueIntro(data);
    });
    postsApi.getAll().then(({ data, error }) => {
      if (data && !error) setPosts(data);
      else if (error) console.error("Failed to load posts on HomeV3:", error);
    });
  }, []);

  const featured = posts[0];
  const moreArticles = posts.slice(1, 5);

  const fmtDate = (d?: string) =>
    d ? d.replace(/-/g, " / ").replace(/T.*$/, "") : "";

  return (
    <>
      <style>{`
        .font-display {
          font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.6);
        }
        /* Gallery-frame card */
        .frame-card {
          position: relative;
          background:
            radial-gradient(120% 60% at 50% -10%, rgba(255, 240, 215, 0.55) 0%, rgba(255,255,255,0.0) 55%),
            linear-gradient(180deg, #FCFAF6 0%, #F3F0EA 100%);
          border: 1px solid rgba(70, 55, 35, 0.10);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 0 0 1px rgba(255,255,255,0.6) inset,
            0 10px 30px -12px rgba(60, 45, 25, 0.18);
          border-radius: 6px;
          transition: transform .4s ease, box-shadow .4s ease;
        }
        .frame-card::before {
          /* outer thin gold-ish frame */
          content: "";
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(120, 95, 60, 0.18);
          border-radius: 3px;
          pointer-events: none;
        }
        .frame-card::after {
          /* top spotlight bloom */
          content: "";
          position: absolute;
          left: 50%;
          top: -30px;
          width: 70%;
          height: 80px;
          transform: translateX(-50%);
          background: radial-gradient(50% 100% at 50% 100%, rgba(255, 225, 170, 0.55), rgba(255,255,255,0) 70%);
          filter: blur(6px);
          opacity: 0;
          transition: opacity .5s ease;
          pointer-events: none;
        }
        .group:hover .frame-card {
          transform: translateY(-3px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 0 0 1px rgba(255,255,255,0.7) inset,
            0 25px 50px -15px rgba(60, 45, 25, 0.28);
        }
        .group:hover .frame-card::after { opacity: 1; }
        .frame-q-numeral {
          font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          font-size: 56px;
          line-height: 1;
          color: rgba(60, 45, 25, 0.14);
          letter-spacing: -0.02em;
        }
        .accent-link { color: #4F91FF; }
        .accent-link:hover { color: #2f6fe0; }
      `}</style>
    <div
      className="relative min-h-screen text-[#222222] antialiased"
      style={{
        background: "#F8F6F2",
        fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
      }}
    >
      <div className="fixed inset-0 -z-10 bg-[#F8F6F2]" aria-hidden />
      {/* Full-bleed Hero */}
      <section className="relative w-full" style={{ background: "#F5F0E8" }}>
        {/* Nav */}
        <header className="relative z-20 px-10 lg:px-16 pt-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo size={34} />
            </Link>
            <nav className="flex items-center gap-8 text-[13px] text-[#3F3A34]">
              {navItems.map((n) => (
                <Link key={n.to} to={n.to} className="hover:text-[#1A1A1A] transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Hero body */}
        <div className="relative w-full min-h-[560px] overflow-hidden">
          {/* Background image — positioned right */}
          <img
            src={heroPortal}
            alt="光之门"
            className="absolute right-0 top-0 h-full w-[65%] object-cover object-left"
            style={{ pointerEvents: "none" }}
          />
          {/* Left fade so text reads cleanly */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #F5F0E8 38%, #F5F0E8cc 52%, transparent 72%)",
            }}
          />

          {/* Text content */}
          <div className="relative z-10 px-10 lg:px-16 pt-16 pb-20">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="max-w-[560px]"
              >
                <h1
                  className="font-display leading-[1.0] tracking-tight text-[#1A1A1A]"
                  style={{ fontSize: "clamp(56px, 7vw, 88px)" }}
                >
                  探索人工智能
                  <br />
                  <span
                    style={{
                      color: "#C4463A",
                      fontStyle: "italic",
                      display: "inline-block",
                    }}
                  >
                    与未来科技
                  </span>
                </h1>
                {/* Red underline */}
                <div
                  style={{
                    width: "clamp(200px, 42%, 380px)",
                    height: "3px",
                    background: "#C4463A",
                    marginTop: "10px",
                    marginBottom: "28px",
                  }}
                />
                <p className="text-[14.5px] leading-[1.85] text-[#555555] max-w-[420px]">
                  以编辑部的克制与讲究，记录 AI 领域的深度思考与实用工具。
                  <br />
                  在信息噪音中，寻找真正的信号。
                </p>
                <div className="mt-10 flex items-center gap-3">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1A1A1A] text-white text-[13px] tracking-wide hover:bg-black transition-colors"
                  >
                    阅读博客
                  </Link>
                  <Link
                    to="/trending"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#1A1A1A] text-[#1A1A1A] text-[13px] tracking-wide hover:bg-[#1A1A1A]/5 transition-colors"
                  >
                    探索热点
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative z-10 border-t border-[#1A1A1A]/10 px-10 lg:px-16 py-8"
          style={{ background: "#F5F0E8" }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-12">
              {[
                { num: "6", label: "文章" },
                { num: "2", label: "AGENT" },
                { num: "115", label: "热点" },
              ].map((s, i) => (
                <div key={i} className="flex items-baseline gap-2">
                  <span
                    className="font-display text-[52px] leading-none text-[#1A1A1A]"
                    style={{ fontWeight: 700 }}
                  >
                    {s.num}
                  </span>
                  <span className="text-[12px] tracking-[0.15em] uppercase text-[#999999]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="hidden lg:block border-l border-[#1A1A1A]/10 pl-12 max-w-xs">
              <div className="text-[15px] leading-[1.6] text-[#555] font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                &ldquo;The future is already here —
                <br />
                it&rsquo;s just not evenly distributed."
              </div>
              <div className="mt-2 text-[11px] tracking-[0.2em] uppercase text-[#999]">— William Gibson</div>
            </div>
          </div>
        </div>
      </section>

      <main
        className="w-full relative"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, #FBF9F3 0%, #F5F2ED 45%, #EFEBE2 100%)",
        }}
      >
        {/* Subtle inner shadow at top & bottom to suggest a lit room */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(40,28,12,0.07) 0%, rgba(40,28,12,0) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, rgba(40,28,12,0.06) 0%, rgba(40,28,12,0) 100%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-10 lg:px-16 pt-20">

          {/* 专题导读 */}
          <section className="pb-16">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[15px] tracking-[0.2em] text-[#888] uppercase whitespace-nowrap">
                专题导读
              </h2>
              <span className="w-10 h-px bg-[#C4463A]/70" />
            </div>
            <p className="max-w-3xl text-[14px] leading-[1.85] text-[#666666] whitespace-pre-wrap">
              {issueIntro || "这一期不试图给出确定的答案。我们把目光放在那些尚未被回答的问题上——组织如何吸纳一种比员工更快、更廉价、却又更难以理解的智能？人的位置又将如何被重新安放？这些问题构成了本期的骨架。"}
            </p>
          </section>

          {/* 核心问题展区 */}
          <section className="pb-28">
            <div className="flex items-end gap-4 mb-10">
              <h3 className="text-[40px] leading-none tracking-tight text-[#1A1A1A] font-display whitespace-nowrap">
                核心问题展区
              </h3>
              <span className="w-20 h-px bg-[#C4463A]/80 mb-3" />
            </div>

            <div>
              {(() => {
                const n = questions.length;
                const cols = Math.min(n, 5);
                const colMap: Record<number, string> = {
                  2: "md:grid-cols-2",
                  3: "md:grid-cols-3",
                  4: "md:grid-cols-4",
                  5: "md:grid-cols-5",
                };
                const gridCls = `grid grid-cols-1 sm:grid-cols-2 ${colMap[cols] ?? "md:grid-cols-3"} gap-5`;
                return (
                  <div className={gridCls}>
                    {questions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="relative group"
                  >
                    <div className="frame-card flex flex-col h-full min-h-[220px] p-7 pt-8">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] tracking-[0.3em] text-[#999999] uppercase">
                          Q.0{i + 1}
                        </span>
                        <span className="frame-q-numeral select-none">
                          0{i + 1}
                        </span>
                      </div>
                      <div className="w-8 h-px bg-[#1A1A1A]/30 mb-4" />
                      <h4 className="text-[16px] leading-snug text-[#1A1A1A] font-medium mb-3 font-display">
                        {q.title}
                      </h4>
                      <p className="text-[12.5px] leading-[1.75] text-[#666666] flex-1">
                        {q.desc}
                      </p>
                      {(() => {
                        const articleLinks = q.links.filter(l => l.kind === "文章");
                        const allDraft = articleLinks.length > 0 && articleLinks.every(l => l.draft);
                        return (
                          <div className="mt-5 pt-4 border-t border-[#1A1A1A]/[0.06] flex items-center justify-between text-[11px] text-[#999999]">
                            {allDraft ? (
                              <span className="text-[9px] tracking-[0.22em] uppercase text-[#C4463A]/70 border border-[#C4463A]/30 px-2 py-0.5 rounded-sm">
                                作者还在写作中
                              </span>
                            ) : (
                              <span />
                            )}
                            <ArrowUpRight size={12} />
                          </div>
                        );
                      })()}
                    </div>

                    {/* Hover popover with related links */}
                    <div
                      className="pointer-events-none group-hover:pointer-events-auto absolute left-1/2 top-full -translate-x-1/2 w-[340px] z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pt-3"
                    >
                      <div
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          background: "rgba(34, 32, 28, 0.78)",
                          backdropFilter: "blur(14px) saturate(120%)",
                          WebkitBackdropFilter: "blur(14px) saturate(120%)",
                          boxShadow:
                            "0 24px 60px -16px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.05) inset",
                        }}
                      >
                        <ul className="py-1.5">
                          {q.links.map((l, idx) => (
                            <li
                              key={idx}
                              className={
                                idx > 0
                                  ? "border-t border-white/[0.06]"
                                  : ""
                              }
                            >
                              {l.draft ? (
                                <div className="flex items-center gap-4 px-5 py-3 text-[13px] cursor-default opacity-50">
                                  <span className="text-[10px] tracking-[0.22em] uppercase text-white/45 w-12 shrink-0">
                                    {l.kind}
                                  </span>
                                  <span className="flex-1 text-white/60 leading-snug font-light line-through decoration-white/25">
                                    {l.title}
                                  </span>
                                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#C4463A]/80 border border-[#C4463A]/40 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                    撰写中
                                  </span>
                                </div>
                              ) : (
                                <Link
                                  to={l.to}
                                  className="group/row flex items-center gap-4 px-5 py-3 text-[13px] hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-[10px] tracking-[0.22em] uppercase text-white/45 w-12 shrink-0">
                                    {l.kind}
                                  </span>
                                  <span className="flex-1 text-white/90 leading-snug font-light">
                                    {l.title}
                                  </span>
                                  <ArrowUpRight
                                    size={13}
                                    className="text-white/30 group-hover/row:text-white/85 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 transition-all"
                                  />
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </section>

        </div>
      </main>

      {/* 博客 · 第3区 #F3F0EA with warm spotlight */}
      <section
        className="w-full relative"
        style={{
          background:
            "radial-gradient(80% 50% at 50% 0%, #F8F3E8 0%, #F3F0EA 55%, #EDE9DF 100%)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgba(255,225,180,0.20) 0%, rgba(255,225,180,0) 70%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, rgba(40,28,12,0.08) 0%, rgba(40,28,12,0) 100%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-10 lg:px-16 py-24">
          <div className="flex items-end gap-4 mb-12">
            <h3 className="text-[40px] leading-none tracking-tight text-[#1A1A1A] font-display whitespace-nowrap">
              博客
            </h3>
            <span className="w-20 h-px bg-[#C4463A]/80 mb-3" />
          </div>

          {/* Featured */}
          {featured && (
            <Link
              to={`/blog/${featured.id}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1A1A1A]/[0.10] items-start"
            >
              <div className="lg:col-span-6 relative aspect-[4/3] overflow-hidden rounded-sm shadow-[0_10px_30px_-12px_rgba(40,30,15,0.20)]">
                <ImageWithFallback
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="lg:col-span-6">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#C4463A] mb-5">
                  Editor's Pick
                </div>
                <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-[#999] mb-4">
                  <span className="px-2 py-0.5 border border-[#1A1A1A]/15 rounded-sm text-[#1A1A1A]/80">
                    {featured.category}
                  </span>
                  <span>{fmtDate(featured.date)}</span>
                </div>
                <h4 className="font-display text-[36px] leading-[1.15] text-[#1A1A1A] mb-5 group-hover:underline underline-offset-8 decoration-[#C4463A]/70">
                  {featured.title}
                </h4>
                <p className="text-[14.5px] leading-[1.9] text-[#555]">
                  {featured.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-[12px] tracking-wider text-[#1A1A1A]">
                  阅读全文
                  <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* More Articles */}
          <div className="flex items-center justify-between mt-14 mb-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#999]">More Articles</div>
            <Link to="/blog" className="text-[11px] tracking-[0.18em] uppercase text-[#999] hover:text-[#1A1A1A]">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#1A1A1A]/[0.10]">
            {moreArticles.map((p, i) => (
              <Link
                key={p.id}
                to={`/blog/${p.id}`}
                className={`group flex flex-col py-8 px-6 ${
                  i !== moreArticles.length - 1 ? "lg:border-r border-[#1A1A1A]/[0.10]" : ""
                } hover:bg-[#FAF7F1] transition-colors`}
              >
                <div className="flex items-center justify-between mb-4 text-[10px] tracking-[0.22em] uppercase">
                  <span className="text-[#1A1A1A]/70">{p.category}</span>
                  <span className="text-[#999]">No. {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h5 className="font-display text-[20px] leading-[1.25] text-[#1A1A1A] mb-3 group-hover:text-[#C4463A] transition-colors">
                  {p.title}
                </h5>
                <p className="text-[12.5px] leading-[1.85] text-[#666] flex-1 line-clamp-4">
                  {p.excerpt}
                </p>
                <div className="mt-5 text-[10px] tracking-[0.22em] uppercase text-[#999]">
                  {fmtDate(p.date)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 探索更多入口 (热点 / Agent / 资料库 / 图册) */}
      <section
        className="w-full relative"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 100%, #ECE7DB 0%, #F0EDE7 60%, #F4F0E7 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-10 lg:px-16 py-24">
          <div className="flex items-end gap-4 mb-10">
            <h3 className="text-[40px] leading-none tracking-tight text-[#1A1A1A] font-display whitespace-nowrap">
              探索更多
            </h3>
            <span className="w-20 h-px bg-[#C4463A]/80 mb-3" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "热点", en: "Trending", desc: "本周值得追踪的 AI 信号", to: "/trending", bg: "#F3F0EA", img: tileTrending },
              { label: "Agent", en: "Agents", desc: "可用的智能体与工作流", to: "/agents", bg: "#F0EDE7", img: tileAgents },
              { label: "资料库", en: "Resources", desc: "长期沉淀的文献与笔记", to: "/resources", bg: "#F3F0EA", img: tileResources },
              { label: "图册", en: "Gallery", desc: "影像与视觉碎片收藏", to: "/gallery", bg: "#F0EDE7", img: tileGallery },
            ].map((tile) => (
              <Link
                key={tile.to}
                to={tile.to}
                className="group relative overflow-hidden rounded-md aspect-[4/5] border border-[#1A1A1A]/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(40,30,15,0.22)] shadow-[0_2px_10px_-4px_rgba(40,30,15,0.10)] flex flex-col"
                style={{ background: tile.bg }}
              >
                {/* Image area (top ~58%) */}
                <div className="relative w-full overflow-hidden" style={{ flex: "0 0 58%" }}>
                  <img
                    src={tile.img}
                    alt={tile.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* fade into label area */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${tile.bg} 100%)`,
                    }}
                  />
                </div>

                {/* Label area */}
                <div className="relative z-10 flex-1 flex flex-col p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#999]">
                      {tile.en}
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                  <div className="font-display text-[24px] leading-none text-[#1A1A1A] mb-2">
                    {tile.label}
                  </div>
                  <div className="text-[12px] leading-[1.6] text-[#666]">
                    {tile.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="px-10 lg:px-16 pb-10 pt-8 border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <Logo size={44} />
            <div className="text-[12px] text-[#999999] mt-3">
              观察 AI 时代的组织、工具与人。
            </div>
          </div>
          <div className="text-[12px] text-[#999999]">© 2026</div>
        </div>
      </footer>
    </div>
    </>
  );
}

export default HomeV3;
