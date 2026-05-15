// API utilities for communicating with the backend
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1`;

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error on ${endpoint}:`, data.error || response.statusText);
      return { data: null, error: data.error || response.statusText };
    }

    return data;
  } catch (error) {
    console.error(`Network error on ${endpoint}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// ============================================
// Image Upload API
// ============================================

export const uploadImage = async (formData: FormData): Promise<ApiResponse<{ url: string, fileName?: string, size?: number, type?: string }>> => {
  try {
    const response = await fetch(`${API_BASE}/make-server-41c81a90/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Image upload error:', text);
      try {
        const data = JSON.parse(text);
        return { data: null, error: data.error || response.statusText };
      } catch {
        return { data: null, error: text || response.statusText };
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Network error during image upload:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

// ============================================
// Blog Posts API
// ============================================

export const postsApi = {
  getAll: () => apiCall('/make-server-41c81a90/posts'),
  
  getById: (id: string) => apiCall(`/make-server-41c81a90/posts/${id}`),
  
  create: (post: any) => apiCall('/make-server-41c81a90/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  }),
  
  update: (id: string, post: any) => apiCall(`/make-server-41c81a90/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  }),
  
  delete: (id: string) => apiCall(`/make-server-41c81a90/posts/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// Gallery Photos API
// ============================================

export const photosApi = {
  getAll: () => apiCall('/make-server-41c81a90/photos'),
  
  create: (photo: any) => apiCall('/make-server-41c81a90/photos', {
    method: 'POST',
    body: JSON.stringify(photo),
  }),
  
  update: (id: string, photo: any) => apiCall(`/make-server-41c81a90/photos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(photo),
  }),
  
  delete: (id: string) => apiCall(`/make-server-41c81a90/photos/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// Agents API
// ============================================

export const agentsApi = {
  getAll: () => apiCall('/make-server-41c81a90/agents'),
  
  create: (agent: any) => apiCall('/make-server-41c81a90/agents', {
    method: 'POST',
    body: JSON.stringify(agent),
  }),
  
  update: (id: string, agent: any) => apiCall(`/make-server-41c81a90/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agent),
  }),
  
  delete: (id: string) => apiCall(`/make-server-41c81a90/agents/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// Resources API
// ============================================

export const resourcesApi = {
  getAll: () => apiCall('/make-server-41c81a90/resources'),
  
  create: (resource: any) => apiCall('/make-server-41c81a90/resources', {
    method: 'POST',
    body: JSON.stringify(resource),
  }),
  
  update: (id: string, resource: any) => apiCall(`/make-server-41c81a90/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(resource),
  }),
  
  delete: (id: string) => apiCall(`/make-server-41c81a90/resources/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// Trending API
// ============================================

export const trendingApi = {
  getAll: () => apiCall('/make-server-41c81a90/trending'),
  
  create: (item: any) => apiCall('/make-server-41c81a90/trending', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  
  update: (id: string, item: any) => apiCall(`/make-server-41c81a90/trending/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  
  delete: (id: string) => apiCall(`/make-server-41c81a90/trending/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// Initialize sample data
// ============================================

export const initData = () => apiCall('/make-server-41c81a90/init-data', {
  method: 'POST',
});

// ============================================
// KV Store API
// ============================================

export const kv = {
  get: (key: string) => apiCall(`/make-server-41c81a90/kv/${key}`),
  
  set: (key: string, value: any) => apiCall(`/make-server-41c81a90/kv/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),
  
  delete: (key: string) => apiCall(`/make-server-41c81a90/kv/${key}`, {
    method: 'DELETE',
  }),
};