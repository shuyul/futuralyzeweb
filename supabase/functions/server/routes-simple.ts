import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const routes = new Hono();

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

export default routes;
