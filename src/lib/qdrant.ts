import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import { Post, Comment, Category, User } from '@prisma/client';

// Check if OpenAI API key is available
const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;

// Initialize the OpenAI client (will use OPENAI_API_KEY from .env)
const openai = hasOpenAIKey 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize the Qdrant client (assumes a local or remote Qdrant instance)
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false, // Skip version check
});

// Collection names in Qdrant
const COLLECTIONS = {
  POSTS: 'posts',
  COMMENTS: 'comments',
  CATEGORIES: 'categories',
  USERS: 'users',
};

// Function to initialize Qdrant collections
export async function initQdrantCollections() {
  if (!hasOpenAIKey) {
    console.warn('OPENAI_API_KEY not provided. Vector search will use mock data.');
    return true;
  }
  
  try {
    // Create collections if they don't exist
    for (const collectionName of Object.values(COLLECTIONS)) {
      const collections = await qdrantClient.getCollections();
      const collectionExists = collections.collections.some(
        (c) => c.name === collectionName
      );

      if (!collectionExists) {
        await qdrantClient.createCollection(collectionName, {
          vectors: {
            size: 1536, // OpenAI embedding dimension
            distance: 'Cosine',
          },
        });
        console.log(`Created collection: ${collectionName}`);
      }
    }
    return true;
  } catch (error) {
    console.error('Error initializing Qdrant collections:', error);
    return false;
  }
}

// Function to generate embeddings using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  // If no OpenAI API key, return mock embedding
  if (!hasOpenAIKey) {
    return generateMockEmbedding(text);
  }
  
  try {
    const response = await openai!.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return generateMockEmbedding(text);
  }
}

// Generate a deterministic mock embedding for demo purposes
function generateMockEmbedding(text: string): number[] {
  // Simple deterministic hash function
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
  };
  
  // Generate a 1536-dimensional vector based on the text hash
  const baseHash = hash(text);
  const mockEmbedding = Array(1536).fill(0).map((_, i) => {
    // Generate a pseudo-random but deterministic value between -1 and 1
    const value = Math.sin(baseHash + i) / 2 + 0.5;
    return value;
  });
  
  return mockEmbedding;
}

// Function to index a post in Qdrant
export async function indexPost(post: Post & { user: User; category: Category }) {
  if (!hasOpenAIKey) {
    console.warn('OPENAI_API_KEY not provided. Skipping post indexing.');
    return true;
  }
  
  try {
    const textToEmbed = `${post.title} ${post.content} ${post.user.username} ${post.category.name}`;
    const embedding = await generateEmbedding(textToEmbed);

    await qdrantClient.upsert(COLLECTIONS.POSTS, {
      wait: true,
      points: [
        {
          id: post.id,
          vector: embedding,
          payload: {
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt.toISOString(),
            userId: post.userId,
            username: post.user.username,
            userName: post.user.name,
            categoryId: post.categoryId,
            categoryName: post.category.name,
            type: 'post',
          },
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Error indexing post:', error);
    return false;
  }
}

// Function to index a comment in Qdrant
export async function indexComment(
  comment: Comment & { user: User; post: Post }
) {
  if (!hasOpenAIKey) {
    console.warn('OPENAI_API_KEY not provided. Skipping comment indexing.');
    return true;
  }
  
  try {
    const textToEmbed = `${comment.content} ${comment.user.username} comment on post: ${comment.post.title}`;
    const embedding = await generateEmbedding(textToEmbed);

    await qdrantClient.upsert(COLLECTIONS.COMMENTS, {
      wait: true,
      points: [
        {
          id: comment.id,
          vector: embedding,
          payload: {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            userId: comment.userId,
            username: comment.user.username,
            userName: comment.user.name,
            postId: comment.postId,
            postTitle: comment.post.title,
            type: 'comment',
          },
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Error indexing comment:', error);
    return false;
  }
}

// Function to index a category in Qdrant
export async function indexCategory(category: Category) {
  if (!hasOpenAIKey) {
    console.warn('OPENAI_API_KEY not provided. Skipping category indexing.');
    return true;
  }
  
  try {
    const textToEmbed = `${category.name} ${category.description || ''}`;
    const embedding = await generateEmbedding(textToEmbed);

    await qdrantClient.upsert(COLLECTIONS.CATEGORIES, {
      wait: true,
      points: [
        {
          id: category.id,
          vector: embedding,
          payload: {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            type: 'category',
          },
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Error indexing category:', error);
    return false;
  }
}

// Function to search across all collections
export async function vectorSearch(query: string, limit = 10) {
  if (!hasOpenAIKey) {
    return mockSearch(query, limit);
  }
  
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Search in all collections
    const [postsResults, commentsResults, categoriesResults] = await Promise.all([
      qdrantClient.search(COLLECTIONS.POSTS, {
        vector: queryEmbedding,
        limit,
      }),
      qdrantClient.search(COLLECTIONS.COMMENTS, {
        vector: queryEmbedding,
        limit,
      }),
      qdrantClient.search(COLLECTIONS.CATEGORIES, {
        vector: queryEmbedding,
        limit,
      }),
    ]);

    // Combine and sort results by score
    const combinedResults = [
      ...postsResults.map(r => ({ ...r, payload: { ...r.payload, score: r.score } })),
      ...commentsResults.map(r => ({ ...r, payload: { ...r.payload, score: r.score } })),
      ...categoriesResults.map(r => ({ ...r, payload: { ...r.payload, score: r.score } })),
    ].sort((a, b) => b.score - a.score).slice(0, limit);

    return combinedResults.map(r => r.payload);
  } catch (error) {
    console.error('Error during vector search:', error);
    return mockSearch(query, limit);
  }
}

// Mock search function for when OpenAI API key is not available
async function mockSearch(query: string, limit = 10) {
  try {
    // For demo, fetch posts from the database and filter them by the query
    console.warn('Using mock search since OpenAI API key is not provided');
    
    // Import dynamically to avoid circular dependency
    const { db } = await import('@/lib/db');
    
    // Get posts that match the query
    const posts = await db.post.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        category: true,
      },
      take: limit,
    });
    
    // Get comments that match the query
    const comments = await db.comment.findMany({
      where: {
        content: { contains: query },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: limit,
    });
    
    // Get categories that match the query
    const categories = await db.category.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: limit,
    });
    
    // Format the results similar to the vector search
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      userId: post.userId,
      username: post.user.username,
      userName: post.user.name,
      categoryId: post.categoryId,
      categoryName: post.category.name,
      type: 'post',
      score: 0.9, // Mock score
    }));
    
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      userId: comment.userId,
      username: comment.user.username,
      userName: comment.user.name,
      postId: comment.postId,
      postTitle: comment.post.title,
      type: 'comment',
      score: 0.8, // Mock score
    }));
    
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      type: 'category',
      score: 0.7, // Mock score
    }));
    
    // Combine and limit
    return [...formattedPosts, ...formattedComments, ...formattedCategories].slice(0, limit);
  } catch (error) {
    console.error('Error during mock search:', error);
    return [];
  }
}

// Function to delete a document from its collection
export async function deleteDocument(id: string, type: 'post' | 'comment' | 'category') {
  if (!hasOpenAIKey) {
    console.warn('OPENAI_API_KEY not provided. Skipping document deletion.');
    return true;
  }
  
  try {
    let collection;
    
    switch (type) {
      case 'post':
        collection = COLLECTIONS.POSTS;
        break;
      case 'comment':
        collection = COLLECTIONS.COMMENTS;
        break;
      case 'category':
        collection = COLLECTIONS.CATEGORIES;
        break;
      default:
        throw new Error(`Invalid document type: ${type}`);
    }
    
    await qdrantClient.delete(collection, {
      wait: true,
      points: [id],
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return false;
  }
} 