/**
 * MongoDB Connector for Museum Artwork Data
 * 连接 MongoDB 数据库，查询和导入博物馆艺术品数据
 */

import { MongoClient } from 'npm:mongodb@6.3.0';

const MONGODB_URI = Deno.env.get('MONGODB_URI') || '';

let client: MongoClient | null = null;

/**
 * 获取 MongoDB 客户端连接
 */
async function getMongoClient() {
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI 未配置，请在环境变量中设置 MONGODB_URI');
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 连接成功');
  }

  return client;
}

/**
 * 关闭 MongoDB 连接
 */
export async function closeMongoConnection() {
  if (client) {
    await client.close();
    client = null;
    console.log('MongoDB 连接已关闭');
  }
}

/**
 * 列出所有可用的数据库
 */
export async function listDatabases() {
  try {
    const mongoClient = await getMongoClient();
    const adminDb = mongoClient.db().admin();
    const { databases } = await adminDb.listDatabases();
    return { data: databases, error: null };
  } catch (error) {
    console.error('列出数据库失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 列出指定数据库的所有集合
 */
export async function listCollections(dbName: string) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collections = await db.listCollections().toArray();
    return { data: collections, error: null };
  } catch (error) {
    console.error('列出集合失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 查询艺术品数据（支持分页）
 */
export async function queryArtworks(
  dbName: string,
  collectionName: string,
  query: any = {},
  options: {
    skip?: number;
    limit?: number;
    sort?: any;
    projection?: any;
  } = {}
) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const skip = options.skip || 0;
    const limit = options.limit || 50;
    const sort = options.sort || { _id: -1 };
    const projection = options.projection || {};

    const [artworks, total] = await Promise.all([
      collection.find(query, { projection }).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    return {
      data: {
        artworks,
        total,
        page: Math.floor(skip / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
      error: null,
    };
  } catch (error) {
    console.error('查询艺术品失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 根据 ID 查询单个艺术品（支持关联查询）
 */
export async function getArtworkById(
  dbName: string,
  collectionName: string,
  artworkId: string
) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const { ObjectId } = await import('npm:mongodb@6.3.0');
    
    let query: any;
    try {
      // 尝试作为 ObjectId 查询
      query = { _id: new ObjectId(artworkId) };
    } catch {
      // 如果不是有效的 ObjectId，尝试作为字符串查询
      query = { _id: artworkId };
    }

    const artwork = await collection.findOne(query);

    if (!artwork) {
      return { data: null, error: '未找到艺术品' };
    }

    return { data: artwork, error: null };
  } catch (error) {
    console.error('查询艺术品详情失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 执行聚合查询（用于关联多个集合的数据）
 */
export async function aggregateArtworks(
  dbName: string,
  collectionName: string,
  pipeline: any[]
) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const results = await collection.aggregate(pipeline).toArray();

    return { data: results, error: null };
  } catch (error) {
    console.error('聚合查询失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 搜索艺术品（全文搜索）
 */
export async function searchArtworks(
  dbName: string,
  collectionName: string,
  searchQuery: string,
  searchFields: string[] = ['title', 'artist', 'description'],
  limit: number = 50
) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    // 构建多字段模糊查询
    const orConditions = searchFields.map(field => ({
      [field]: { $regex: searchQuery, $options: 'i' }
    }));

    const query = { $or: orConditions };
    const artworks = await collection.find(query).limit(limit).toArray();
    const total = await collection.countDocuments(query);

    return {
      data: { artworks, total },
      error: null,
    };
  } catch (error) {
    console.error('搜索艺术品失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 获取集合统计信息
 */
export async function getCollectionStats(dbName: string, collectionName: string) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const [total, sample] = await Promise.all([
      collection.countDocuments(),
      collection.findOne(),
    ]);

    // 分析字段结构
    const fields = sample ? Object.keys(sample) : [];

    return {
      data: {
        total,
        fields,
        sampleDocument: sample,
      },
      error: null,
    };
  } catch (error) {
    console.error('获取集合统计失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 批量导入艺术品到本地（返回转换后的数据，实际保存由调用者完成）
 */
export async function prepareArtworksForImport(
  dbName: string,
  collectionName: string,
  artworkIds: string[],
  fieldMapping?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    artist?: string;
    museum?: string;
    period?: string;
    category?: string;
  }
) {
  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    const { ObjectId } = await import('npm:mongodb@6.3.0');

    // 构建查询条件
    const query = {
      $or: artworkIds.map(id => {
        try {
          return { _id: new ObjectId(id) };
        } catch {
          return { _id: id };
        }
      })
    };

    const artworks = await collection.find(query).toArray();

    // 转换为统一格式
    const mapping = fieldMapping || {
      title: 'title',
      description: 'description',
      imageUrl: 'imageUrl',
      artist: 'artist',
      museum: 'museum',
      period: 'period',
      category: 'category',
    };

    const convertedArtworks = artworks.map(artwork => {
      const converted: any = {
        url: artwork[mapping.imageUrl || 'imageUrl'] || artwork.url || '',
        title: artwork[mapping.title || 'title'] || '未命名作品',
        description: artwork[mapping.description || 'description'] || '',
        location: artwork[mapping.museum || 'museum'] || '',
        date: new Date().toISOString().split('T')[0],
        category: artwork[mapping.category || 'category'] || '文化',
        likes: 0,
        views: 0,
        // 保存原始 MongoDB 数据的元信息
        metadata: {
          mongoId: artwork._id.toString(),
          artist: artwork[mapping.artist || 'artist'] || '',
          museum: artwork[mapping.museum || 'museum'] || '',
          period: artwork[mapping.period || 'period'] || '',
          originalData: artwork, // 保存完整的原始数据
        }
      };

      return converted;
    });

    return {
      data: {
        artworks: convertedArtworks,
        imported: convertedArtworks.length,
        total: artworkIds.length,
      },
      error: null,
    };
  } catch (error) {
    console.error('准备导入数据失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 测试 MongoDB 连接
 */
export async function testConnection() {
  try {
    const mongoClient = await getMongoClient();
    await mongoClient.db().admin().ping();
    return { data: { connected: true, message: 'MongoDB 连接成功' }, error: null };
  } catch (error) {
    console.error('MongoDB 连接测试失败:', error);
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}
