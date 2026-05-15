import { useState } from "react";
import { X, Download, Heart, Eye } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";

interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  location?: string;
  date: string;
  category: string;
  likes: number;
  views: number;
}

export function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const photos: Photo[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1616386573884-22531fd226e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      title: "山峦叠嶂",
      description: "清晨的第一缕阳光照亮了远方的山峰",
      location: "新疆·天山",
      date: "2026-03-15",
      category: "风光",
      likes: 234,
      views: 1520,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1756888203326-ae6c40f278e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      title: "都市夜色",
      description: "城市的霓虹在夜幕中闪耀",
      location: "上海·外滩",
      date: "2026-03-10",
      category: "城市",
      likes: 189,
      views: 980,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1658806264102-2c516eae5e05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      title: "科技之光",
      description: "抽象的光影展现科技的魅力",
      date: "2026-03-05",
      category: "抽象",
      likes: 156,
      views: 720,
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1505209487757-5114235191e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      title: "简约工作间",
      description: "极简主义的工作空间美学",
      location: "北京·工作室",
      date: "2026-02-28",
      category: "生活",
      likes: 312,
      views: 1850,
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1717501219263-9aa2d6a768d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      title: "神经网络",
      description: "AI 艺术的视觉呈现",
      date: "2026-02-20",
      category: "抽象",
      likes: 278,
      views: 1340,
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1564316912292-de44e84f8fc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80",
      title: "知识殿堂",
      description: "书籍堆叠成的智慧之塔",
      location: "杭州·图书馆",
      date: "2026-02-15",
      category: "文化",
      likes: 445,
      views: 2100,
    },
  ];

  const categories = ["全部", "风光", "城市", "抽象", "生活", "文化"];
  const filtered = selectedCategory === "全部" ? photos : photos.filter((p) => p.category === selectedCategory);

  return (
    <>
      <PageHeader
        eyebrow="The Gallery"
        title="图册"
        excerpt="影像与视觉碎片的收藏室——一张照片就是一个被定格的瞬间，关于时间、关于光、关于此处。"
        meta={`${photos.length} frames · curated`}
        bg="#F0EDE7"
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

        {/* Magazine-style asymmetric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-5">
          {filtered.map((photo, i) => {
            const span = [
              "col-span-2 lg:col-span-7 aspect-[4/3]",
              "col-span-2 lg:col-span-5 aspect-[4/3]",
              "col-span-1 lg:col-span-4 aspect-[3/4]",
              "col-span-1 lg:col-span-4 aspect-[3/4]",
              "col-span-2 lg:col-span-4 aspect-[3/4]",
              "col-span-2 lg:col-span-12 aspect-[16/7]",
            ];
            return (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`group relative overflow-hidden rounded-sm bg-[#E8E3D9] ${span[i % span.length]}`}
              >
                <ImageWithFallback
                  src={photo.url}
                  alt={photo.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(20,15,8,0.85) 0%, rgba(20,15,8,0.15) 55%, rgba(20,15,8,0) 100%)",
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] tracking-[0.32em] uppercase text-[#F8F6F2]/0 group-hover:text-[#F8F6F2]/90 transition-colors">
                    {photo.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                  <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A] mb-2">
                    {photo.location || "Untitled"}
                  </div>
                  <h3 className="font-display text-[22px] text-[#F8F6F2] mb-1.5 leading-tight">
                    {photo.title}
                  </h3>
                  <p className="text-[12px] text-[#F8F6F2]/75 leading-relaxed line-clamp-2">
                    {photo.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1A1A]/95 flex items-center justify-center p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 text-[#F8F6F2]/70 hover:text-[#F8F6F2] transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video overflow-hidden rounded-sm mb-8">
              <ImageWithFallback
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[#F8F6F2]">
              <div className="flex items-start justify-between gap-6 mb-5">
                <div>
                  <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A] mb-3">
                    {selectedPhoto.category}
                  </div>
                  <h2 className="font-display text-[36px] leading-tight mb-3">{selectedPhoto.title}</h2>
                  <p className="text-[14px] text-[#F8F6F2]/75 leading-relaxed mb-2">{selectedPhoto.description}</p>
                  {selectedPhoto.location && (
                    <p className="text-[11px] tracking-[0.22em] uppercase text-[#F8F6F2]/50">{selectedPhoto.location}</p>
                  )}
                </div>
                <button className="p-2 text-[#F8F6F2]/70 hover:text-[#F8F6F2] transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-6 text-[11px] tracking-[0.22em] uppercase text-[#F8F6F2]/50">
                <span>{selectedPhoto.date}</span>
                <span className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" />
                  {selectedPhoto.likes}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  {selectedPhoto.views}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
