import { useState, useEffect } from "react";
import { Plus, Edit, Pencil, Trash2, Save, X, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Wand2, FileText, Eye, EyeOff, Heart, Sparkles, Lightbulb, Palette, Zap, Settings, Star, BookOpen, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postsApi, photosApi, agentsApi, resourcesApi, trendingApi, initData, uploadImage, kv } from "../../utils/api";
import { calculateReadTime } from "../../utils/readTime";
import { autoFormat, checkFormat, generateFormatReport, getFormatStats, type FormatIssue } from "../../utils/formatChecker";
import { analyzeArtStyle, generateSmartDescription, identifyArtwork, suggestArtisticTitles, type ArtAnalysis, type SmartDescription } from "../../utils/aiArtist";
import { compressImage, getImageInfo } from "../../utils/imageCompression";

type Tab = "posts" | "photos" | "agents" | "resources" | "trending" | "issue";

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: apiError } = await postsApi.getAll();
      
      if (apiError) {
        setError("无法连接到后端服务器：" + apiError);
        setIsInitialized(false);
      } else {
        setIsInitialized(data && data.length > 0);
      }
    } catch (err) {
      console.error("Admin initialization error:", err);
      setError("加载失败：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitData = async () => {
    try {
      const { error: apiError } = await initData();
      if (!apiError) {
        alert("示例数据已初始化！");
        setIsInitialized(true);
        window.location.reload();
      } else {
        alert("初始化失败：" + apiError);
      }
    } catch (err) {
      alert("初始化失败：" + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600">正在加载管理后台...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">连接失败</h2>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={checkInitialization}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">内容管理后台</h1>
              <p className="text-sm text-zinc-600 mt-1">Futuralyze CMS</p>
            </div>
            {!isInitialized && (
              <button
                onClick={handleInitData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                初始化示例数据
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: "posts", label: "📝 博客文章" },
              { id: "photos", label: "🖼️ 图册" },
              { id: "agents", label: "🤖 Agents" },
              { id: "resources", label: "📚 资源库" },
              { id: "trending", label: "🔥 热点" },
              { id: "issue", label: "📌 专题导读" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "posts" && <PostsManager />}
        {activeTab === "photos" && <PhotosManager />}
        {activeTab === "agents" && <AgentsManager />}
        {activeTab === "resources" && <ResourcesManager />}
        {activeTab === "trending" && <TrendingManager />}
        {activeTab === "issue" && <IssueManager />}
      </div>
    </div>
  );
}

// ============================================
// Posts Manager
// ============================================

function PostsManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formatIssues, setFormatIssues] = useState<FormatIssue[]>([]);
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  // Check format when content changes
  useEffect(() => {
    if (editingPost?.content) {
      const issues = checkFormat(editingPost.content);
      setFormatIssues(issues);
    } else {
      setFormatIssues([]);
    }
  }, [editingPost?.content]);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await postsApi.getAll();
    if (data && !error) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingPost({
      title: "",
      excerpt: "",
      content: "",
      date: new Date().toISOString().split('T')[0],
      category: "人工智能",
      tags: [],
      image: "",
      readTime: "1 分钟", // Will be auto-calculated
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    // Auto-calculate read time based on content
    const readTime = calculateReadTime(editingPost.content);
    const postToSave = {
      ...editingPost,
      readTime,
    };

    if (isCreating) {
      const { error } = await postsApi.create(postToSave);
      if (!error) {
        await loadPosts();
        setIsCreating(false);
        setEditingPost(null);
      } else {
        alert("保存失败：" + error);
      }
    } else {
      const { error } = await postsApi.update(postToSave.id, postToSave);
      if (!error) {
        await loadPosts();
        setEditingPost(null);
      } else {
        alert("更新失败：" + error);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setUploading(true);
    try {
      // 获取原始图片信息
      const info = await getImageInfo(file);
      console.log(`原始图片: ${info.width}x${info.height}, ${info.sizeMB.toFixed(2)}MB`);

      // 压缩图片
      let fileToUpload = file;
      if (info.sizeMB > 0.5) {
        console.log('压缩图片中...');
        fileToUpload = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeMB: 2,
        });
        const compressedInfo = await getImageInfo(fileToUpload);
        console.log(`压缩后: ${compressedInfo.width}x${compressedInfo.height}, ${compressedInfo.sizeMB.toFixed(2)}MB`);
      }

      // 上传
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const { data, error } = await uploadImage(formData);

      if (data && !error) {
        setEditingPost({ ...editingPost, image: data.url });
      } else {
        alert('上传失败：' + error);
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      alert('上传失败：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这篇文章吗？")) {
      const { error } = await postsApi.delete(id);
      if (!error) {
        await loadPosts();
      } else {
        alert("删除失败：" + error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (editingPost) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{isCreating ? "新建文章" : "编辑文章"}</h2>
          <button
            onClick={() => {
              setEditingPost(null);
              setIsCreating(false);
            }}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">标题</label>
            <input
              type="text"
              value={editingPost.title}
              onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">摘要</label>
            <textarea
              value={editingPost.excerpt}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              正文
              <span className="ml-2 text-xs text-zinc-500">
                (阅读时间将自动计算: {calculateReadTime(editingPost.content)})
              </span>
            </label>
            
            {/* Format Toolbar */}
            <div className="flex items-center justify-between mb-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const formatted = autoFormat(editingPost.content);
                    setEditingPost({ ...editingPost, content: formatted });
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  一键排版
                </button>
                
                <button
                  onClick={() => setShowFormatPanel(!showFormatPanel)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  格式检查
                  {formatIssues.length > 0 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      {formatIssues.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? "隐藏预览" : "显示预览"}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-600">
                {(() => {
                  const stats = getFormatStats(editingPost.content);
                  return (
                    <>
                      <span>{stats.chineseCharacters} 字</span>
                      <span className="text-zinc-400">•</span>
                      <span>{stats.paragraphs} 段落</span>
                      <span className="text-zinc-400">•</span>
                      <span>{stats.headings} 标题</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Format Issues Panel */}
            {showFormatPanel && (
              <div className="mb-3 p-4 bg-white border border-zinc-200 rounded-lg">
                <h4 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  格式审查报告
                </h4>
                
                {formatIssues.length === 0 ? (
                  <p className="text-sm text-green-600">✅ 格式检查通过，未发现问题！</p>
                ) : (
                  <div className="space-y-2">
                    {formatIssues.map((issue, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2 rounded text-sm ${
                          issue.type === 'error'
                            ? 'bg-red-50 text-red-700'
                            : issue.type === 'warning'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-zinc-200">
                  <p className="text-xs text-zinc-500">
                    💡 提示：点击"一键排版"可自动优化文章格式，包括：中英文空格、标点统一、段落优化等
                  </p>
                </div>
              </div>
            )}

            {/* Editor and Preview Side by Side */}
            <div className="grid gap-3" style={{ gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr' }}>
              {/* Editor */}
              <div>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  rows={16}
                  placeholder="在此输入文章正文，支持 Markdown 格式..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border border-zinc-300 rounded-lg p-4 bg-white overflow-auto" style={{ maxHeight: '500px' }}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{editingPost.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">分类</label>
              <select
                value={editingPost.category}
                onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>人工智能</option>
                <option>设计</option>
                <option>前端开发</option>
                <option>生产力</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">发布日期</label>
              <input
                type="date"
                value={editingPost.date}
                onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">标签（逗号分隔）</label>
            <input
              type="text"
              value={Array.isArray(editingPost.tags) ? editingPost.tags.join(", ") : ""}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                })
              }
              placeholder="AI, GPT-4, 多模态"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">封面图片</label>
            
            {/* Image Preview */}
            {editingPost.image && (
              <div className="mb-3 relative group">
                <img 
                  src={editingPost.image} 
                  alt="封面预览" 
                  className="w-full h-48 object-cover rounded-lg border border-zinc-200"
                />
                <button
                  onClick={() => setEditingPost({ ...editingPost, image: "" })}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? "上传中..." : "上传图片"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={editingPost.image}
                  onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                  placeholder="或输入图片 URL"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">支持 JPG、PNG、GIF 等格式，最大 10MB</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={() => {
                setEditingPost(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">文章列表 ({posts.length})</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建文章
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{post.title}</h3>
                <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{post.category}</span>
                  <span>{post.date}</span>
                  <span>{post.views || 0} 浏览</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setEditingPost(post)}
                  className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p>还没有文章，点击"新建文章"开始创作吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder managers for other tabs
function PhotosManager() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  
  // AI States
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [artAnalysis, setArtAnalysis] = useState<ArtAnalysis | null>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadPhotos();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await kv.get('photo_categories');
    if (data) {
      setCategories(['全部', ...data]);
    } else {
      // Default categories
      const defaultCategories = [
        "全部", 
        "绘画", 
        "雕塑", 
        "摄影", 
        "装置艺术",
        "古代艺术",
        "现代艺术",
        "当代艺术",
        "文物",
        "建筑",
        "风光",
        "人像", 
        "抽象",
        "城市",
        "生活",
        "美食",
        "其他"
      ];
      setCategories(defaultCategories);
      await saveCategories(defaultCategories.filter(c => c !== '全部'));
    }
  };

  const saveCategories = async (cats: string[]) => {
    // Save to KV store
    const { error } = await kv.set('photo_categories', cats);
    if (error) {
      console.error('Failed to save categories:', error);
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      alert('请输入标签名称');
      return;
    }
    
    if (categories.includes(trimmed)) {
      alert('该标签已存在');
      return;
    }

    const newCategories = [...categories.filter(c => c !== '全部'), trimmed];
    setCategories(['全部', ...newCategories]);
    await saveCategories(newCategories);
    setNewCategory('');
    alert('✅ 标签添加成功！');
  };

  const handleEditCategory = async () => {
    const trimmed = editCategoryValue.trim();
    if (!trimmed) {
      alert('请输入标签名称');
      return;
    }

    if (trimmed !== editingCategory && categories.includes(trimmed)) {
      alert('该标签已存在');
      return;
    }

    // Update category in all photos
    const updatedPhotos = photos.map(photo => 
      photo.category === editingCategory ? { ...photo, category: trimmed } : photo
    );
    
    // Update photos in database
    for (const photo of updatedPhotos) {
      if (photo.category === trimmed && photo.category !== editingCategory) {
        await photosApi.update(photo.id, photo);
      }
    }

    // Update categories list
    const newCategories = categories
      .filter(c => c !== '全部' && c !== editingCategory)
      .concat(trimmed);
    
    setCategories(['全部', ...newCategories]);
    await saveCategories(newCategories);
    setPhotos(updatedPhotos);
    setEditingCategory(null);
    setEditCategoryValue('');
    alert('✅ 标签已更新！');
  };

  const handleDeleteCategory = async (category: string) => {
    if (category === '全部' || category === '其他') {
      alert('该标签不能删除');
      return;
    }

    const photosWithCategory = photos.filter(p => p.category === category);
    if (photosWithCategory.length > 0) {
      if (!confirm(`有 ${photosWithCategory.length} 张照片使用此标签，删除后这些照片的分类将改为"其他"，确定要删除吗？`)) {
        return;
      }

      // Update photos to "其他"
      for (const photo of photosWithCategory) {
        await photosApi.update(photo.id, { ...photo, category: '其他' });
      }
      
      // Reload photos
      await loadPhotos();
    }

    const newCategories = categories.filter(c => c !== '全部' && c !== category);
    setCategories(['全部', ...newCategories]);
    await saveCategories(newCategories);
    
    if (selectedCategory === category) {
      setSelectedCategory('全部');
    }
    
    alert('✅ 标签已删除！');
  };

  const loadPhotos = async () => {
    setLoading(true);
    const { data } = await photosApi.getAll();
    setPhotos(data || []);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingPhoto({
      url: "",
      title: "",
      description: "",
      location: "",
      date: new Date().toISOString().split('T')[0],
      category: "风光",
      likes: 0,
      views: 0,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingPhoto.url || !editingPhoto.title) {
      alert("请上传照片并填写标题");
      return;
    }

    if (isCreating) {
      const { error } = await photosApi.create(editingPhoto);
      if (!error) {
        await loadPhotos();
        setIsCreating(false);
        setEditingPhoto(null);
      } else {
        alert("保存失败：" + error);
      }
    } else {
      const { error } = await photosApi.update(editingPhoto.id, editingPhoto);
      if (!error) {
        await loadPhotos();
        setEditingPhoto(null);
      } else {
        alert("更新失败：" + error);
      }
    }
  };

  // AI Assistant Functions
  const handleAiSmartFill = async () => {
    if (!editingPhoto.url) {
      alert('请先上传照片');
      return;
    }

    setAiAnalyzing(true);
    try {
      const smartDesc = await generateSmartDescription(editingPhoto.url);
      setEditingPhoto({
        ...editingPhoto,
        title: smartDesc.title,
        description: smartDesc.description,
        category: smartDesc.category,
        location: smartDesc.location || editingPhoto.location,
      });
      alert('✨ AI 已智能填充！');
    } catch (error) {
      alert('AI 分析失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!editingPhoto.url) {
      alert('请先上传照片');
      return;
    }

    setAiAnalyzing(true);
    setShowAiPanel(true);
    try {
      const analysis = await analyzeArtStyle(editingPhoto.url);
      setArtAnalysis(analysis);
    } catch (error) {
      alert('艺术分析失败: ' + (error instanceof Error ? error.message : String(error)));
      setShowAiPanel(false);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAiTitles = async () => {
    if (!editingPhoto.url) {
      alert('请先上传照片');
      return;
    }

    setAiAnalyzing(true);
    try {
      const titles = await suggestArtisticTitles(editingPhoto.url, 5);
      setTitleSuggestions(titles);
      setShowAiPanel(true);
    } catch (error) {
      alert('标题生成失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAiIdentify = async () => {
    if (!editingPhoto.url) {
      alert('请先上传照片');
      return;
    }

    setAiAnalyzing(true);
    try {
      const artwork = await identifyArtwork(editingPhoto.url);
      if (artwork.isArtwork) {
        const info = [];
        if (artwork.artist) info.push(`艺术家: ${artwork.artist}`);
        if (artwork.title) info.push(`作品: ${artwork.title}`);
        if (artwork.period) info.push(`时期: ${artwork.period}`);
        if (artwork.style) info.push(`风格: ${artwork.style}`);
        if (artwork.museum) info.push(`收藏: ${artwork.museum}`);
        
        alert('🖼️ 艺术品识别结果:\n\n' + info.join('\n') + '\n\n' + artwork.description);
        
        // Update description with artwork info
        setEditingPhoto({
          ...editingPhoto,
          description: artwork.description
        });
      } else {
        alert('未识别到艺术品信息');
      }
    } catch (error) {
      alert('艺术品识别失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // 获取原始图片信息
      const info = await getImageInfo(file);
      console.log(`原始图片: ${info.width}x${info.height}, ${info.sizeMB.toFixed(2)}MB`);
      setUploadProgress(20);

      // 压缩图片
      let fileToUpload = file;
      if (info.sizeMB > 0.5) {
        console.log('压缩图片中...');
        fileToUpload = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeMB: 2,
        });
        const compressedInfo = await getImageInfo(fileToUpload);
        console.log(`压缩后: ${compressedInfo.width}x${compressedInfo.height}, ${compressedInfo.sizeMB.toFixed(2)}MB`);
      }
      setUploadProgress(40);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      // 上传
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const { data, error } = await uploadImage(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data && !error) {
        setEditingPhoto({ ...editingPhoto, url: data.url });
        setTimeout(() => {
          setUploadProgress(0);
        }, 500);
      } else {
        alert('上传失败：' + error);
        setUploadProgress(0);
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      alert('上传失败：' + (err instanceof Error ? err.message : String(err)));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这张照片吗？")) {
      const { error } = await photosApi.delete(id);
      if (!error) {
        await loadPhotos();
      } else {
        alert("删除失败：" + error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  const filteredPhotos = selectedCategory === "全部" 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  if (editingPhoto) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{isCreating ? "上传新照片" : "编辑照片"}</h2>
          <button
            onClick={() => {
              setEditingPhoto(null);
              setIsCreating(false);
            }}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">照片预览</label>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border-2 border-dashed border-zinc-300 hover:border-blue-400 transition-colors">
              {editingPhoto.url ? (
                <>
                  <img
                    src={editingPhoto.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      更换照片
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <ImageIcon className="w-12 h-12 text-zinc-400 mb-3" />
                  <span className="text-sm text-zinc-600">点击上传照片</span>
                  <span className="text-xs text-zinc-400 mt-1">支持 JPG、PNG 格式，最大 10MB</span>
                </label>
              )}
              
              {uploading && uploadProgress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-200">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {editingPhoto.url && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">照片已上传</p>
                    <p className="text-xs text-green-700 mt-1 break-all">{editingPhoto.url}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Photo Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingPhoto.title}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                placeholder="为照片起个标题"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">描述</label>
              <textarea
                value={editingPhoto.description}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                rows={3}
                placeholder="描述这张照片的故事..."
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* AI Assistant Toolbar */}
            {editingPhoto.url && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI 艺术助手
                  </h4>
                  {aiAnalyzing && (
                    <span className="text-xs text-purple-600 animate-pulse">分析中...</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAiSmartFill}
                    disabled={aiAnalyzing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm text-sm disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    智能填充
                  </button>
                  <button
                    onClick={handleAiAnalyze}
                    disabled={aiAnalyzing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm disabled:opacity-50"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    艺术分析
                  </button>
                  <button
                    onClick={handleAiTitles}
                    disabled={aiAnalyzing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm disabled:opacity-50"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    创意标题
                  </button>
                  <button
                    onClick={handleAiIdentify}
                    disabled={aiAnalyzing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm disabled:opacity-50"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    识别藏品
                  </button>
                </div>
              </div>
            )}

            {/* AI Analysis Results Panel */}
            {artAnalysis && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    艺术风格分析
                  </h4>
                  <button
                    onClick={() => setArtAnalysis(null)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-purple-900">风格：</span>
                    <span className="text-purple-700 ml-1">{artAnalysis.style}</span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-900">色彩：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {artAnalysis.colors.map((color, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-purple-900">构图：</span>
                    <span className="text-purple-700 ml-1">{artAnalysis.composition}</span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-900">情绪：</span>
                    <span className="text-purple-700 ml-1">{artAnalysis.mood}</span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-900">描述：</span>
                    <p className="text-purple-700 mt-1">{artAnalysis.description}</p>
                  </div>
                  {artAnalysis.era && (
                    <div>
                      <span className="font-medium text-purple-900">时期：</span>
                      <span className="text-purple-700 ml-1">{artAnalysis.era}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-purple-900">标签：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {artAnalysis.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Title Suggestions Panel */}
            {titleSuggestions.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-pink-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    创意标题建议
                  </h4>
                  <button
                    onClick={() => setTitleSuggestions([])}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {titleSuggestions.map((title, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setEditingPhoto({ ...editingPhoto, title });
                        setTitleSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 bg-white border border-pink-200 text-pink-900 rounded-lg hover:bg-pink-50 transition-colors text-sm"
                    >
                      {index + 1}. {title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">分类</label>
                <select
                  value={editingPhoto.category}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c !== "全部").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">拍摄日期</label>
                <input
                  type="date"
                  value={editingPhoto.date}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">拍摄地点</label>
              <input
                type="text"
                value={editingPhoto.location || ""}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, location: e.target.value })}
                placeholder="如：北京·故宫"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={uploading || !editingPhoto.url || !editingPhoto.title}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  保存照片
                </button>
                <button
                  onClick={() => {
                    setEditingPhoto(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">照片图册 ({photos.length})</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {category}
                {category !== "全部" && (
                  <span className="ml-1 text-xs opacity-75">
                    ({photos.filter(p => p.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          上传照片
        </button>
      </div>

      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition-all hover:shadow-lg"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
                {photo.category}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-semibold mb-1 line-clamp-1">{photo.title}</h3>
                  <p className="text-xs text-zinc-300 line-clamp-2 mb-3">{photo.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {photo.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {photo.views}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhoto(photo);
                        }}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                        className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500 mb-6">
            {selectedCategory === "全部" 
              ? "还没有照片，点击\"上传照片\"开始记录美好瞬间！" 
              : `暂无「${selectedCategory}」分类的照片`}
          </p>
          {selectedCategory !== "全部" && (
            <button
              onClick={() => setSelectedCategory("全部")}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              查看全部照片
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AgentsManager() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    const { data, error } = await agentsApi.getAll();
    if (data && !error) {
      setAgents(data);
    }
    setLoading(false);
  };

  const agentTypes = [
    { value: "blocks", label: "🔷 Blocks Agent", color: "blue" },
    { value: "manus", label: "🤚 Manus Agent", color: "purple" },
    { value: "github", label: "🐙 GitHub Agent", color: "gray" },
    { value: "custom", label: "⚡ Custom Agent", color: "green" },
    { value: "other", label: "🌐 第三方 Agent", color: "orange" },
  ];

  const categories = ["内容创作", "开发工具", "设计工具", "数据分析", "语言工具", "营销工具", "生产力", "职业发展", "其他"];

  const quickTemplates = [
    {
      name: "Blocks Agent 模板",
      type: "blocks",
      category: "开发工具",
      description: "一个 Blocks 平台的 Agent",
      icon: "🔷",
    },
    {
      name: "Manus Agent 模板",
      type: "manus",
      category: "生产力",
      description: "一个 Manus 平台的智能助手",
      icon: "🤚",
    },
    {
      name: "GitHub Action 模板",
      type: "github",
      category: "开发工具",
      description: "一个 GitHub 上的自动化工具",
      icon: "🐙",
    },
  ];

  const handleCreate = () => {
    setEditingAgent({
      name: "",
      description: "",
      category: "开发工具",
      type: "custom",
      icon: "🤖",
      url: "",
      embedUrl: "",
      embedCode: "",
      displayMode: "link", // link | embed
      tags: [],
      status: "active",
      featured: false,
    });
    setIsCreating(true);
  };

  const handleQuickCreate = (template: any) => {
    setEditingAgent({
      ...template,
      name: "",
      description: template.description,
      url: "",
      embedUrl: "",
      embedCode: "",
      displayMode: template.type === "blocks" || template.type === "manus" ? "embed" : "link",
      tags: [],
      status: "active",
      featured: false,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (isCreating) {
      const { error } = await agentsApi.create(editingAgent);
      if (!error) {
        await loadAgents();
        setIsCreating(false);
        setEditingAgent(null);
      } else {
        alert("保存失败：" + error);
      }
    } else {
      const { error } = await agentsApi.update(editingAgent.id, editingAgent);
      if (!error) {
        await loadAgents();
        setEditingAgent(null);
      } else {
        alert("更新失败：" + error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个 Agent 吗？")) {
      const { error } = await agentsApi.delete(id);
      if (!error) {
        await loadAgents();
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setUploading(true);

    try {
      // 获取原始图片信息
      const info = await getImageInfo(file);
      console.log(`原始图片: ${info.width}x${info.height}, ${info.sizeMB.toFixed(2)}MB`);

      // 压缩图片
      let fileToUpload = file;
      if (info.sizeMB > 0.5) {
        console.log('压缩图片中...');
        fileToUpload = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          maxSizeMB: 2,
        });
        const compressedInfo = await getImageInfo(fileToUpload);
        console.log(`压缩后: ${compressedInfo.width}x${compressedInfo.height}, ${compressedInfo.sizeMB.toFixed(2)}MB`);
      }

      // 上传
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const { data, error } = await uploadImage(formData);
      if (data && !error) {
        setEditingAgent({ ...editingAgent, image: data.url });
      } else {
        alert("上传失败：" + error);
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      alert("图片处理失败：" + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">加载中...</div>;
  }

  if (editingAgent) {
    const selectedType = agentTypes.find(t => t.value === editingAgent.type);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isCreating ? "添加新 Agent" : "编辑 Agent"}
          </h2>
          <button
            onClick={() => {
              setEditingAgent(null);
              setIsCreating(false);
            }}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Agent 类型 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Agent 类型</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {agentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEditingAgent({ ...editingAgent, type: type.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    editingAgent.type === type.value
                      ? `bg-${type.color}-600 text-white`
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">名称</label>
            <input
              type="text"
              value={editingAgent.name}
              onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="给你的 Agent 起个名字"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">描述</label>
            <textarea
              value={editingAgent.description}
              onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="描述这个 Agent 的功能..."
            />
          </div>

          {/* 显示模式 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">显示模式</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayMode"
                  value="link"
                  checked={editingAgent.displayMode === "link"}
                  onChange={(e) => setEditingAgent({ ...editingAgent, displayMode: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-zinc-700">🔗 外部链接（跳转）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayMode"
                  value="embed"
                  checked={editingAgent.displayMode === "embed"}
                  onChange={(e) => setEditingAgent({ ...editingAgent, displayMode: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-zinc-700">📦 嵌入模式（页面内使用）</span>
              </label>
            </div>
          </div>

          {/* URL - 显示模式为 link 时 */}
          {editingAgent.displayMode === "link" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                链接地址 {editingAgent.type === "github" && "(GitHub 仓库地址)"}
              </label>
              <input
                type="url"
                value={editingAgent.url || ""}
                onChange={(e) => setEditingAgent({ ...editingAgent, url: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  editingAgent.type === "github"
                    ? "https://github.com/username/repo"
                    : "https://..."
                }
              />
            </div>
          )}

          {/* 嵌入选项 - 显示模式为 embed 时 */}
          {editingAgent.displayMode === "embed" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  嵌入地址 (iframe src)
                </label>
                <input
                  type="url"
                  value={editingAgent.embedUrl || ""}
                  onChange={(e) => setEditingAgent({ ...editingAgent, embedUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/embed?param=value"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  例如：https://69d47f4b301acfb1269e4ec0.blocks-app.diy?embedded=true
                </p>
              </div>

              <div className="text-sm text-zinc-600">
                <p className="font-medium mb-1">或者</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  完整 iframe 代码（粘贴整个 iframe 标签）
                </label>
                <textarea
                  value={editingAgent.embedCode || ""}
                  onChange={(e) => {
                    const code = e.target.value;
                    setEditingAgent({ ...editingAgent, embedCode: code });

                    // 自动提取 src
                    const srcMatch = code.match(/src=["']([^"']+)["']/);
                    if (srcMatch) {
                      setEditingAgent({
                        ...editingAgent,
                        embedCode: code,
                        embedUrl: srcMatch[1]
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                  rows={4}
                  placeholder='<iframe src="https://..." width="100%" height="600"></iframe>'
                />
                <p className="text-xs text-zinc-500 mt-1">
                  💡 粘贴完整的 iframe 代码，系统会自动提取链接
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">分类</label>
              <select
                value={editingAgent.category}
                onChange={(e) => setEditingAgent({ ...editingAgent, category: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 图标 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">图标 Emoji</label>
              <input
                type="text"
                value={editingAgent.icon}
                onChange={(e) => setEditingAgent({ ...editingAgent, icon: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🤖"
                maxLength={2}
              />
            </div>
          </div>

          {/* 图片 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">封面图片</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingAgent.image || ""}
                onChange={(e) => setEditingAgent({ ...editingAgent, image: e.target.value })}
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="图片 URL 或上传本地图片"
              />
              <label className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? "上传中..." : "上传"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {editingAgent.image && (
              <img src={editingAgent.image} alt="预览" className="mt-2 w-32 h-32 object-cover rounded-lg" />
            )}
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">标签 (用逗号分隔)</label>
            <input
              type="text"
              value={(editingAgent.tags || []).join(", ")}
              onChange={(e) => setEditingAgent({
                ...editingAgent,
                tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="AI, 自动化, 工具"
            />
          </div>

          {/* 精选 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editingAgent.featured || false}
              onChange={(e) => setEditingAgent({ ...editingAgent, featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm text-zinc-700">设为精选 Agent（在首页展示）</label>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={() => {
                setEditingAgent(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Agents 管理</h2>
          <p className="text-sm text-zinc-600 mt-1">管理你的所有 AI Agents</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加 Agent
        </button>
      </div>

      {/* 快速模板 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-medium text-zinc-900 mb-3">⚡ 快速创建</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {quickTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickCreate(template)}
              className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left border border-zinc-200"
            >
              <span className="mr-2">{template.icon}</span>
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Agents 列表 */}
      {agents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <Zap className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">还没有添加任何 Agent</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加第一个 Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const agentType = agentTypes.find(t => t.value === agent.type);
            return (
              <div
                key={agent.id}
                className="bg-white rounded-lg border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {agent.image ? (
                  <div className="aspect-video bg-zinc-100">
                    <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">{agent.icon || "🤖"}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded bg-${agentType?.color}-100 text-${agentType?.color}-700`}>
                          {agentType?.label || agent.type}
                        </span>
                        {agent.displayMode === "embed" && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                            📦 嵌入
                          </span>
                        )}
                        {agent.featured && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-zinc-900">{agent.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{agent.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded">
                      {agent.category}
                    </span>
                    {agent.usageCount > 0 && (
                      <span className="text-xs text-zinc-500">
                        {agent.usageCount} 次使用
                      </span>
                    )}
                  </div>
                  {(agent.url || agent.embedUrl) && (
                    <a
                      href={agent.displayMode === "embed" ? agent.embedUrl : agent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mb-3 block truncate"
                      title={agent.displayMode === "embed" ? agent.embedUrl : agent.url}
                    >
                      {agent.displayMode === "embed" ? agent.embedUrl : agent.url}
                    </a>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => setEditingAgent({
                        ...agent,
                        displayMode: agent.displayMode || "link",
                        embedUrl: agent.embedUrl || "",
                        embedCode: agent.embedCode || "",
                      })}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResourcesManager() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showObsidianSync, setShowObsidianSync] = useState(false);
  const [syncingObsidian, setSyncingObsidian] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, file: '' });

  // Obsidian 配置
  const [obsidianConfig, setObsidianConfig] = useState({
    repoUrl: '', // 例如: username/repo 或 username/repo/main/Public
    token: '', // 可选
  });

  useEffect(() => {
    loadResources();
    loadObsidianConfig();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const { data } = await resourcesApi.getAll();
    setResources(data || []);
    setLoading(false);
  };

  const loadObsidianConfig = async () => {
    const { data } = await kv.get('obsidian_config');
    if (data) {
      setObsidianConfig(data);
    }
  };

  const saveObsidianConfig = async () => {
    await kv.set('obsidian_config', obsidianConfig);
  };

  const resourceTypes = [
    { value: "document", label: "📄 文档", color: "blue" },
    { value: "video", label: "🎥 视频", color: "purple" },
    { value: "link", label: "🔗 链接", color: "green" },
    { value: "download", label: "📦 下载", color: "orange" },
    { value: "obsidian", label: "📝 Obsidian 笔记", color: "pink" },
  ];

  const categories = ["技术文档", "视频教程", "工具链接", "资源下载", "知识笔记", "其他"];

  const handleCreate = () => {
    setEditingResource({
      title: "",
      description: "",
      type: "document",
      category: "技术文档",
      url: "",
      icon: "📄",
      size: "",
      content: "", // 用于 Obsidian 笔记或手动粘贴
      tags: [],
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingResource.title) {
      alert("请填写标题");
      return;
    }

    if (isCreating) {
      const { error } = await resourcesApi.create(editingResource);
      if (!error) {
        await loadResources();
        setIsCreating(false);
        setEditingResource(null);
      } else {
        alert("保存失败：" + error);
      }
    } else {
      const { error } = await resourcesApi.update(editingResource.id, editingResource);
      if (!error) {
        await loadResources();
        setEditingResource(null);
      } else {
        alert("更新失败：" + error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个资源吗？")) {
      const { error } = await resourcesApi.delete(id);
      if (!error) {
        await loadResources();
      }
    }
  };

  const handleSyncObsidian = async () => {
    if (!obsidianConfig.repoUrl) {
      alert('请先配置 GitHub 仓库地址');
      return;
    }

    setSyncingObsidian(true);
    setSyncProgress({ current: 0, total: 0, file: '' });

    try {
      // 动态导入同步工具
      const { syncObsidianNotes, parseGitHubConfigString } = await import('../../utils/obsidianSync');

      // 解析配置
      const gitHubConfig = {
        ...parseGitHubConfigString(obsidianConfig.repoUrl),
        token: obsidianConfig.token || undefined,
      };

      // 同步笔记
      const notes = await syncObsidianNotes(gitHubConfig, (current, total, file) => {
        setSyncProgress({ current, total, file });
      });

      // 保存到资料库
      let imported = 0;
      for (const note of notes) {
        // 检查是否已存在（通过 obsidian_path）
        const existing = resources.find(r => r.obsidian_path === note.obsidian_path);

        const resource = {
          title: note.title,
          description: note.excerpt,
          type: "obsidian",
          category: note.metadata.category || "知识笔记",
          url: note.github_url,
          content: note.content,
          icon: "📝",
          tags: note.tags,
          obsidian_path: note.obsidian_path,
          obsidian_links: note.links,
          last_synced: note.last_synced,
          metadata: note.metadata,
        };

        if (existing) {
          await resourcesApi.update(existing.id, resource);
        } else {
          await resourcesApi.create(resource);
          imported++;
        }
      }

      await loadResources();
      alert(`✅ 同步完成！导入 ${imported} 篇新笔记，更新 ${notes.length - imported} 篇已有笔记`);
    } catch (error) {
      console.error('Obsidian 同步失败:', error);
      alert('同步失败：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSyncingObsidian(false);
      setSyncProgress({ current: 0, total: 0, file: '' });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">加载中...</div>;
  }

  if (editingResource) {
    const selectedType = resourceTypes.find(t => t.value === editingResource.type);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isCreating ? "添加资源" : "编辑资源"}
          </h2>
          <button
            onClick={() => {
              setEditingResource(null);
              setIsCreating(false);
            }}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 资源类型 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">资源类型</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {resourceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEditingResource({ ...editingResource, type: type.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    editingResource.type === type.value
                      ? `bg-${type.color}-600 text-white`
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">标题</label>
            <input
              type="text"
              value={editingResource.title}
              onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="资源标题"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">描述</label>
            <textarea
              value={editingResource.description}
              onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="简短描述这个资源..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">分类</label>
              <select
                value={editingResource.category}
                onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 图标 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">图标 Emoji</label>
              <input
                type="text"
                value={editingResource.icon}
                onChange={(e) => setEditingResource({ ...editingResource, icon: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="📄"
                maxLength={2}
              />
            </div>
          </div>

          {/* URL（非 Obsidian 笔记类型） */}
          {editingResource.type !== "obsidian" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">链接地址</label>
              <input
                type="url"
                value={editingResource.url || ""}
                onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          )}

          {/* Obsidian 笔记内容或手动粘贴 */}
          {editingResource.type === "obsidian" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Markdown 内容（从 Obsidian 复制粘贴）
              </label>
              <textarea
                value={editingResource.content || ""}
                onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows={10}
                placeholder="粘贴你的 Obsidian 笔记内容..."
              />
            </div>
          )}

          {/* 文件大小（可选） */}
          {(editingResource.type === "document" || editingResource.type === "download" || editingResource.type === "video") && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                文件大小（可选，仅用于显示）
              </label>
              <input
                type="text"
                value={editingResource.size || ""}
                onChange={(e) => setEditingResource({ ...editingResource, size: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: 2.5 MB"
              />
            </div>
          )}

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">标签（用逗号分隔）</label>
            <input
              type="text"
              value={(editingResource.tags || []).join(", ")}
              onChange={(e) => setEditingResource({
                ...editingResource,
                tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="AI, 教程, 工具"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={() => {
                setEditingResource(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">资料库管理</h2>
          <p className="text-sm text-zinc-600 mt-1">管理文档、视频、链接和 Obsidian 笔记</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowObsidianSync(!showObsidianSync)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Obsidian 同步
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加资源
          </button>
        </div>
      </div>

      {/* Obsidian 同步配置 */}
      {showObsidianSync && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">📝 Obsidian GitHub 同步</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                GitHub 仓库地址
              </label>
              <input
                type="text"
                value={obsidianConfig.repoUrl}
                onChange={(e) => setObsidianConfig({ ...obsidianConfig, repoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="username/repo 或 username/repo/main/Public"
              />
              <p className="text-xs text-zinc-500 mt-1">
                格式：用户名/仓库名/分支/文件夹（分支和文件夹可选）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Personal Access Token（私有仓库需要）
              </label>
              <input
                type="password"
                value={obsidianConfig.token}
                onChange={(e) => setObsidianConfig({ ...obsidianConfig, token: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ghp_..."
              />
              <p className="text-xs text-zinc-500 mt-1">
                公开仓库不需要。创建 Token: Settings → Developer settings → Personal access tokens
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-zinc-700">
              <p className="font-semibold mb-2">💡 使用提示：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>在 Obsidian 笔记的 YAML front matter 中添加 <code className="bg-white px-1 py-0.5 rounded">publish: true</code></li>
                <li>只有标记为 publish 的笔记会被同步</li>
                <li>可以指定文件夹（如 Public）来限制同步范围</li>
                <li>支持标签（#tag）和双向链接（[[link]]）</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!obsidianConfig.repoUrl) {
                    alert('请输入 GitHub 仓库地址');
                    return;
                  }

                  // 测试连接
                  try {
                    const { fetchGitHubFiles, parseGitHubConfigString } = await import('../../utils/obsidianSync');
                    const gitHubConfig = {
                      ...parseGitHubConfigString(obsidianConfig.repoUrl),
                      token: obsidianConfig.token || undefined,
                    };

                    console.log('测试配置:', gitHubConfig);
                    const files = await fetchGitHubFiles(gitHubConfig);
                    alert(`✅ 连接成功！找到 ${files.length} 个 Markdown 文件`);
                  } catch (error) {
                    alert('❌ 连接失败：' + (error instanceof Error ? error.message : String(error)) + '\n\n请检查：\n1. 仓库地址是否正确\n2. 如果是私有仓库，需要提供 Token\n3. 分支名是否正确（main/master）');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                测试连接
              </button>
              <button
                onClick={async () => {
                  await saveObsidianConfig();
                  alert('✅ 配置已保存');
                }}
                className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                保存配置
              </button>
              <button
                onClick={handleSyncObsidian}
                disabled={syncingObsidian}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {syncingObsidian ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    同步中... {syncProgress.current}/{syncProgress.total}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    立即同步
                  </>
                )}
              </button>
            </div>

            {syncingObsidian && syncProgress.file && (
              <div className="text-xs text-zinc-600">
                正在处理: {syncProgress.file}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 资源列表 */}
      {resources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">还没有添加任何资源</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加第一个资源
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => {
            const resourceType = resourceTypes.find(t => t.value === resource.type);
            return (
              <div
                key={resource.id}
                className="bg-white rounded-lg border border-zinc-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{resource.icon || "📄"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{resource.title}</h3>
                        <p className="text-sm text-zinc-600 mt-1">{resource.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded bg-${resourceType?.color}-100 text-${resourceType?.color}-700`}>
                        {resourceType?.label}
                      </span>
                      <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded">
                        {resource.category}
                      </span>
                      {resource.size && (
                        <span className="text-zinc-500">{resource.size}</span>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex gap-1">
                          {resource.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 block truncate"
                      >
                        {resource.url}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingResource(resource)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrendingManager() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);
  const [testingSource, setTestingSource] = useState(false);

  const chineseSources = ['36氪']; // 目前唯一稳定的中文源

  const loadTrending = async () => {
    setLoading(true);
    try {
      const { data, error } = await trendingApi.getAll();
      if (error) {
        console.error('加载热点失败:', error);
      } else {
        setTrending(data || []);
      }
    } catch (error) {
      console.error('加载热点失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAggregate = async () => {
    if (aggregating) return;

    setAggregating(true);
    try {
      const { projectId, publicAnonKey } = await import('/utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-41c81a90/aggregate-rss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.error) {
        alert('聚合失败: ' + result.error);
      } else {
        alert(`✅ ${result.data.message}\n聚合: ${result.data.total} 条\n去重: ${result.data.unique} 条\n新增: ${result.data.saved} 条`);
        await loadTrending();
      }
    } catch (error) {
      console.error('聚合失败:', error);
      alert('聚合失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setAggregating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条热点？')) return;

    try {
      const { error } = await trendingApi.delete(id);
      if (error) {
        alert('删除失败：' + error);
      } else {
        await loadTrending();
      }
    } catch (error) {
      alert('删除失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定清空所有热点内容？')) return;

    try {
      for (const item of trending) {
        await trendingApi.delete(item.id);
      }
      await loadTrending();
      alert('✅ 已清空所有热点');
    } catch (error) {
      alert('清空失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleTestSource = async (sourceName: string) => {
    setTestingSource(true);
    try {
      const { projectId, publicAnonKey } = await import('/utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-41c81a90/test-rss/${encodeURIComponent(sourceName)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();

      if (result.error) {
        alert(`❌ ${sourceName} 测试失败:\n\n${result.error}\n\n请检查:\n1. 信源 URL 是否正确\n2. 网络连接是否正常\n3. 第三方代理是否可用`);
      } else {
        const data = result.data;
        alert(`✅ ${sourceName} 测试成功!\n\n` +
          `状态: ${data.status}\n` +
          `内容长度: ${data.contentLength} 字符\n` +
          `格式正确: ${data.isValidXML ? '是' : '否'}\n\n` +
          `预览:\n${data.preview.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error('测试失败:', error);
      alert('测试失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setTestingSource(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">热点内容管理</h2>
          <p className="text-sm text-zinc-600">当前共 {trending.length} 条热点</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAggregate}
            disabled={aggregating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {aggregating ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                聚合中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                触发 RSS 聚合
              </>
            )}
          </button>
          {trending.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              清空全部
            </button>
          )}
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">📡 当前信源</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-semibold">第一梯队（必读）：2个</p>
            <ul className="ml-2">
              <li>• Simon Willison 🇬🇧</li>
              <li>• The Rundown AI 🇬🇧</li>
            </ul>
            <p className="font-semibold mt-2">第二梯队（按需）：3个</p>
            <ul className="ml-2 text-[10px]">
              <li>• Stratechery 🇬🇧</li>
              <li>• Latent Space 🇬🇧</li>
              <li>• 36氪 🇨🇳 (唯一中文源)</li>
            </ul>
            <p className="font-semibold mt-1">雷达扫描：5个</p>
            <p className="text-blue-900 font-bold mt-2">+ HackerNews API</p>
            <p className="text-[10px] text-blue-600 mt-2">共 12 个信源</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">⚠️ 中文源限制</h3>
          <p className="text-xs text-yellow-700 mb-2">
            以下源不可用：
          </p>
          <ul className="text-xs text-yellow-700 space-y-1 mb-2">
            <li>• ❌ 甲子光年（RSSHub 403）</li>
            <li>• ❌ 海外独角兽（RSSHub 403）</li>
            <li>• ❌ 机器之心（RSSHub 403）</li>
            <li>• ❌ TechCrunch CN（超时）</li>
          </ul>
          <p className="text-xs text-yellow-700 mb-2">
            ✅ 当前可用中文源：
          </p>
          <div className="space-y-1">
            <button
              onClick={() => handleTestSource('36氪')}
              disabled={testingSource}
              className="w-full text-left px-2 py-1 text-xs bg-white border border-yellow-300 rounded hover:bg-yellow-100 transition-colors disabled:opacity-50"
            >
              测试 36氪
            </button>
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            💡 如需更多中文源，请部署自己的 RSSHub
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">⚙️ 聚合规则</h3>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• 24小时内发布</li>
            <li>• 关键词智能过滤</li>
            <li>• 3级优先级排序</li>
            <li>• 自动去重（URL）</li>
            <li>• 保留前30条</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">🔄 定时任务</h3>
          <p className="text-xs text-green-700">
            <span className="font-semibold">当前：</span>手动触发模式<br/>
            <span className="font-semibold">可升级：</span><br/>
            • Supabase Cron (每日自动)<br/>
            • GitHub Actions (免费)<br/>
            详见 CRON_SETUP.md
          </p>
        </div>
      </div>

      {/* 热点列表 */}
      {trending.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
          <Star className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-600 mb-4">暂无热点内容</p>
          <button
            onClick={handleAggregate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            立即聚合
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trending.map((item) => (
            <div key={item.id} className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {item.priority === 1 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                        优先级 1
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-zinc-500">{item.source}</span>
                    {item.score && (
                      <span className="text-xs text-zinc-400">分数: {item.score.toFixed(1)}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-zinc-600 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{new Date(item.date).toLocaleString('zh-CN')}</span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        查看原文 →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ============================================
// Issue Manager — 专题导读问题卡片管理
// ============================================

type LinkKind = "文章" | "资料" | "Agent" | "热点";

interface IssueLink {
  label: string;
  kind: LinkKind;
  to: string;
  draft?: boolean;
}

interface IssueQuestion {
  id: string;
  question: string;
  description: string;
  links: IssueLink[];
}

const DEFAULT_QUESTIONS: IssueQuestion[] = [
  {
    id: "q1",
    question: "AI 如何重塑组织结构？",
    description: "从层级化走向网络化，决策权与执行权的边界正在被重新划定。",
    links: [{ label: "AI 与组织未来", kind: "文章", to: "", draft: true }],
  },
  {
    id: "q2",
    question: "人才的能力坐标如何迁移？",
    description: "工具使用、判断力、与机器协作的节奏感正在成为新的核心素养。",
    links: [{ label: "人才迁移报告", kind: "文章", to: "", draft: true }],
  },
  {
    id: "q3",
    question: "教育与培训如何回应？",
    description: "知识传递的成本趋零，学习的真正价值回到提问与判断本身。",
    links: [{ label: "教育变革", kind: "文章", to: "", draft: true }],
  },
  {
    id: "q4",
    question: "什么样的组织率先获益？",
    description: "拥有清晰任务结构与高质量数据资产的团队，迁移成本最低。",
    links: [{ label: "组织竞争力", kind: "文章", to: "", draft: true }],
  },
  {
    id: "q5",
    question: "未来五年的关键变量是什么？",
    description: "模型成本、监管节奏、与组织内部的信任系统将共同决定速度。",
    links: [{ label: "五年预测", kind: "文章", to: "", draft: true }],
  },
];

function IssueManager() {
  const [questions, setQuestions] = useState<IssueQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQ, setEditingQ] = useState<IssueQuestion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [intro, setIntro] = useState("");
  const [savingIntro, setSavingIntro] = useState(false);

  // Catalog data loaded from API
  const [allPosts, setAllPosts] = useState<{ id: string; title: string }[]>([]);
  const [allResources, setAllResources] = useState<{ id: string; title: string; url?: string }[]>([]);
  const [allTrending, setAllTrending] = useState<{ id: string; title: string; url?: string }[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Which tab is active in the link picker
  const [linkPickerTab, setLinkPickerTab] = useState<"文章" | "资料" | "热点">("文章");

  useEffect(() => {
    loadData();
    loadCatalog();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [qRes, introRes] = await Promise.all([
      kv.get("issue_questions"),
      kv.get("issue_intro"),
    ]);
    setQuestions(qRes.data ?? DEFAULT_QUESTIONS);
    setIntro(introRes.data ?? "");
    setLoading(false);
  };

  const loadCatalog = async () => {
    setCatalogLoading(true);
    const [postsRes, resourcesRes, trendingRes] = await Promise.all([
      postsApi.getAll(),
      resourcesApi.getAll(),
      trendingApi.getAll(),
    ]);
    setAllPosts((postsRes.data ?? []).map((p: any) => ({ id: p.id, title: p.title })));
    setAllResources((resourcesRes.data ?? []).map((r: any) => ({ id: r.id, title: r.title, url: r.url })));
    setAllTrending((trendingRes.data ?? []).map((t: any) => ({ id: t.id, title: t.title, url: t.url })));
    setCatalogLoading(false);
  };

  const saveQuestions = async (updated: IssueQuestion[]) => {
    setSaving(true);
    await kv.set("issue_questions", updated);
    setQuestions(updated);
    setSaving(false);
  };

  const handleSaveIntro = async () => {
    setSavingIntro(true);
    await kv.set("issue_intro", intro);
    setSavingIntro(false);
    alert("专题导读文字已保存！");
  };

  const handleSaveQuestion = async () => {
    if (!editingQ) return;
    const updated = isCreating
      ? [...questions, editingQ]
      : questions.map((q) => (q.id === editingQ.id ? editingQ : q));
    await saveQuestions(updated);
    setEditingQ(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个问题吗？")) return;
    await saveQuestions(questions.filter((q) => q.id !== id));
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingQ({
      id: `q${Date.now()}`,
      question: "",
      description: "",
      links: [],
    });
    setLinkPickerTab("文章");
  };

  const handleEdit = (q: IssueQuestion) => {
    setIsCreating(false);
    setEditingQ({ ...q, links: q.links.map((l) => ({ ...l })) });
    setLinkPickerTab("文章");
  };

  // Toggle a catalog item on/off for the current question
  const toggleItem = (kind: LinkKind, id: string, title: string, to: string) => {
    if (!editingQ) return;
    const exists = editingQ.links.findIndex((l) => l.kind === kind && l.to === to);
    if (exists >= 0) {
      // Remove it
      setEditingQ({ ...editingQ, links: editingQ.links.filter((_, i) => i !== exists) });
    } else {
      // Add it — default draft: false (user explicitly chose it, so it's live)
      setEditingQ({
        ...editingQ,
        links: [...editingQ.links, { label: title, kind, to, draft: false }],
      });
    }
  };

  const isItemChecked = (kind: LinkKind, to: string) =>
    !!editingQ?.links.find((l) => l.kind === kind && l.to === to);

  // Toggle draft state of an already-selected link
  const toggleDraft = (li: number) => {
    if (!editingQ) return;
    const links = editingQ.links.map((l, i) =>
      i === li ? { ...l, draft: !l.draft } : l
    );
    setEditingQ({ ...editingQ, links });
  };

  const removeLink = (li: number) => {
    if (!editingQ) return;
    setEditingQ({ ...editingQ, links: editingQ.links.filter((_, i) => i !== li) });
  };

  const catalogItems = {
    "文章": allPosts.map((p) => ({ id: p.id, title: p.title, to: `/blog/${p.id}` })),
    "资料": allResources.map((r) => ({ id: r.id, title: r.title, to: r.url ?? "" })),
    "热点": allTrending.map((t) => ({ id: t.id, title: t.title, to: t.url ?? "" })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">专题导读管理</h2>
          <p className="text-sm text-zinc-500 mt-0.5">管理首页「核心问题展区」的问题卡片和导读文字</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> 新建问题
        </button>
      </div>

      {/* Intro text editor */}
      <div className="border border-zinc-200 rounded-xl p-5 space-y-3">
        <label className="block text-sm font-medium text-zinc-700">
          专题导读文字（首页「专题导读」区域正文）
        </label>
        <p className="text-xs text-zinc-400">支持换行：按 Enter 分段，前端会原样保留段落间距</p>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={7}
          placeholder="这一期不试图给出确定的答案……"
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono leading-relaxed"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveIntro}
            disabled={savingIntro}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingIntro ? "保存中..." : "保存导读文字"}
          </button>
        </div>
      </div>

      {/* Question list */}
      {loading ? (
        <div className="text-center py-12 text-zinc-400 text-sm">加载中...</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => {
            const allDraft = q.links.filter((l) => l.kind === "文章").every((l) => l.draft !== false);
            return (
              <div key={q.id} className="border border-zinc-200 rounded-xl p-5 flex items-start gap-4">
                <div className="text-xs font-mono text-zinc-400 pt-0.5 w-10 shrink-0">Q.{String(i + 1).padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {allDraft && (
                      <span className="text-[10px] border border-[#C4463A]/40 text-[#C4463A] rounded px-1.5 py-0.5 font-medium">
                        作者还在写作中
                      </span>
                    )}
                    <span className="font-medium text-zinc-900 text-sm">{q.question}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">{q.description}</p>
                  {q.links.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {q.links.map((l, li) => (
                        <span
                          key={li}
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            l.draft
                              ? "border-zinc-200 text-zinc-400 bg-zinc-50"
                              : "border-emerald-200 text-emerald-700 bg-emerald-50"
                          }`}
                        >
                          {l.kind}：{l.label}
                          {l.draft ? " (草稿)" : " ✓"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                    title="编辑"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingQ && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900">
                {isCreating ? "新建问题" : "编辑问题"}
              </h3>
              <button
                onClick={() => { setEditingQ(null); setIsCreating(false); }}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">问题标题</label>
                <input
                  type="text"
                  value={editingQ.question}
                  onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
                  placeholder="AI 如何重塑组织结构？"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">简短描述</label>
                <textarea
                  value={editingQ.description}
                  onChange={(e) => setEditingQ({ ...editingQ, description: e.target.value })}
                  rows={3}
                  placeholder="一两句话说明这个问题的核心..."
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Link picker */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  关联内容
                  <span className="ml-2 text-xs font-normal text-zinc-400">勾选即关联，默认不选；取消勾选则移除</span>
                </label>

                {/* Tab bar */}
                <div className="flex border-b border-zinc-200 mb-3">
                  {(["文章", "资料", "热点"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setLinkPickerTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        linkPickerTab === tab
                          ? "border-zinc-900 text-zinc-900"
                          : "border-transparent text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      {tab}
                      <span className="ml-1.5 text-xs">
                        ({editingQ.links.filter((l) => l.kind === tab).length})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Item list */}
                {catalogLoading ? (
                  <div className="text-center py-6 text-zinc-400 text-sm">加载中...</div>
                ) : catalogItems[linkPickerTab].length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
                    暂无{linkPickerTab}内容
                  </div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto border border-zinc-100 rounded-lg">
                    {catalogItems[linkPickerTab].map((item) => {
                      const checked = isItemChecked(linkPickerTab, item.to);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors ${
                            checked ? "bg-emerald-50/60" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleItem(linkPickerTab, item.id, item.title, item.to)}
                            className="mt-0.5 rounded accent-zinc-900"
                          />
                          <span className={`text-sm leading-snug ${checked ? "text-zinc-900 font-medium" : "text-zinc-600"}`}>
                            {item.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected links summary */}
              {editingQ.links.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    已选内容
                    <span className="ml-2 text-xs font-normal text-zinc-400">可在此标记草稿状态或移除</span>
                  </label>
                  <div className="space-y-2">
                    {editingQ.links.map((link, li) => (
                      <div
                        key={li}
                        className="flex items-center gap-3 px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50"
                      >
                        <span className="text-[10px] font-medium text-zinc-400 w-6 shrink-0">{link.kind}</span>
                        <span className="flex-1 text-sm text-zinc-700 truncate">{link.label}</span>
                        <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={!!link.draft}
                            onChange={() => toggleDraft(li)}
                            className="rounded accent-zinc-900"
                          />
                          撰写中
                        </label>
                        <button
                          onClick={() => removeLink(li)}
                          className="p-1 text-zinc-300 hover:text-red-500 rounded transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-zinc-100">
              <button
                onClick={() => { setEditingQ(null); setIsCreating(false); }}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
