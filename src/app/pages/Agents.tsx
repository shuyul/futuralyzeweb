import { useState, useEffect } from "react";
import { ExternalLink, X, Maximize2, ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";
import { agentsApi } from "../../utils/api";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  icon?: string;
  tags: string[];
  url?: string;
  embedUrl?: string;
  embedCode?: string;
  displayMode?: string;
  type?: string;
  featured?: boolean;
  usageCount?: number;
}

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await agentsApi.getAll();
      if (data && !error) setAgents(data);
      setLoading(false);
    })();
  }, []);

  const dynamicCategories = Array.from(new Set(agents.map((a) => a.category)));
  const categories = ["全部", ...(dynamicCategories.length ? dynamicCategories : ["内容创作", "开发工具", "设计工具", "数据分析", "生产力"])];

  const filteredAgents =
    selectedCategory === "全部" ? agents : agents.filter((a) => a.category === selectedCategory);

  const featuredAgents = agents.filter((a) => a.featured);
  const regularAgents = filteredAgents.filter((a) => !a.featured);

  const handleAgentClick = (agent: Agent) => {
    if (agent.displayMode === "embed" && agent.embedUrl) setSelectedAgent(agent);
    else if (agent.url) window.open(agent.url, "_blank");
  };

  const AgentCard = ({ agent, featured }: { agent: Agent; featured?: boolean }) => (
    <button
      onClick={() => handleAgentClick(agent)}
      className="group text-left flex flex-col hairline-card overflow-hidden"
    >
      {agent.image ? (
        <div className={`relative overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
          <ImageWithFallback
            src={agent.image}
            alt={agent.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
      ) : (
        <div className={`relative overflow-hidden flex items-center justify-center ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}
          style={{ background: "linear-gradient(135deg,#F0EDE7 0%,#E8E3D9 100%)" }}>
          <span className="font-display text-[64px] text-[#1A1A1A]/30">{agent.icon || "◆"}</span>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="chip">{agent.category}</span>
          {featured && <span className="chip chip-red">Featured</span>}
        </div>
        <h3 className={`font-display ${featured ? "text-[24px]" : "text-[19px]"} leading-[1.25] text-[#1A1A1A] mb-3 group-hover:text-[#C4463A] transition-colors`}>
          {agent.name}
        </h3>
        <p className="text-[13px] leading-[1.85] text-[#555] line-clamp-3 flex-1">
          {agent.description}
        </p>
        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {agent.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] tracking-[0.15em] uppercase text-[#999]">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#1A1A1A]">
          {agent.displayMode === "embed" ? (
            <>
              <Maximize2 size={12} />
              打开 Agent
            </>
          ) : (
            <>
              访问 Agent
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <>
      <PageHeader
        eyebrow="The Workbench"
        title="Agents"
        excerpt="精选与自建的智能体工具集——为每一个具体场景，挑出一件趁手的工具。"
        meta={`${agents.length} agents · ${categories.length - 1} categories`}
        bg="#F3F0EA"
      />

      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
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
          <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">Loading…</div>
        ) : (
          <>
            {featuredAgents.length > 0 && (
              <div className="mb-20">
                <div className="flex items-end gap-4 mb-8">
                  <h2 className="font-display text-[32px] leading-none tracking-tight text-[#1A1A1A]">精选推荐</h2>
                  <span className="w-16 h-px bg-[#C4463A]/80 mb-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} featured />
                  ))}
                </div>
              </div>
            )}

            {regularAgents.length > 0 ? (
              <div>
                <div className="flex items-end gap-4 mb-8">
                  <h2 className="font-display text-[28px] leading-none tracking-tight text-[#1A1A1A]">
                    {selectedCategory === "全部" ? "全部工具" : selectedCategory}
                  </h2>
                  <span className="w-12 h-px bg-[#1A1A1A]/30 mb-2.5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">
                还没有添加任何 Agent · 访问管理后台开始
              </div>
            ) : (
              <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">
                该分类下暂无 Agent
              </div>
            )}
          </>
        )}
      </section>

      {/* Embed modal */}
      {selectedAgent && selectedAgent.displayMode === "embed" && selectedAgent.embedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/70 backdrop-blur-sm p-4">
          <div className="bg-[#F8F6F2] shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col rounded-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]/[0.10]">
              <div className="flex items-center gap-3">
                <span className="font-display text-[24px] text-[#C4463A]">{selectedAgent.icon || "◆"}</span>
                <div>
                  <h2 className="font-display text-[20px] text-[#1A1A1A]">{selectedAgent.name}</h2>
                  <p className="text-[12px] text-[#666]">{selectedAgent.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-[#555] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <iframe
                src={selectedAgent.embedUrl}
                title={selectedAgent.name}
                className="w-full h-full border-0"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                allow="camera; microphone; geolocation"
              />
            </div>
            <div className="px-6 py-3 border-t border-[#1A1A1A]/[0.10] text-[11px] tracking-[0.18em] uppercase text-[#999] flex items-center justify-between">
              <div className="flex gap-3">
                {selectedAgent.tags?.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
              <a
                href={selectedAgent.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#C4463A] accent-link"
              >
                新窗口打开
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
