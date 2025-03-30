import Link from "next/link";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FiArrowLeft, FiClock, FiMessageCircle, FiThumbsUp, FiThumbsDown, FiShare2, FiBookmark } from "react-icons/fi";
import EnhancedCommentSection from "@/components/EnhancedCommentSection";
import ThreadDiscussion from "@/components/ThreadDiscussion";
import VoteButtons from "@/components/VoteButtons";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";

type PostPageProps = {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function PostPage({ params, searchParams }: PostPageProps) {
  try {
    // Properly await the params object before accessing its properties
    const { id } = await Promise.resolve(params);
    
    // Special case for "/posts/new" - redirect to the create page
    if (id === "new") {
      // If there's a category parameter, pass it along as categoryId
      const categoryParam = searchParams?.category 
        ? `?category=${searchParams.category}` 
        : '';
      
      // Redirect to the create post page
      redirect(`/posts/create${categoryParam}`);
    }

    // Fetch the post with its relations
    const post = await db.post.findUnique({
      where: { id },
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
        votes: {
          select: {
            id: true,
            userId: true,
            value: true,
          },
        },
      },
    });

    // If post doesn't exist, show 404
    if (!post) {
      console.error(`Post with ID ${id} not found`);
      return notFound();
    }

    // Calculate total votes score (upvotes - downvotes)
    const score = post.votes && Array.isArray(post.votes) 
      ? post.votes.reduce((acc: number, vote: { value: number }) => acc + vote.value, 0) 
      : 0;
      
    // Fetch related discussions in the same category, excluding current post
    const relatedPosts = await db.post.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id }, // Exclude current post
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
        votes: {
          select: {
            value: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent posts first
      },
      take: 4, // Get up to 4 related posts
    });
    
    // Calculate vote scores for related posts
    const relatedPostsWithScores = relatedPosts.map(relatedPost => {
      const voteScore = relatedPost.votes && Array.isArray(relatedPost.votes)
        ? relatedPost.votes.reduce((acc, vote) => acc + vote.value, 0)
        : 0;
      
      return {
        ...relatedPost,
        voteScore,
      };
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Link 
            href={`/categories/${post.category.slug}`} 
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-1" /> Back to {post.category.name}
          </Link>
        </div>

        {/* Main thread component */}
        <ThreadDiscussion post={post} showComments={true} />
        
        {/* Related threads */}
        {relatedPostsWithScores.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Related Discussions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPostsWithScores.map(relatedPost => (
                <div key={relatedPost.id} className="bg-card border border-border hover:border-primary/20 rounded-xl p-4 transition-all">
                  <h3 className="font-medium text-lg mb-1 hover:text-primary transition-colors">
                    <Link href={`/posts/${relatedPost.id}`}>{relatedPost.title}</Link>
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <span>by {relatedPost.user.username || relatedPost.user.name}</span>
                    <span className="mx-1">•</span>
                    <FiClock className="mr-1 h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(relatedPost.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FiThumbsUp className="mr-1 h-4 w-4" />
                      <span>{relatedPost.voteScore}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMessageCircle className="mr-1 h-4 w-4" />
                      <span>{relatedPost._count.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in PostPage component:", error);
    return notFound();
  }
} 