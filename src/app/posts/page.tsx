import Link from "next/link";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { FiUser, FiMessageCircle, FiThumbsUp, FiClock, FiSearch, FiFilter } from "react-icons/fi";

export default async function AllPostsPage() {
  // Fetch all posts
  const posts = await db.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
      votes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate vote scores for each post
  const postsWithScores = posts.map(post => {
    const score = post.votes && Array.isArray(post.votes) 
      ? post.votes.reduce((acc, vote) => acc + vote.value, 0)
      : 0;
    
    return {
      ...post,
      score,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">All Discussions</h1>
        
        <div className="flex space-x-4">
          <Link
            href="/posts/create"
            className="btn-primary flex items-center"
          >
            Create Post
          </Link>
        </div>
      </div>
      
      <div className="space-y-4">
        {postsWithScores.map(post => (
          <div 
            key={post.id} 
            className="bg-card border border-border hover:border-primary/20 rounded-xl p-5 transition-all hover:shadow-md"
          >
            <div className="flex gap-4">
              {/* Vote score */}
              <div className="hidden sm:flex flex-col items-center space-y-1 pt-2 w-10">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className={`font-semibold ${
                    post.score > 0 ? 'text-primary' : 
                    post.score < 0 ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {post.score}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    {post.category.name}
                  </Link>
                  <span>•</span>
                  <span className="flex items-center">
                    <FiClock className="mr-1 h-3 w-3" />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <Link href={`/posts/${post.id}`}>
                  <h2 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {post.user.image ? (
                      <img 
                        src={post.user.image} 
                        alt={post.user.name || post.user.username}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <FiUser className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <Link
                      href={`/users/${post.user.username}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {post.user.name || post.user.username}
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center sm:hidden">
                      <FiThumbsUp className="mr-1 h-4 w-4" />
                      <span>{post.score}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMessageCircle className="mr-1 h-4 w-4" />
                      <span>{post._count.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 