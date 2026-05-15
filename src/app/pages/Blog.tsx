import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";
import { postsApi } from "../../utils/api";

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

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("全部");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await postsApi.getAll();
      if (data && !error) setPosts(data);
      else console.error("Failed to load posts:", error);
      setLoading(false);
    })();
  }, []);

  const dynamicCategories = Array.from(new Set(posts.map((p) => p.category)));
  const categories = ["全部", ...(dynamicCategories.length ? dynamicCategories : ["人工智能", "设计", "前端开发", "生产力"])];

  const filteredPosts =
    selectedCategory === "全部" ? posts : posts.filter((p) => p.category === selectedCategory);

  const fmtDate = (d?: string) => (d ? d.replace(/-/g, " / ").replace(/T.*$/, "") : "");

  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="博客"
        excerpt="关于 AI、组织、个人成长的长文与短札。每一篇都是一次和读者的对话——不追热点，只留沉淀。"
        meta={`Vol. ${new Date().getFullYear() - 2025} · ${posts.length} entries`}
        bg="#F5F2ED"
      />

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-14">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              data-active={category === selectedCategory}
              className="filter-pill"
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">
            Loading…
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">
            该分类下暂无文章
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {filteredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-5 shadow-[0_6px_22px_-10px_rgba(40,30,15,0.22)]">
                  <ImageWithFallback
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="chip">{post.category}</span>
                  <span className="text-[10px] tracking-[0.22em] uppercase text-[#999]">
                    {fmtDate(post.date)}
                  </span>
                </div>
                <h3 className="font-display text-[22px] leading-[1.25] text-[#1A1A1A] mb-3 group-hover:text-[#C4463A] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[13.5px] leading-[1.85] text-[#555] line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#1A1A1A]">
                  阅读全文
                  <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
