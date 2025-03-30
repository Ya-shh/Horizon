"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { 
  FiMessageCircle, 
  FiUser, 
  FiThumbsUp, 
  FiThumbsDown,
  FiShare2, 
  FiCornerDownRight, 
  FiBookmark, 
  FiMoreHorizontal,
  FiEdit,
  FiFlag,
  FiTrash2,
  FiClock,
  FiAlertCircle
} from "react-icons/fi";
import VoteButtons from "./VoteButtons";
import CommentSection from "./CommentSection";

type ThreadDiscussionProps = {
  post: any;
  showComments?: boolean;
  isPreview?: boolean;
};

export default function ThreadDiscussion({ post, showComments = false, isPreview = false }: ThreadDiscussionProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [showFullContent, setShowFullContent] = useState(!isPreview);
  const [isReplying, setIsReplying] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Calculate vote score
  const score = post.votes && Array.isArray(post.votes) 
    ? post.votes.reduce((acc: number, vote: { value: number }) => acc + vote.value, 0) 
    : 0;
  
  // Handle clicks outside of action menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.div 
      className="card-modern overflow-hidden bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30 backdrop-blur-sm"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      layoutId={isPreview ? undefined : `post-${post.id}`}
    >
      <div className="relative">
        {/* Category badge and timestamp */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <Link
            href={`/categories/${post.category.slug}`}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800/50 dark:hover:bg-indigo-800/50 transition-colors"
          >
            {post.category.name}
          </Link>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <FiClock className="mr-1 h-3 w-3" />
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4">
            {/* Left column with votes */}
            <div className="hidden sm:flex flex-col items-center space-y-1">
              <VoteButtons
                postId={post.id}
                initialScore={score}
                initialVote={null}
              />
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              {/* User info */}
              <div className="flex items-center mb-4">
                <Link href={`/users/${post.user.username}`} className="flex items-center group">
                  <div className="relative mr-3">
                    {post.user.image ? (
                      <img
                        src={post.user.image}
                        alt={post.user.name || post.user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 dark:group-hover:border-indigo-400 transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-2 border-transparent group-hover:border-indigo-500 dark:group-hover:border-indigo-400 transition-colors">
                        <FiUser className="text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <span className="text-white text-[8px] font-bold">5</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {post.user.name || post.user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Thread Starter</p>
                  </div>
                </Link>
              </div>
              
              {/* Post title */}
              {!isPreview ? (
                <h1 className="text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {post.title}
                </h1>
              ) : (
                <Link href={`/posts/${post.id}`} className="block mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h2>
                </Link>
              )}
              
              {/* Post content */}
              <div className="prose dark:prose-invert prose-indigo max-w-none mb-6 text-gray-700 dark:text-gray-300">
                {isPreview ? (
                  <>
                    <p className="line-clamp-3">{post.content}</p>
                    {post.content.length > 200 && (
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center mt-2"
                      >
                        Read more <FiCornerDownRight className="ml-1" />
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    {post.content.split("\n").map((paragraph: string, i: number) => (
                      paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                    ))}
                  </>
                )}
              </div>
              
              {/* Mobile vote buttons */}
              <div className="sm:hidden flex items-center justify-start mb-6">
                <VoteButtons
                  postId={post.id}
                  initialScore={score}
                  initialVote={null}
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-sm">
                  <Link
                    href={isPreview ? `/posts/${post.id}#comments` : "#comments"}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <FiMessageCircle className="mr-1 h-4 w-4" />
                    <span className="font-medium">{post._count.comments} Comment{post._count.comments !== 1 ? 's' : ''}</span>
                  </Link>
                  
                  <button
                    onClick={() => setIsReplying(true)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <FiCornerDownRight className="mr-1 h-4 w-4" />
                    <span className="font-medium">Reply</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {}}
                    className="icon-button bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    aria-label="Bookmark"
                  >
                    <FiBookmark className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => {}}
                    className="icon-button bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    aria-label="Share"
                  >
                    <FiShare2 className="h-4 w-4" />
                  </button>
                  
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                      className="icon-button bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                      aria-label="More actions"
                    >
                      <FiMoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    <AnimatePresence>
                      {isActionMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-20"
                        >
                          <button
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 w-full text-left"
                            onClick={() => {}}
                          >
                            <FiEdit className="mr-2 h-4 w-4" />
                            Edit Post
                          </button>
                          <button
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 w-full text-left"
                            onClick={() => {}}
                          >
                            <FiFlag className="mr-2 h-4 w-4" />
                            Report
                          </button>
                          <button
                            className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                            onClick={() => {}}
                          >
                            <FiTrash2 className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reply section */}
        <AnimatePresence>
          {isReplying && !isPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Post a reply</h3>
                  <button
                    onClick={() => setIsReplying(false)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Cancel
                  </button>
                </div>
                <CommentSection postId={post.id} isNested={false} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Comments section */}
        {showComments && !isPreview && (
          <div id="comments" className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <CommentSection postId={post.id} />
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full filter blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-50 -z-10"></div>
    </motion.div>
  );
} 