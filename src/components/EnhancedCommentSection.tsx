"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  FiSend, 
  FiMessageCircle, 
  FiCornerDownRight, 
  FiLoader,
  FiHeart,
  FiFlag,
  FiMoreHorizontal,
  FiEdit,
  FiTrash2,
  FiShare2
} from "react-icons/fi";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  _count: {
    votes: number;
    children: number;
  };
  votes: Array<{
    id: string;
    userId: string;
    value: number;
  }>;
};

type EnhancedCommentSectionProps = {
  postId: string;
  parentId?: string;
  isNested?: boolean;
};

export default function EnhancedCommentSection({ 
  postId, 
  parentId, 
  isNested = false 
}: EnhancedCommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nestedComments, setNestedComments] = useState<Record<string, boolean>>({});
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Animation variants
  const commentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    fetchComments();
    
    // Handle clicks outside of action menu
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [postId, parentId]);
  
  useEffect(() => {
    // Auto-focus and auto-resize textarea when editing
    if (editingComment && textareaRef.current) {
      textareaRef.current.focus();
      autoResizeTextarea();
    }
  }, [editingComment]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const endpoint = `/api/posts/${postId}/comments${parentId ? `?parentId=${parentId}` : ''}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, commentId?: string) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/sign-in');
      return;
    }
    
    const content = newComment.trim();
    if (!content) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parentId: commentId || parentId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      // Clear input and reply state
      setNewComment('');
      setReplyingTo(null);
      
      // Refresh comments
      fetchComments();
      
      // Refresh page to update counts
      router.refresh();
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      
      // Update the comment in the local state
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: editContent } 
            : comment
        )
      );
      
      // Reset edit state
      setEditingComment(null);
      setEditContent("");
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Remove comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Refresh page to update counts
      router.refresh();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const toggleNestedComments = (commentId: string) => {
    setNestedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };
  
  const handleLikeComment = async (commentId: string) => {
    if (!session) {
      router.push('/sign-in');
      return;
    }
    
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 1,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to like comment');
      }
      
      // Update local state optimistically
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === commentId) {
            // Check if user already voted
            const existingVote = comment.votes.find(
              vote => session?.user?.id && vote.userId === session.user.id
            );
            
            if (existingVote) {
              // Toggle vote off if already upvoted
              if (existingVote.value > 0) {
                return {
                  ...comment,
                  votes: comment.votes.filter(vote => vote.id !== existingVote.id),
                  _count: {
                    ...comment._count,
                    votes: comment._count.votes - 1
                  }
                };
              }
              // Change downvote to upvote
              return {
                ...comment,
                votes: comment.votes.map(vote => 
                  vote.id === existingVote.id ? { ...vote, value: 1 } : vote
                )
              };
            }
            
            // Add new upvote
            const newVote = {
              id: `temp-${Date.now()}`,
              userId: session?.user?.id || '',
              value: 1
            };
            
            return {
              ...comment,
              votes: [...comment.votes, newVote],
              _count: {
                ...comment._count,
                votes: comment._count.votes + 1
              }
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Error liking comment:', err);
      setError('Failed to like comment. Please try again.');
    }
  };
  
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  // Start replying to a comment
  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setNewComment('');
    
    // Close any open action menus
    setActionMenuOpen(null);
  };
  
  // Start editing a comment
  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    setActionMenuOpen(null);
  };

  if (isLoading && !isNested) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="pl-10 space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isNested ? 'mt-4 pl-6 ml-4 border-l-2 border-indigo-200/50 dark:border-indigo-800/50' : 'p-6'}`}>
      {!isNested && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
            <FiMessageCircle className="mr-2 text-indigo-600 dark:text-indigo-400" />
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>
          {comments.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Join the conversation and share your thoughts
            </p>
          )}
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center"
        >
          <FiFlag className="mr-2" />
          {error}
        </motion.div>
      )}

      {/* Comment form - only shown at top-level or when replying */}
      {(!isNested || replyingTo === null) && (
        <form onSubmit={(e) => handleSubmitComment(e)} className="mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 object-cover"
                />
              ) : (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "?"}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-600/50 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onInput={autoResizeTextarea}
                  ref={textareaRef}
                  placeholder={session ? "Write a comment..." : "Sign in to comment"}
                  className="w-full p-4 border-none resize-none focus:ring-0 bg-transparent text-gray-700 dark:text-gray-200"
                  rows={3}
                  disabled={!session || submitting}
                ></textarea>
                
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/80 px-4 py-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {!session ? (
                      <Link href="/sign-in" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign in
                      </Link>
                    ) : (
                      "Use @ to mention users"
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!session || submitting || !newComment.trim()}
                    className="py-2 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-full p-3 inline-block mb-4">
            <FiMessageCircle className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
            {isNested ? 'No replies yet' : 'Start the conversation'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isNested 
              ? 'Be the first to reply to this comment' 
              : 'No comments on this post yet. Share your thoughts and start a discussion!'}
          </p>
        </div>
      ) : (
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {comments.map((comment) => {
            // Calculate vote score
            const voteScore = comment.votes && Array.isArray(comment.votes)
              ? comment.votes.reduce((acc, vote) => acc + vote.value, 0)
              : 0;
            
            // Find user's vote if it exists
            const userVote = session && comment.votes && Array.isArray(comment.votes)
              ? comment.votes.find(vote => vote.userId === session.user.id) 
              : null;
              
            // Check if user is the author of this comment
            const isAuthor = session?.user?.id === comment.user.id;
            
            return (
              <motion.div 
                key={comment.id} 
                id={`comment-${comment.id}`}
                className="relative group rounded-xl"
                variants={commentVariants}
                layout
              >
                {/* Comment card with subtle hover effect */}
                <div className="transition-all duration-200 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    {/* User avatar */}
                    <Link 
                      href={`/users/${comment.user.username}`}
                      className="flex-shrink-0"
                    >
                      {comment.user.image ? (
                        <img 
                          src={comment.user.image} 
                          alt={comment.user.name || comment.user.username}
                          className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                          <span className="text-white text-sm font-medium">
                            {(comment.user.name || comment.user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                    
                    {/* Comment content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link 
                          href={`/users/${comment.user.username}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {comment.user.name || comment.user.username}
                        </Link>
                        
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        
                        {isAuthor && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                            Author
                          </span>
                        )}
                      </div>
                      
                      {/* If editing this comment */}
                      {editingComment === comment.id ? (
                        <div className="mt-2 mb-3">
                          <textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onInput={autoResizeTextarea}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                            rows={3}
                            disabled={submitting}
                          ></textarea>
                          
                          <div className="flex items-center justify-end space-x-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setEditingComment(null)}
                              className="py-1.5 px-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditComment(comment.id)}
                              disabled={submitting || !editContent.trim()}
                              className="py-1.5 px-3 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm disabled:opacity-50"
                            >
                              {submitting ? 'Saving...' : 'Save changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {comment.content}
                        </div>
                      )}
                      
                      {/* Comment actions */}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        {/* Like button */}
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            userVote && userVote.value > 0
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                        >
                          <FiHeart className={`${userVote && userVote.value > 0 ? 'fill-red-500 dark:fill-red-400' : ''} h-4 w-4`} />
                          <span>{voteScore > 0 ? voteScore : ''}</span>
                        </button>
                        
                        {/* Reply button */}
                        <button
                          onClick={() => startReply(comment.id)}
                          className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FiCornerDownRight className="h-4 w-4" />
                          <span>Reply</span>
                        </button>
                        
                        {/* View replies or reply count */}
                        {comment._count.children > 0 && (
                          <button
                            onClick={() => toggleNestedComments(comment.id)}
                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <FiMessageCircle className="h-4 w-4" />
                            <span>
                              {nestedComments[comment.id] ? 'Hide' : 'Show'} {comment._count.children} 
                              {comment._count.children === 1 ? ' reply' : ' replies'}
                            </span>
                          </button>
                        )}
                        
                        {/* Share button */}
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/posts/${postId}#comment-${comment.id}`;
                            navigator.clipboard.writeText(url);
                            alert("Link copied to clipboard!");
                          }}
                          className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FiShare2 className="h-4 w-4" />
                          <span className="sr-only">Share</span>
                        </button>
                        
                        {/* More actions - only for author or admins */}
                        {isAuthor && (
                          <div className="relative ml-auto" ref={menuRef}>
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === comment.id ? null : comment.id)}
                              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                              aria-label="More actions"
                            >
                              <FiMoreHorizontal className="h-4 w-4" />
                            </button>
                            
                            <AnimatePresence>
                              {actionMenuOpen === comment.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute right-0 mt-1 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
                                >
                                  <button
                                    onClick={() => startEdit(comment)}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                  >
                                    <FiEdit className="mr-2 h-4 w-4" />
                                    Edit
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <FiTrash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reply form when replying to this comment */}
                <AnimatePresence>
                  {replyingTo === comment.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 ml-12 overflow-hidden"
                    >
                      <form onSubmit={(e) => handleSubmitComment(e, comment.id)}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? (
                              <img
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                className="w-8 h-8 object-cover"
                              />
                            ) : (
                              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "?"}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                              rows={2}
                              disabled={!session || submitting}
                            ></textarea>
                            
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="py-1.5 px-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={!session || submitting || !newComment.trim()}
                                className="py-1.5 px-3 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {submitting ? (
                                  <>
                                    <FiLoader className="animate-spin mr-2" />
                                    Posting...
                                  </>
                                ) : (
                                  <>
                                    <FiSend className="mr-2" />
                                    Reply
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Nested comments */}
                <AnimatePresence>
                  {nestedComments[comment.id] && comment._count.children > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EnhancedCommentSection 
                        postId={postId} 
                        parentId={comment.id} 
                        isNested={true} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
} 