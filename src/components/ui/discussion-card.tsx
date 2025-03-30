"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  FiMessageCircle, 
  FiThumbsUp, 
  FiClock, 
  FiBookmark,
  FiStar,
  FiTrendingUp,
  FiEye,
  FiMoreHorizontal
} from "react-icons/fi";

type DiscussionCardProps = {
  post: any;
  index?: number;
  isFeatured?: boolean;
  isPinned?: boolean;
  isHot?: boolean;
  useAnimation?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact';
  showCategory?: boolean;
};

export default function DiscussionCard({
  post,
  index = 0,
  isFeatured = false,
  isPinned = false,
  isHot = false,
  useAnimation = true,
  layout = 'horizontal',
  showCategory = true
}: DiscussionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate total votes
  const voteScore = post.votes && Array.isArray(post.votes)
    ? post.votes.reduce((acc: number, vote: { value: number }) => acc + vote.value, 0)
    : 0;
  
  // Motion variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };
  
  // Background gradients for special cards
  const getBackgroundGradient = () => {
    if (isFeatured) {
      return "bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10";
    }
    if (isPinned) {
      return "bg-gradient-to-r from-amber-500/5 to-yellow-500/5 hover:from-amber-500/10 hover:to-yellow-500/10";
    }
    if (isHot) {
      return "bg-gradient-to-r from-red-500/5 to-orange-500/5 hover:from-red-500/10 hover:to-orange-500/10";
    }
    return "bg-card hover:bg-card/90";
  };
  
  // Timestamp with appropriate format
  const formattedTimestamp = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  // Badge component for showing status
  const StatusBadge = ({ type }: { type: 'featured' | 'pinned' | 'hot' }) => {
    const badges = {
      featured: {
        icon: <FiStar className="h-3 w-3" />,
        text: 'Featured',
        color: 'bg-primary/10 text-primary border-primary/20'
      },
      pinned: {
        icon: <FiBookmark className="h-3 w-3" />,
        text: 'Pinned',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      },
      hot: {
        icon: <FiTrendingUp className="h-3 w-3" />,
        text: 'Trending',
        color: 'bg-red-500/10 text-red-600 border-red-500/20'
      }
    };
    
    const badge = badges[type];
    
    return (
      <div className={`flex items-center text-xs px-2 py-1 rounded-full ${badge.color} border`}>
        {badge.icon}
        <span className="ml-1">{badge.text}</span>
      </div>
    );
  };
  
  const renderHorizontalLayout = () => (
    <div className="flex gap-4">
      {/* Left column with votes */}
      <div className="hidden sm:flex flex-col items-center space-y-1 pt-1">
        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
          voteScore > 0 
            ? 'bg-indigo-100/30 border border-indigo-200/30 text-indigo-600' 
            : 'bg-muted/30 border border-border text-muted-foreground'
        }`}>
          <FiThumbsUp className={voteScore > 0 ? 'fill-indigo-600/30' : ''} />
          <span className="ml-1 font-semibold">{voteScore}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">votes</span>
      </div>
      
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {isPinned && <StatusBadge type="pinned" />}
          {isFeatured && <StatusBadge type="featured" />}
          {isHot && <StatusBadge type="hot" />}
          
          {showCategory && (
            <Link 
              href={`/categories/${post.category.slug}`}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          
          <div className="text-xs text-muted-foreground flex items-center">
            <FiClock className="mr-1 h-3 w-3" />
            {formattedTimestamp}
          </div>
          
          {post.views !== undefined && (
            <div className="text-xs text-muted-foreground flex items-center">
              <FiEye className="mr-1 h-3 w-3" />
              {post.views || 0} views
            </div>
          )}
        </div>
        
        <Link href={`/posts/${post.id}`} className="block group">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {post.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/users/${post.user.username}`} className="flex items-center group">
              <div className="relative mr-2">
                {post.user.image ? (
                  <img
                    src={post.user.image}
                    alt={post.user.name || post.user.username}
                    className="w-6 h-6 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary transition-all"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:ring-2 group-hover:ring-primary transition-all">
                    <span className="text-primary text-xs font-semibold">
                      {(post.user.name || post.user.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {post.user.name || post.user.username}
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center sm:hidden text-muted-foreground">
              <FiThumbsUp className="mr-1 h-4 w-4" />
              <span className="text-sm">{voteScore}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <FiMessageCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">{post._count.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderVerticalLayout = () => (
    <div className="space-y-3">
      {/* Post metadata */}
      <div className="flex flex-wrap items-center gap-2">
        {isPinned && <StatusBadge type="pinned" />}
        {isFeatured && <StatusBadge type="featured" />}
        {isHot && <StatusBadge type="hot" />}
        
        {showCategory && (
          <Link 
            href={`/categories/${post.category.slug}`}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            {post.category.name}
          </Link>
        )}
      </div>
      
      {/* Post title and content */}
      <Link href={`/posts/${post.id}`} className="block group">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
      </Link>
      
      <p className="text-muted-foreground line-clamp-3 mb-2">
        {post.content}
      </p>
      
      {/* User, timestamp and stats */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Link href={`/users/${post.user.username}`} className="flex items-center group">
          <div className="relative mr-2">
            {post.user.image ? (
              <img
                src={post.user.image}
                alt={post.user.name || post.user.username}
                className="w-7 h-7 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary transition-all"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:ring-2 group-hover:ring-primary transition-all">
                <span className="text-primary text-xs font-semibold">
                  {(post.user.name || post.user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {post.user.name || post.user.username}
            </span>
            <div className="text-xs text-muted-foreground">
              {formattedTimestamp}
            </div>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-muted-foreground">
            <FiThumbsUp className="mr-1 h-4 w-4" />
            <span className="text-sm">{voteScore}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <FiMessageCircle className="mr-1 h-4 w-4" />
            <span className="text-sm">{post._count.comments}</span>
          </div>
          {post.views !== undefined && (
            <div className="flex items-center text-muted-foreground">
              <FiEye className="mr-1 h-4 w-4" />
              <span className="text-sm">{post.views || 0}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const renderCompactLayout = () => (
    <div className="flex items-center gap-3">
      {/* Vote count */}
      <div className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
        voteScore > 0 
          ? 'bg-indigo-100/30 border border-indigo-200/30 text-indigo-600' 
          : 'bg-muted/30 border border-border text-muted-foreground'
      }`}>
        <span className="text-xs font-semibold">{voteScore}</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/posts/${post.id}`} className="block group">
          <h4 className="font-medium truncate group-hover:text-primary transition-colors">
            {post.title}
          </h4>
        </Link>
        
        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
          <span className="truncate">
            by {post.user.name || post.user.username}
          </span>
          <span className="mx-1">•</span>
          <FiClock className="mr-1 h-3 w-3" />
          <span>{formattedTimestamp}</span>
        </div>
      </div>
      
      {/* Comment count */}
      <div className="flex items-center text-muted-foreground">
        <FiMessageCircle className="mr-1 h-4 w-4" />
        <span className="text-sm">{post._count.comments}</span>
      </div>
    </div>
  );
  
  return (
    <motion.div
      className={`border border-border rounded-xl p-4 transition-all ${getBackgroundGradient()}`}
      variants={useAnimation ? cardVariants : undefined}
      initial={useAnimation ? "hidden" : "visible"}
      animate={useAnimation ? "visible" : "visible"}
      whileHover={useAnimation ? "hover" : undefined}
      whileTap={useAnimation ? "tap" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {layout === 'horizontal' && renderHorizontalLayout()}
      {layout === 'vertical' && renderVerticalLayout()}
      {layout === 'compact' && renderCompactLayout()}
      
      {/* Decorative elements */}
      {isHovered && (
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full filter blur-3xl"></div>
        </div>
      )}
    </motion.div>
  );
} 