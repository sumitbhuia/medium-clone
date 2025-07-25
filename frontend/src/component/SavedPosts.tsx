import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { api } from '../api';
import { PostsList } from './Postlist'; // Assuming PostsList is in the same directory

export const SavedPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getUserBookmarks();
        
        // The backend formats the response differently, so we map it to our frontend Post type
        const formattedPosts = response.data.map((item: any) => ({
          id: parseInt(item.id, 10),
          title: item.title,
          description: item.description,
          createdAt: item.createdAt,
          readTime: item.readTime,
          imageUrl: item.imageUrl,
          author: {
            username: item.User.username,
            displayName: item.User.displayName,
            avatar: item.User.avatar,
          },
          clapCount: item.clapCount,
          responseCount: item.responseCount,
          tags: item.tags,
          isBookmarked: true, // All posts here are bookmarked
          isClapped: false, // This info isn't available from the bookmarks endpoint, default to false
          bookmarkCount: 0, // Not available, default to 0
        }));

        setPosts(formattedPosts);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved posts.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 text-red-700 rounded-xl shadow-sm">
        <h3 className="text-lg font-medium">Could not load posts</h3>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No saved posts</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't saved any posts yet.</p>
      </div>
    );
  }

  return <PostsList posts={posts} isLoading={isLoading} />;
};
