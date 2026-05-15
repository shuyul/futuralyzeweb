import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { postsApi } from "../../utils/api";

export function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await postsApi.getById(id);
      if (data && !error) setPost(data);
      else console.error("Failed to load post:", error);
      setLoading(false);
    })();
  }, [id]);

  const fmtDate = (d?: string) => (d ? d.replace(/-/g, " / ").replace(/T.*$/, "") : "");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[12px] tracking-[0.22em] uppercase text-[#999]">
        Loading…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-[28px] text-[#1A1A1A] mb-4">文章未找到</div>
          <Link to="/blog" className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#C4463A] accent-link">
            <ArrowLeft size={13} />
            返回博客列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article>
      {/* Hero */}
      <section
        className="w-full border-b border-[#1A1A1A]/[0.10]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 65%), #F5F2ED",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#555] hover:text-[#1A1A1A] transition-colors mb-12"
          >
            <ArrowLeft size={13} />
            返回博客列表
          </Link>

          <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A] mb-5">
            {post.category || "Article"}
          </div>

          <h1 className="font-display text-[44px] md:text-[56px] leading-[1.05] tracking-tight text-[#1A1A1A] mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] tracking-[0.22em] uppercase text-[#999] mb-10">
            <span>{fmtDate(post.date)}</span>
            {post.readTime && <span>{post.readTime}</span>}
            {typeof post.views === "number" && <span>{post.views} views</span>}
          </div>

          <div className="flex items-center gap-3">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                if (navigator.share) navigator.share({ title: post.title, url: window.location.href });
                else navigator.clipboard?.writeText(window.location.href);
              }}
              className="ml-auto inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#555] hover:text-[#1A1A1A] transition-colors"
            >
              <Share2 size={13} />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* Cover */}
      {post.image && (
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 -mt-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm shadow-[0_18px_50px_-22px_rgba(40,30,15,0.4)]">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="magazine-prose">
          {post.content ? (
            post.content.split("\n\n").map((paragraph: string, index: number) => {
              if (paragraph.startsWith("## ")) {
                return <h2 key={index}>{paragraph.replace("## ", "")}</h2>;
              }
              if (paragraph.startsWith("### ")) {
                return <h3 key={index}>{paragraph.replace("### ", "")}</h3>;
              }
              if (paragraph.startsWith("> ")) {
                return <blockquote key={index}>{paragraph.replace(/^>\s?/, "")}</blockquote>;
              }
              if (paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={index}>
                    {items.map((item, i) => (
                      <li key={i}>{item.replace(/^-\s/, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.match(/^\d+\./)) {
                const items = paragraph.split("\n");
                return (
                  <ol key={index}>
                    {items.map((item, i) => (
                      <li key={i}>{item.replace(/^\d+\.\s/, "")}</li>
                    ))}
                  </ol>
                );
              }
              if (paragraph.trim()) return <p key={index}>{paragraph}</p>;
              return null;
            })
          ) : (
            <p>{post.excerpt}</p>
          )}
        </div>
      </section>

      {/* Related */}
      <section
        className="border-t border-[#1A1A1A]/[0.10]"
        style={{ background: "#F3F0EA" }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
          <div className="flex items-end gap-4 mb-8">
            <h3 className="font-display text-[32px] leading-none tracking-tight text-[#1A1A1A]">相关阅读</h3>
            <span className="w-16 h-px bg-[#C4463A]/80 mb-3" />
          </div>
          <div className="text-[12px] tracking-[0.22em] uppercase text-[#999]">More to come…</div>
        </div>
      </section>
    </article>
  );
}
