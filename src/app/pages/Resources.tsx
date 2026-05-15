import { useState, useEffect } from "react";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  ExternalLink,
  X,
  BookOpen,
  Github,
  File,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHeader } from "../components/PageHeader";
import { resourcesApi } from "../../utils/api";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "link" | "download" | "obsidian";
  category: string;
  date?: string;
  size?: string;
  url?: string;
  icon?: string;
  content?: string;
  tags?: string[];
  obsidian_links?: string[];
  createdAt?: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  document: FileText,
  video: Video,
  link: LinkIcon,
  download: Download,
  obsidian: BookOpen,
  github: Github,
};

const TYPE_LABEL: Record<string, string> = {
  document: "文档",
  video: "视频",
  link: "链接",
  download: "下载",
  obsidian: "笔记",
  github: "GitHub",
};

export function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await resourcesApi.getAll();
      setResources(data || []);
      setLoading(false);
    })();
  }, []);

  const dynamicCategories = Array.from(new Set(resources.map((r) => r.category)));
  const categories = ["全部", ...(dynamicCategories.length ? dynamicCategories : ["技术文档", "视频教程", "工具链接", "资源下载", "知识笔记", "其他"])];

  const filteredResources =
    selectedCategory === "全部" ? resources : resources.filter((r) => r.category === selectedCategory);

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === "obsidian" && resource.content) setSelectedResource(resource);
    else if (resource.url) window.open(resource.url, "_blank");
  };

  const renderMarkdownWithLinks = (content: string) => {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    return content.replace(linkRegex, (_m, linkText) => {
      const found = resources.find((r) => r.title === linkText);
      return found ? `[${linkText}](#${found.id})` : `**${linkText}**`;
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="The Library"
        title="资料库"
        excerpt="长期沉淀的文献、笔记、视频与工具——一座私人的索引库，所有的线索都从这里出发。"
        meta={`${resources.length} entries · ${categories.length - 1} categories`}
        bg="#F3F0EA"
      />

      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
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
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-24 text-[12px] tracking-[0.22em] uppercase text-[#999]">
            该分类下暂无资源
          </div>
        ) : (
          <ul className="border-t border-[#1A1A1A]/[0.10]">
            {filteredResources.map((resource) => {
              const Icon = TYPE_ICON[resource.type] ?? File;
              return (
                <li
                  key={resource.id}
                  onClick={() => handleResourceClick(resource)}
                  className="group cursor-pointer border-b border-[#1A1A1A]/[0.10] py-7 grid grid-cols-12 gap-6 items-start hover:bg-[#FAF7F1] transition-colors px-3 -mx-3"
                >
                  <div className="col-span-12 md:col-span-2 flex items-center gap-3">
                    <span className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A]">
                      {TYPE_LABEL[resource.type]}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <h3 className="font-display text-[22px] leading-[1.25] text-[#1A1A1A] mb-2 group-hover:text-[#C4463A] transition-colors">
                      {resource.icon && <span className="mr-2 text-[#1A1A1A]/40">{resource.icon}</span>}
                      {resource.title}
                    </h3>
                    <p className="text-[13.5px] leading-[1.85] text-[#555] mb-3">{resource.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.22em] uppercase text-[#999]">
                      <span>{resource.category}</span>
                      {resource.date && <span>{resource.date}</span>}
                      {resource.size && <span>{resource.size}</span>}
                      {resource.tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[#1A1A1A]/55">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3 flex items-start justify-end">
                    <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#1A1A1A]">
                      {resource.type === "obsidian" ? (
                        <>
                          <BookOpen size={13} />
                          阅读笔记
                        </>
                      ) : (
                        <>
                          打开链接
                          <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </div>
                    <Icon className="ml-4 w-5 h-5 text-[#1A1A1A]/25 group-hover:text-[#C4463A] transition-colors" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-[#1A1A1A]/[0.10]">
          {[
            { label: "总资源数", value: resources.length },
            { label: "分类", value: Math.max(0, categories.length - 1) },
            { label: "Obsidian 笔记", value: resources.filter((r) => r.type === "obsidian").length },
            { label: "更新", value: "实时" },
          ].map((s, i) => (
            <div key={i} className={`py-8 px-4 ${i !== 3 ? "md:border-r border-[#1A1A1A]/[0.10]" : ""}`}>
              <div className="font-display text-[40px] leading-none text-[#1A1A1A] mb-3">{s.value}</div>
              <div className="text-[10px] tracking-[0.32em] uppercase text-[#999]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Obsidian viewer */}
      {selectedResource && selectedResource.type === "obsidian" && selectedResource.content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/70 backdrop-blur-sm p-4">
          <div className="bg-[#F8F6F2] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm">
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#1A1A1A]/[0.10]">
              <div>
                <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A] mb-2">
                  {selectedResource.category} · Obsidian Note
                </div>
                <h2 className="font-display text-[26px] leading-tight text-[#1A1A1A]">
                  {selectedResource.icon && (
                    <span className="mr-2 text-[#1A1A1A]/40">{selectedResource.icon}</span>
                  )}
                  {selectedResource.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 text-[#555] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="magazine-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {renderMarkdownWithLinks(selectedResource.content)}
                </ReactMarkdown>
              </div>

              {selectedResource.obsidian_links && selectedResource.obsidian_links.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#1A1A1A]/[0.10]">
                  <div className="text-[10px] tracking-[0.32em] uppercase text-[#999] mb-4">Linked Notes</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.obsidian_links.map((link) => {
                      const linked = resources.find((r) => r.title === link);
                      return (
                        <button
                          key={link}
                          onClick={() => linked && setSelectedResource(linked)}
                          disabled={!linked}
                          className={`px-3 py-1.5 text-[12px] border rounded-sm transition-colors ${
                            linked
                              ? "border-[#C4463A]/40 text-[#C4463A] hover:bg-[#C4463A]/10"
                              : "border-[#1A1A1A]/15 text-[#999] cursor-not-allowed"
                          }`}
                        >
                          [[{link}]]
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {selectedResource.tags.map((tag) => (
                    <span key={tag} className="text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A]/55">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="px-7 py-4 border-t border-[#1A1A1A]/[0.10] flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-[#999]">
              <div>{selectedResource.date || selectedResource.createdAt}</div>
              {selectedResource.url && (
                <a
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#C4463A] accent-link"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
