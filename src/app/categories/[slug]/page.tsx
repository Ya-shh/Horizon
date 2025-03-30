import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { FiArrowLeft, FiMessageSquare, FiFolder, FiUser, FiPlus, FiThumbsUp } from "react-icons/fi";

type Props = {
  params: {
    slug: string;
  };
};

export default async function CategoryPage({ params }: Props) {
  // Properly await the params object before accessing its properties
  const { slug } = await Promise.resolve(params);
  
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!category) {
    return notFound();
  }

  const posts = await db.post.findMany({
    where: {
      categoryId: category.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
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

  return (
    <div className="container mx-auto pt-8 pb-16 px-4 sm:px-6">
      <div className="relative">
        {/* Aurora background effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/30 rounded-full blur-3xl opacity-20"></div>
        
        {/* Category Header */}
        <div className="relative bg-background border border-border rounded-xl p-6 mb-8 shadow-sm">
          <Link href="/categories" className="inline-flex items-center text-muted-foreground mb-4 hover:text-primary transition-colors">
            <FiArrowLeft className="mr-2" /> Back to Categories
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient">{category.name}</h1>
              <p className="text-muted-foreground mt-2">{category.description}</p>
              
              <div className="flex items-center mt-4 text-sm text-muted-foreground">
                <FiUser className="mr-1" />
                <span>Created by {category.creator.name || category.creator.username}</span>
                <span className="mx-2">•</span>
                <FiMessageSquare className="mr-1" />
                <span>{category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}</span>
              </div>
            </div>
            
            <Link 
              href={`/posts/new?category=${category.slug}`}
              className="btn-modern self-start flex items-center"
            >
              <FiPlus className="mr-2" /> Create Post
            </Link>
          </div>
        </div>
        
        {/* Posts List */}
        <div className="relative">
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-background border border-border rounded-xl">
              <FiMessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to start a discussion in this category</p>
              <Link href={`/posts/new?category=${category.slug}`} className="btn-modern">
                <FiPlus className="mr-2" /> Create a Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                // Calculate total score from votes
                const score = post.votes && Array.isArray(post.votes) 
                  ? post.votes.reduce((acc, vote) => acc + vote.value, 0)
                  : 0;
                
                return (
                  <div 
                    key={post.id} 
                    className="bg-background border border-border hover:border-primary/20 rounded-xl p-5 transition-all hover:shadow-md flex gap-4"
                  >
                    {/* Vote score */}
                    <div className="hidden sm:flex flex-col items-center justify-start pt-1 w-10">
                      <FiThumbsUp className={`${score > 0 ? 'text-primary' : 'text-muted-foreground'} mb-1`} />
                      <span className={`text-sm font-medium ${
                        score > 0 ? 'text-primary' : 
                        score < 0 ? 'text-accent' : 
                        'text-muted-foreground'
                      }`}>{score}</span>
                    </div>
                    
                    {/* Post content */}
                    <div className="flex-1">
                      <Link href={`/posts/${post.id}`}>
                        <h2 className="text-xl font-semibold hover:text-primary transition-colors">{post.title}</h2>
                      </Link>
                      
                      <p className="text-muted-foreground mt-2 line-clamp-2">{post.content}</p>
                      
                      <div className="flex flex-wrap items-center mt-4 text-sm">
                        <div className="flex items-center mr-4">
                          {post.user.image ? (
                            <img 
                              src={post.user.image} 
                              alt={post.user.name || post.user.username}
                              className="w-6 h-6 rounded-full mr-2 object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <span className="text-primary text-xs font-medium">
                                {(post.user.name || post.user.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <Link 
                            href={`/users/${post.user.username}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.user.name || post.user.username}
                          </Link>
                        </div>
                        
                        <span className="text-muted-foreground mr-4">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                        
                        <div className="flex items-center text-muted-foreground">
                          <FiMessageSquare className="mr-1" />
                          <span>{post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}</span>
                        </div>
                        
                        <div className="sm:hidden flex items-center ml-4 text-muted-foreground">
                          <FiThumbsUp className="mr-1" />
                          <span>{score}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 