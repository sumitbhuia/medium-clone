import React, { useState, useEffect } from 'react';
import { UserAvatar } from './Avatar'; // Adjust import path as needed
import { api } from '../api'; // Adjust import path as needed
import {Comment,CommentSectionProps,CreateCommentPayload } from '../types';





export const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (isExpanded) {
      fetchComments();
    }
  }, [isExpanded, postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result =  await api.getPostComments(postId);
        console.log(result)
      setComments(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    const content = parentId ? editContent : newComment;
    
    if (!content.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: CreateCommentPayload = {
        content: content.trim(),
        ...(parentId && { parentId })
      };
      const result = await api.addComment(postId,payload);
      console.log(result)
      const newCommentData: Comment = {
        ...result,
        user: {
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          bio:""
        }
      };

      if (parentId) {
        // Handle reply - you might want to refresh the parent comment's replies
        fetchComments();
      } else {
        // Add new top-level comment
        setComments(prev => [newCommentData, ...prev]);
      }

      setNewComment('');
      setEditContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch(`/api/v1/stats/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const result = await response.json();
      
      // Update the comment in the local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: result.data.content, updatedAt: result.data.updatedAt }
          : comment
      ));

      setEditingCommentId(null);
      setEditContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/v1/stats/comment/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove the comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 mt-16">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Comments ({comments.length})
              </h3>
            </div>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Expandable Content */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Comment Input */}
            {currentUser && (
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    user={currentUser}
                    size={40}
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-slate-500">
                        {newComment.length}/500
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNewComment('')}
                          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newComment.trim() || isSubmitting}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? 'Posting...' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading comments...</p>
              </div>
            )}

            {/* Comments List */}
            {!isLoading && (
              <div className="space-y-6">
                {displayedComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-4">
                    <UserAvatar
                      user={comment.user}
                      size={40}
                    />
                    <div className="flex-1">
                      <div className="bg-slate-50/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {comment.user.displayName}
                            </span>
                            <span className="text-slate-500 text-xs">
                              @{comment.user.username}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {formatTimeAgo(comment.createdAt)}
                              {comment.updatedAt !== comment.createdAt && (
                                <span className="ml-1">(edited)</span>
                              )}
                            </span>
                          </div>
                          
                          {/* Edit/Delete buttons for own comments */}
                          {currentUser && currentUser.username === comment.user.username && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(comment)}
                                className="text-slate-500 hover:text-blue-600 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-slate-500 hover:text-red-600 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditComment(comment.id, editContent)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 text-slate-600 text-xs hover:text-slate-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        )}
                      </div>
                      
                      {/* Replies count */}
                      {comment.repliesCount > 0 && (
                        <div className="mt-2 ml-4">
                          <button className="text-slate-500 text-xs hover:text-slate-700">
                            {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show More Comments Button */}
            {comments.length > 3 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="w-full py-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium border-t border-slate-200/40 transition-colors"
              >
                Show all {comments.length} comments
              </button>
            )}

            {/* Show Less Comments Button */}
            {showAllComments && comments.length > 3 && (
              <button
                onClick={() => setShowAllComments(false)}
                className="w-full py-3 text-center text-sm text-slate-600 hover:text-slate-700 font-medium border-t border-slate-200/40 transition-colors"
              >
                Show fewer comments
              </button>
            )}
          </div>
        </div>

        {/* Preview when collapsed */}
        {!isExpanded && comments.length > 0 && (
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 bg-slate-50/30 rounded-xl">
                  <UserAvatar
                    user={comment.user}
                    size={32}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-sm">
                        {comment.user.displayName}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm line-clamp-2 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {comments.length > 3 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {comments.length} comments
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};