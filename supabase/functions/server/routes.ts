import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const routes = new Hono();

// ============================================
// Image Upload Routes
// ============================================

// Upload image to Supabase Storage
routes.post("/make-server-41c81a90/upload-image", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Create bucket if not exists
    const bucketName = "make-41c81a90-images";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Get the file from the request
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ data: null, error: "No file provided" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return c.json({ data: null, error: error.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return c.json({
      data: {
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type,
      },
      error: null
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// Blog Posts Routes
// ============================================

// Get all blog posts
routes.get("/make-server-41c81a90/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("post:");

    // Sort by date descending
    const sortedPosts = posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return c.json({ data: sortedPosts, error: null });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// Get single blog post
routes.get("/make-server-41c81a90/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const post = await kv.get(`post:${id}`);

    if (!post) {
      return c.json({ data: null, error: "Post not found" }, 404);
    }

    // Increment view count
    const updatedPost = { ...post, views: (post.views || 0) + 1 };
    await kv.set(`post:${id}`, updatedPost);

    return c.json({ data: updatedPost, error: null });
  } catch (error) {
    console.error(`Error fetching post ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// Create new blog post
routes.post("/make-server-41c81a90/posts", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;

    const post = {
      id,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      date: body.date || new Date().toISOString().split('T')[0],
      category: body.category,
      tags: body.tags || [],
      image: body.image,
      readTime: body.readTime,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`post:${id}`, post);
    return c.json({ data: post, error: null });
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// Update blog post
routes.put("/make-server-41c81a90/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingPost = await kv.get(`post:${id}`);

    if (!existingPost) {
      return c.json({ data: null, error: "Post not found" }, 404);
    }

    const updatedPost = {
      ...existingPost,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`post:${id}`, updatedPost);
    return c.json({ data: updatedPost, error: null });
  } catch (error) {
    console.error(`Error updating post ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// Delete blog post
routes.delete("/make-server-41c81a90/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`post:${id}`);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error deleting post ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// Agents API
// ============================================

routes.get("/make-server-41c81a90/agents", async (c) => {
  try {
    const agents = await kv.getByPrefix("agent:");
    return c.json({ data: agents, error: null });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.post("/make-server-41c81a90/agents", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;

    const agent = {
      id,
      name: body.name,
      description: body.description,
      category: body.category,
      icon: body.icon,
      image: body.image,
      url: body.url,
      embedUrl: body.embedUrl,
      embedCode: body.embedCode,
      displayMode: body.displayMode || "link",
      type: body.type,
      tags: body.tags || [],
      status: body.status || "active",
      featured: body.featured || false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`agent:${id}`, agent);
    return c.json({ data: agent, error: null });
  } catch (error) {
    console.error("Error creating agent:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.put("/make-server-41c81a90/agents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingAgent = await kv.get(`agent:${id}`);

    if (!existingAgent) {
      return c.json({ data: null, error: "Agent not found" }, 404);
    }

    const updatedAgent = { ...existingAgent, ...body, id };
    await kv.set(`agent:${id}`, updatedAgent);
    return c.json({ data: updatedAgent, error: null });
  } catch (error) {
    console.error(`Error updating agent ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.delete("/make-server-41c81a90/agents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`agent:${id}`);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error deleting agent ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// Gallery Photos Routes
// ============================================

routes.get("/make-server-41c81a90/photos", async (c) => {
  try {
    const photos = await kv.getByPrefix("photo:");
    const sortedPhotos = photos.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return c.json({ data: sortedPhotos, error: null });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.post("/make-server-41c81a90/photos", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;

    const photo = {
      id,
      url: body.url,
      title: body.title,
      description: body.description,
      location: body.location,
      date: body.date || new Date().toISOString().split('T')[0],
      category: body.category,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`photo:${id}`, photo);
    return c.json({ data: photo, error: null });
  } catch (error) {
    console.error("Error creating photo:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.put("/make-server-41c81a90/photos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingPhoto = await kv.get(`photo:${id}`);

    if (!existingPhoto) {
      return c.json({ data: null, error: "Photo not found" }, 404);
    }

    const updatedPhoto = { ...existingPhoto, ...body, id };
    await kv.set(`photo:${id}`, updatedPhoto);
    return c.json({ data: updatedPhoto, error: null });
  } catch (error) {
    console.error(`Error updating photo ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.delete("/make-server-41c81a90/photos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`photo:${id}`);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error deleting photo ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// Resources Routes
// ============================================

routes.get("/make-server-41c81a90/resources", async (c) => {
  try {
    const resources = await kv.getByPrefix("resource:");
    return c.json({ data: resources, error: null });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.post("/make-server-41c81a90/resources", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;

    const resource = {
      id,
      title: body.title,
      description: body.description,
      url: body.url,
      category: body.category,
      icon: body.icon,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`resource:${id}`, resource);
    return c.json({ data: resource, error: null });
  } catch (error) {
    console.error("Error creating resource:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.put("/make-server-41c81a90/resources/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingResource = await kv.get(`resource:${id}`);

    if (!existingResource) {
      return c.json({ data: null, error: "Resource not found" }, 404);
    }

    const updatedResource = { ...existingResource, ...body, id };
    await kv.set(`resource:${id}`, updatedResource);
    return c.json({ data: updatedResource, error: null });
  } catch (error) {
    console.error(`Error updating resource ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.delete("/make-server-41c81a90/resources/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`resource:${id}`);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error deleting resource ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// Trending Routes
// ============================================

routes.get("/make-server-41c81a90/trending", async (c) => {
  try {
    const items = await kv.getByPrefix("trending:");
    const sortedItems = items.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return c.json({ data: sortedItems, error: null });
  } catch (error) {
    console.error("Error fetching trending items:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.post("/make-server-41c81a90/trending", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;

    const item = {
      id,
      title: body.title,
      description: body.description,
      url: body.url,
      source: body.source,
      category: body.category,
      date: body.date || new Date().toISOString().split('T')[0],
      image: body.image,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`trending:${id}`, item);
    return c.json({ data: item, error: null });
  } catch (error) {
    console.error("Error creating trending item:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.put("/make-server-41c81a90/trending/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingItem = await kv.get(`trending:${id}`);

    if (!existingItem) {
      return c.json({ data: null, error: "Trending item not found" }, 404);
    }

    const updatedItem = { ...existingItem, ...body, id };
    await kv.set(`trending:${id}`, updatedItem);
    return c.json({ data: updatedItem, error: null });
  } catch (error) {
    console.error(`Error updating trending item ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

routes.delete("/make-server-41c81a90/trending/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`trending:${id}`);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error deleting trending item ${c.req.param("id")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// RSS Aggregation Routes
// ============================================

// 测试单个 RSS 源
routes.get("/make-server-41c81a90/test-rss/:sourceName", async (c) => {
  try {
    const sourceName = c.req.param("sourceName");
    const { RSS_SOURCES, aggregateRSS } = await import("./rss-aggregator.ts");

    const source = RSS_SOURCES.find(s => s.name === sourceName);
    if (!source) {
      return c.json({
        data: null,
        error: `信源 "${sourceName}" 不存在。可用信源: ${RSS_SOURCES.map(s => s.name).join(', ')}`
      }, 404);
    }

    console.log(`🧪 测试信源: ${source.name}`);
    console.log(`   URL: ${source.url}`);

    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Aggregator)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      return c.json({
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`
      }, response.status);
    }

    const xml = await response.text();

    return c.json({
      data: {
        source: source.name,
        url: source.url,
        status: 'success',
        contentLength: xml.length,
        preview: xml.substring(0, 500),
        isValidXML: xml.includes('<rss') || xml.includes('<feed')
      },
      error: null
    });

  } catch (error) {
    console.error("测试 RSS 源失败:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// 手动触发 RSS 聚合
routes.post("/make-server-41c81a90/aggregate-rss", async (c) => {
  try {
    const { aggregateRSS, deduplicateItems } = await import("./rss-aggregator.ts");

    console.log("开始 RSS 聚合...");

    // 拉取最近72小时的内容（3天）
    // 原因：甲子光年等中文媒体更新频率较低（每周3-5篇）
    const items = await aggregateRSS(72);

    // 去重
    const uniqueItems = deduplicateItems(items);

    // 保存到数据库（保留前50条，因为现在有13个信源）
    const topItems = uniqueItems.slice(0, 50);
    let saved = 0;

    for (const item of topItems) {
      // 检查是否已存在（通过 URL）
      const existing = await kv.getByPrefix("trending:");
      const exists = existing.some((e: any) => e.url === item.link);

      if (!exists) {
        const id = `rss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await kv.set(`trending:${id}`, {
          id,
          title: item.title,
          description: item.description,
          url: item.link,
          source: item.source,
          category: item.category,
          priority: item.priority,
          score: item.score,
          date: item.pubDate,
          createdAt: new Date().toISOString(),
        });
        saved++;
      }
    }

    console.log(`✅ RSS 聚合完成: ${saved} 条新内容`);

    return c.json({
      data: {
        message: `聚合完成`,
        total: items.length,
        unique: uniqueItems.length,
        saved: saved
      },
      error: null
    });
  } catch (error) {
    console.error("RSS 聚合失败:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// Initialize with sample data
// ============================================

routes.post("/make-server-41c81a90/init-data", async (c) => {
  try {
    // Check if data already exists
    const existingPosts = await kv.getByPrefix("post:");
    if (existingPosts.length > 0) {
      return c.json({
        data: { message: "Data already initialized" },
        error: null
      });
    }

    // Sample posts
    const samplePosts = [
      {
        id: "1",
        title: "探索大语言模型的未来：从 GPT-4 到多模态 AI",
        content: `大语言模型（LLM）正在以惊人的速度改变我们与技术的交互方式。从 GPT-3 到 GPT-4，再到如今的多模态AI系统，我们见证了人工智能领域的快速演进。`,
        excerpt: "深入分析当前大语言模型的发展趋势，探讨多模态AI如何改变我们与技术的交互方式，以及未来可能的发展方向。",
        date: "2026-04-08",
        readTime: "8 分钟",
        category: "人工智能",
        image: "https://images.unsplash.com/photo-1717501219263-9aa2d6a768d0?w=1080",
        tags: ["AI", "GPT-4", "多模态"],
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Save posts
    for (const post of samplePosts) {
      await kv.set(`post:${post.id}`, post);
    }

    return c.json({
      data: { message: "Sample data initialized successfully", count: samplePosts.length },
      error: null
    });
  } catch (error) {
    console.error("Error initializing data:", error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// ============================================
// KV Store Routes (for custom categories)
// ============================================

// Get value by key
routes.get("/make-server-41c81a90/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const value = await kv.get(key);
    return c.json({ data: value, error: null });
  } catch (error) {
    console.error(`Error getting key ${c.req.param("key")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// Set value by key
routes.put("/make-server-41c81a90/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const body = await c.req.json();
    await kv.set(key, body.value);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error setting key ${c.req.param("key")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

// Delete value by key
routes.delete("/make-server-41c81a90/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    await kv.del(key);
    return c.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(`Error deleting key ${c.req.param("key")}:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

export default routes;
