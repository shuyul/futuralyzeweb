import { useState, useEffect } from "react";
import { ExternalLink, RefreshCw, Loader2, Star } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { trendingApi } from "../../utils/api";

interface TrendingItem {
  id: string;
  title: string;
  description?: string;
  source: string;
  category: string;
  priority?: number;
  score?: number;
  date: string;
  url?: string;
  read?: boolean;
}

export function Trending() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);
  const [selectedSource, setSelectedSource] = useState("全部");
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("trending_read");
    if (saved) setReadItems(new Set(JSON.parse(saved)));
  }, []);

  const saveReadItems = (set: Set<string>) =>
    localStorage.setItem("trending_read", JSON.stringify(Array.from(set)));

  const loadTrending = async () => {
    setLoading(true);
    try {
      const { data, error } = await trendingApi.getAll();
      if (error) console.error("加载失败:", error);
      else setItems(data || []);
    } catch (e) {
      console.error("加载失败:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, []);

  const handleAggregate = async () => {
    if (aggregating) return;
    setAggregating(true);
    try {
      const { projectId, publicAnonKey } = await import("/utils/supabase/info");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-41c81a90/aggregate-rss`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.error) alert("聚合失败: " + result.error);
      else {
        alert(
          `✅ ${result.data.message}\n聚合 ${result.data.total} 条\n去重 ${result.data.unique} 条\n新增 ${result.data.saved} 条`
        );
        await loadTrending();
      }
    } catch (error) {
      console.error("聚合失败:", error);
      alert("聚合失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setAggregating(false);
    }
  };

  const markAsRead = (id: string) => {
    const next = new Set(readItems);
    next.add(id);
    setReadItems(next);
    saveReadItems(next);
  };

  const openLink = (item: TrendingItem) => {
    if (!item.url) return;
    markAsRead(item.id);
    window.open(item.url, "_blank");
  };

  const sources = ["全部", ...Array.from(new Set(items.map((i) => i.source)))];
  const filteredItems =
    selectedSource === "全部" ? items : items.filter((i) => i.source === selectedSource);

  const priorityItems = filteredItems.filter((i) => i.priority === 1);
  const otherItems = filteredItems.filter((i) => i.priority !== 1);

  const ItemRow = ({ item, featured }: { item: TrendingItem; featured?: boolean }) => {
    const isRead = readItems.has(item.id);
    return (
      <button
        onClick={() => openLink(item)}
        className={`group w-full text-left grid grid-cols-12 gap-6 py-7 px-3 -mx-3 border-b border-[#1A1A1A]/[0.10] hover:bg-[#FAF7F1] transition-colors ${
          isRead ? "opacity-55" : ""
        }`}
      >
        <div className="col-span-12 md:col-span-2 flex items-start gap-2">
          {featured && <Star className="w-4 h-4 text-[#C4463A] mt-0.5" fill="#C4463A" />}
          <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A]">
            {featured ? "必读" : `#${item.priority || "–"}`}
          </div>
        </div>
        <div className="col-span-12 md:col-span-8">
          <h3 className={`font-display ${featured ? "text-[24px]" : "text-[19px]"} leading-[1.25] text-[#1A1A1A] mb-2 group-hover:text-[#C4463A] transition-colors`}>
            {item.title}
          </h3>
          {item.description && (
            <p className="text-[13px] leading-[1.85] text-[#555] line-clamp-2 mb-3">{item.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.22em] uppercase text-[#999]">
            <span className="text-[#1A1A1A]/70">{item.source}</span>
            <span>{new Date(item.date).toLocaleDateString("zh-CN")}</span>
            <span>{item.category}</span>
            {typeof item.score === "number" && <span>score {item.score.toFixed(1)}</span>}
            {isRead && <span className="text-[#1A1A1A]/40">已读</span>}
          </div>
        </div>
        <div className="col-span-12 md:col-span-2 flex items-start justify-end">
          <ExternalLink className="w-4 h-4 text-[#1A1A1A]/30 group-hover:text-[#C4463A] transition-colors" />
        </div>
      </button>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="The Signals"
        title="热点"
        excerpt="RSS 聚合 · 策展式信源 · 专注高质量信号——筛掉 90% 的噪音，留下值得花十分钟读完的那些。"
        meta={`${items.length} signals · ${new Date().toLocaleDateString("zh-CN")}`}
        bg="#F0EDE7"
      >
        <button
          onClick={handleAggregate}
          disabled={aggregating}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F8F6F2] transition-colors disabled:opacity-50"
        >
          {aggregating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              聚合中
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              手动刷新
            </>
          )}
        </button>
      </PageHeader>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
        <div className="flex flex-wrap gap-2 mb-14">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              data-active={source === selectedSource}
              className="filter-pill"
            >
              {source}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">Loading…</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-[12px] tracking-[0.22em] uppercase text-[#999] mb-6">暂无内容</div>
            <button
              onClick={handleAggregate}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F8F6F2] transition-colors"
            >
              立即聚合
            </button>
          </div>
        ) : (
          <>
            {priorityItems.length > 0 && (
              <div className="mb-16">
                <div className="flex items-end gap-4 mb-6">
                  <h2 className="font-display text-[32px] leading-none tracking-tight text-[#1A1A1A]">
                    第一梯队
                  </h2>
                  <span className="w-16 h-px bg-[#C4463A]/80 mb-3" />
                </div>
                <div className="border-t border-[#1A1A1A]/[0.10]">
                  {priorityItems.map((item) => (
                    <ItemRow key={item.id} item={item} featured />
                  ))}
                </div>
              </div>
            )}

            {otherItems.length > 0 && (
              <div>
                <div className="flex items-end gap-4 mb-6">
                  <h2 className="font-display text-[28px] leading-none tracking-tight text-[#1A1A1A]">
                    其他信号
                  </h2>
                  <span className="w-12 h-px bg-[#1A1A1A]/30 mb-2.5" />
                </div>
                <div className="border-t border-[#1A1A1A]/[0.10]">
                  {otherItems.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
