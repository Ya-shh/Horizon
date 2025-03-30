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
  liked: boolean;
  likeCount: number;
  replyCount: number;
};

type CommentSectionProps = {
  postId: string;
  parentId?: string;
  isNested?: boolean;
};

export default function CommentSection({ 
  postId, 
  parentId, 
  isNested = false 
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nestedComments, setNestedComments] = useState<Record<string, boolean>>({});
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  useEffect(() => {
    fetchComments();
  }, [postId, parentId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const endpoint = `/api/posts/${postId}/comments${parentId ? `?parentId=${parentId}` : ''}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch comments");
      }
      const data = await response.json();
      
      // Add default values for liked and counts if they don't exist
      const commentsWithDefaults = (data.comments || []).map((comment: any) => ({
        ...comment,
        liked: comment.liked || false,
        likeCount: comment._count?.votes || 0,
        replyCount: comment._count?.children || 0
      }));
      
      setComments(commentsWithDefaults);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError(error instanceof Error ? error.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, replyParentId: string | null = null) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/sign-in');
      return;
    }
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          parentId: replyParentId || parentId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      // Clear input
      setNewComment('');
      
      // Reset replying state
      setReplyingTo(null);
      
      // Refresh comments
      fetchComments();
      
      // Refresh page
      router.refresh();
      
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleNestedComments = (commentId: string) => {
    setNestedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    setSubmitting(true);
    
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
      
      // Reset editing state
      setEditingComment(null);
      
      // Refresh comments
      fetchComments();
      
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment');
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
      
      // Remove from local state
      setComments(comments.filter(comment => comment.id !== commentId));
      
      // Refresh page
      router.refresh();
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    setActionMenuOpen(null);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!session) {
      router.push('/sign-in');
      return;
    }
    
    // Store the original comments state to revert in case of error
    const originalComments = [...comments];
    
    try {
      // Update UI optimistically
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          const isCurrentlyLiked = comment.liked;
          return {
            ...comment,
            liked: !isCurrentlyLiked,
            likeCount: isCurrentlyLiked ? Math.max(0, comment.likeCount - 1) : comment.likeCount + 1
          };
        }
        return comment;
      }));
      
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to like comment';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the response text or fallback message
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      
      // Update the UI again with the actual server response including the like count
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: responseData.liked,
            likeCount: responseData.likeCount
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert the optimistic update
      setComments(originalComments);
      setError(error instanceof Error ? error.message : 'Failed to like comment');
      
      // Auto-clear error after 3 seconds
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleCopyLink = (commentId: string) => {
    try {
      const url = `${window.location.origin}/posts/${postId}#comment-${commentId}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
          .then(() => {
            setCopySuccess("Link copied to clipboard!");
            setTimeout(() => setCopySuccess(null), 2000);
          })
          .catch(err => {
            console.error("Could not copy text: ", err);
            // Fallback
            promptToCopy(url);
          });
      } else {
        // Fallback for browsers without clipboard API
        promptToCopy(url);
      }
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  // Fallback copy method
  const promptToCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess("Link copied to clipboard!");
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        setCopySuccess("Please copy manually: " + text);
        setTimeout(() => setCopySuccess(null), 5000);
      }
    } catch (err) {
      console.error("Fallback copying failed:", err);
      setCopySuccess("Please copy manually: " + text);
      setTimeout(() => setCopySuccess(null), 5000);
    }
    
    document.body.removeChild(textarea);
  };

  if (isLoading && !isNested) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="pl-10 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isNested ? 'mt-4 pl-6 ml-4 border-l-2 border-indigo-200/50 dark:border-indigo-800/50' : 'p-6'} relative`}>
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
        <div className="space-y-6">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              id={`comment-${comment.id}`}
              className="relative group"
            >
              <div className="transition-all duration-200 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 rounded-xl p-4">
                <div className="flex items-start space-x-3">
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
                      
                      {session?.user?.id === comment.user.id && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                          Author
                        </span>
                      )}
                    </div>
                    
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
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          comment.liked
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        <FiHeart className={`${comment.liked ? 'fill-red-500 dark:fill-red-400' : ''} h-4 w-4`} />
                        <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <FiCornerDownRight className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                      
                      {comment.replyCount > 0 && (
                        <button
                          onClick={() => toggleNestedComments(comment.id)}
                          className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FiMessageCircle className="h-4 w-4" />
                          <span>
                            {nestedComments[comment.id] ? 'Hide' : 'Show'} {comment.replyCount} 
                            {comment.replyCount === 1 ? ' reply' : ' replies'}
                          </span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleCopyLink(comment.id)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <FiShare2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </button>
                      
                      {session?.user?.id === comment.user.id && (
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
              
              {nestedComments[comment.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CommentSection 
                    postId={postId} 
                    parentId={comment.id} 
                    isNested={true} 
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toast notification with AnimatePresence */}
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            key="copy-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {copySuccess}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 