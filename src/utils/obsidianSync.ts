/**
 * Obsidian GitHub 集成工具
 * 从 GitHub 仓库读取 Obsidian 笔记并解析
 */

export interface ObsidianNote {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  links: string[]; // [[双向链接]]
  github_url: string;
  obsidian_path: string;
  last_synced: string;
  metadata: {
    publish?: boolean;
    category?: string;
    status?: string;
    created?: string;
    modified?: string;
    author?: string;
    [key: string]: any;
  };
}

export interface GitHubConfig {
  owner: string; // GitHub 用户名
  repo: string; // 仓库名
  branch?: string; // 分支，默认 main
  folder?: string; // 指定文件夹，如 "Public"
  token?: string; // Personal Access Token（私有仓库需要）
}

/**
 * 解析 YAML front matter
 */
function parseYAMLFrontMatter(content: string): { metadata: any; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { metadata: {}, body: content };
  }

  const yamlContent = match[1];
  const body = match[2];

  // 简单的 YAML 解析
  const metadata: any = {};
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: any = line.substring(colonIndex + 1).trim();

    // 移除引号
    if (typeof value === 'string') {
      value = value.replace(/^["']|["']$/g, '');
    }

    // 处理布尔值（在移除引号后检查）
    if (value === 'true') value = true;
    if (value === 'false') value = false;

    // 处理数组
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''));
    }

    metadata[key] = value;
  }

  return { metadata, body };
}

/**
 * 提取 Obsidian 标签（#标签）
 */
function extractTags(content: string): string[] {
  const tagRegex = /#(\w+)/g;
  const tags = new Set<string>();
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }

  return Array.from(tags);
}

/**
 * 提取双向链接（[[链接]]）
 */
function extractLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = new Set<string>();
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.add(match[1]);
  }

  return Array.from(links);
}

/**
 * 生成摘要
 */
function generateExcerpt(content: string, maxLength: number = 200): string {
  // 移除 YAML front matter
  const withoutFrontMatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // 移除 Markdown 语法
  let text = withoutFrontMatter
    .replace(/#{1,6}\s/g, '') // 标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // 双向链接
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .trim();

  // 截取前 N 个字符
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }

  return text;
}

/**
 * 从 GitHub 获取文件列表
 */
export async function fetchGitHubFiles(config: GitHubConfig): Promise<string[]> {
  const { owner, repo, folder = '', token } = config;
  let { branch = 'main' } = config;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // 尝试的分支列表
  const branchesToTry = branch === 'main' ? ['main', 'master'] : [branch];

  console.log(`正在连接 GitHub 仓库: ${owner}/${repo}`);
  console.log(`使用 token: ${token ? '是' : '否'}`);

  for (const tryBranch of branchesToTry) {
    try {
      console.log(`尝试分支: ${tryBranch}`);

      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${tryBranch}?recursive=1`;
      console.log('API URL:', url);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`分支 ${tryBranch} 错误响应:`, errorText);

        // 如果不是最后一个分支，继续尝试
        if (tryBranch !== branchesToTry[branchesToTry.length - 1]) {
          continue;
        }

        // 最后一个分支也失败了
        if (response.status === 404) {
          throw new Error(`仓库不存在或无访问权限。请检查：\n1. 仓库地址是否正确 (${owner}/${repo})\n2. 如果是私有仓库，请提供有效的 Personal Access Token\n3. Token 权限需要包含 repo 或 public_repo`);
        }

        throw new Error(`GitHub API 错误 ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.tree) {
        console.error('API 返回数据:', data);
        throw new Error('GitHub API 返回格式异常');
      }

      console.log(`✅ 成功连接到分支: ${tryBranch}`);

      // 筛选 .md 文件
      let files = data.tree
        .filter((item: any) => item.type === 'blob' && item.path.endsWith('.md'))
        .map((item: any) => item.path);

      console.log(`找到 ${files.length} 个 .md 文件`);
      if (files.length > 0) {
        console.log('前 5 个文件:', files.slice(0, 5));
      }

      // 如果指定了文件夹，只返回该文件夹下的文件
      if (folder) {
        files = files.filter((path: string) => path.startsWith(folder + '/'));
        console.log(`过滤文件夹 "${folder}" 后剩余 ${files.length} 个文件`);
      }

      return files;
    } catch (error) {
      // 如果不是最后一个分支，继续尝试
      if (tryBranch !== branchesToTry[branchesToTry.length - 1]) {
        continue;
      }

      // 最后一个分支也失败了
      console.error('获取 GitHub 文件列表失败:', error);
      throw error;
    }
  }

  throw new Error('无法连接到仓库');
}

/**
 * 从 GitHub 获取单个文件内容
 */
export async function fetchGitHubFileContent(
  config: GitHubConfig,
  path: string
): Promise<string> {
  const { owner, repo, branch = 'main', token } = config;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3.raw',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`获取文件 ${path} 失败:`, error);
    throw error;
  }
}

/**
 * 解析单个 Obsidian 笔记
 */
export function parseObsidianNote(
  content: string,
  path: string,
  config: GitHubConfig
): ObsidianNote | null {
  const { metadata, body } = parseYAMLFrontMatter(content);

  // 调试日志
  console.log(`解析文件: ${path}`);
  console.log(`YAML metadata:`, metadata);
  console.log(`publish 字段值:`, metadata.publish, `类型:`, typeof metadata.publish);

  // 白名单机制：只处理 publish: true 的笔记
  if (metadata.publish !== true) {
    console.log(`❌ 文件 ${path} 被跳过: publish=${metadata.publish}`);
    return null;
  }

  console.log(`✅ 文件 ${path} 通过过滤`);


  // 提取标签和链接
  const tags = [
    ...(metadata.tags || []),
    ...extractTags(body)
  ];
  const links = extractLinks(body);

  // 生成 GitHub URL
  const { owner, repo, branch = 'main' } = config;
  const github_url = `https://github.com/${owner}/${repo}/blob/${branch}/${path}`;

  // 生成标题
  const title = metadata.title || path.split('/').pop()?.replace('.md', '') || 'Untitled';

  // 生成摘要
  const excerpt = metadata.description || generateExcerpt(body);

  return {
    id: path.replace(/\//g, '-').replace('.md', ''),
    title,
    content: body,
    excerpt,
    tags: Array.from(new Set(tags)),
    links,
    github_url,
    obsidian_path: path,
    last_synced: new Date().toISOString(),
    metadata: {
      ...metadata,
      created: metadata.created || metadata.date,
      modified: metadata.modified || metadata.updated,
    },
  };
}

/**
 * 同步所有笔记
 */
export async function syncObsidianNotes(
  config: GitHubConfig,
  onProgress?: (current: number, total: number, file: string) => void
): Promise<ObsidianNote[]> {
  try {
    // 1. 获取文件列表
    const files = await fetchGitHubFiles(config);
    console.log(`找到 ${files.length} 个 Markdown 文件`);

    // 2. 逐个读取并解析
    const notes: ObsidianNote[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (onProgress) {
        onProgress(i + 1, files.length, file);
      }

      try {
        console.log(`\n📄 正在处理文件 ${i + 1}/${files.length}: ${file}`);
        const content = await fetchGitHubFileContent(config, file);
        console.log(`文件内容长度: ${content.length} 字符`);
        console.log(`文件前200字符:`, content.substring(0, 200));

        const note = parseObsidianNote(content, file, config);

        if (note) {
          console.log(`✅ 成功解析笔记: ${note.title}`);
          notes.push(note);
        } else {
          console.log(`⏭️ 跳过此文件（未通过 publish 检查）`);
        }
      } catch (error) {
        console.error(`❌ 解析文件 ${file} 失败:`, error);
        // 继续处理其他文件
      }
    }

    console.log(`\n📊 同步完成统计:`);
    console.log(`- 总文件数: ${files.length}`);
    console.log(`- 成功导入: ${notes.length}`);
    console.log(`- 跳过/失败: ${files.length - notes.length}`);
    return notes;
  } catch (error) {
    console.error('同步 Obsidian 笔记失败:', error);
    throw error;
  }
}

/**
 * 解析配置字符串
 * 例如: "username/repo" 或 "username/repo/branch/folder"
 */
export function parseGitHubConfigString(configStr: string): Partial<GitHubConfig> {
  // 去除可能的 https:// 和 github.com 前缀
  let cleanStr = configStr.trim();
  cleanStr = cleanStr.replace(/^https?:\/\//, '');
  cleanStr = cleanStr.replace(/^github\.com\//, '');
  cleanStr = cleanStr.replace(/\.git$/, '');

  const parts = cleanStr.split('/');

  if (parts.length < 2) {
    throw new Error('GitHub 仓库格式错误，应为: username/repo');
  }

  return {
    owner: parts[0],
    repo: parts[1],
    branch: parts[2] || 'main',
    folder: parts.slice(3).join('/'),
  };
}
