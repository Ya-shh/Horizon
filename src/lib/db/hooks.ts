import { PrismaClient } from '@prisma/client';
import { indexPost, indexComment, indexCategory, deleteDocument } from '@/lib/qdrant';

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Add middleware hooks for automatic indexing when data changes
prisma.$use(async (params, next) => {
  // Handle post operations
  if (params.model === 'Post') {
    // After a post is created or updated
    if (params.action === 'create' || params.action === 'update') {
      const result = await next(params);
      
      // Fetch the full post with related data for indexing
      const post = await prisma.post.findUnique({
        where: { id: result.id },
        include: {
          user: true,
          category: true,
        },
      });
      
      if (post) {
        // Index the post in Qdrant
        await indexPost(post);
      }
      
      return result;
    }
    
    // After a post is deleted
    if (params.action === 'delete') {
      const post = await prisma.post.findUnique({
        where: params.args.where,
      });
      
      const result = await next(params);
      
      if (post) {
        // Delete the post from Qdrant
        await deleteDocument(post.id, 'post');
      }
      
      return result;
    }
  }
  
  // Handle comment operations
  if (params.model === 'Comment') {
    // After a comment is created or updated
    if (params.action === 'create' || params.action === 'update') {
      const result = await next(params);
      
      // Fetch the full comment with related data for indexing
      const comment = await prisma.comment.findUnique({
        where: { id: result.id },
        include: {
          user: true,
          post: true,
        },
      });
      
      if (comment) {
        // Index the comment in Qdrant
        await indexComment(comment);
      }
      
      return result;
    }
    
    // After a comment is deleted
    if (params.action === 'delete') {
      const comment = await prisma.comment.findUnique({
        where: params.args.where,
      });
      
      const result = await next(params);
      
      if (comment) {
        // Delete the comment from Qdrant
        await deleteDocument(comment.id, 'comment');
      }
      
      return result;
    }
  }
  
  // Handle category operations
  if (params.model === 'Category') {
    // After a category is created or updated
    if (params.action === 'create' || params.action === 'update') {
      const result = await next(params);
      
      // Fetch the category
      const category = await prisma.category.findUnique({
        where: { id: result.id },
      });
      
      if (category) {
        // Index the category in Qdrant
        await indexCategory(category);
      }
      
      return result;
    }
    
    // After a category is deleted
    if (params.action === 'delete') {
      const category = await prisma.category.findUnique({
        where: params.args.where,
      });
      
      const result = await next(params);
      
      if (category) {
        // Delete the category from Qdrant
        await deleteDocument(category.id, 'category');
      }
      
      return result;
    }
  }
  
  // For all other operations, just pass through
  return next(params);
});

export { prisma }; 