import { useEffect, useState } from "react";
import { Header, HeaderPresets } from "../component/Header";
import { BlogCard } from "../component/BlogCard";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

import { Post } from "../types"
import { ThemeSpinner } from "../component/Spinner";

export const Blogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleClap = async (postId: string) => {
    try {
      await api.toggleClap(postId);
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
            ...post,
            isClapped: !post.isClapped,
            clapCount: post.clapCount + (post.isClapped ? -1 : 1)
          }
          : post
      ));
    } catch (err) {
      console.error('Failed to clap post:', err);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await api.toggleBookmark(postId);
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
            ...post,
            isBookmarked: !post.isBookmarked,
            bookmarkCount: post.bookmarkCount + (post.isBookmarked ? -1 : 1)
          }
          : post
      ));
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  const handleShare = async (postId: string) => { // Removed async as clipboard API can be sync in some contexts
    const url = `${window.location.origin}/post/${postId}`; // Assuming post routes
    navigator.clipboard.writeText(url)
      .then(() => console.log('URL copied to clipboard'))
      .catch(err => console.error('Failed to copy URL:', err));
  };




  useEffect(() => {
    const fetchSessionAndPosts = async () => {
      try {

        const result = await api.getAllPost();

        const formattedPosts: Post[] = result.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
          userId: post.userId,
          author: {
            username: post.author?.username || "Unknown",
            displayName: post.author?.displayName || "Unknown",
            avatar: post.author?.avatar || "",
            bio: post.author?.bio || "",
          },
          readTime: post.readTime ?? 0,
          clapCount: post.clapCount ?? 0,
          responseCount: post.responseCount ?? 0,
          bookmarkCount: post.bookmarkCount ?? 0,
          isClapped: post.isClapped ?? false,
          isBookmarked: post.isBookmarked ?? false,
          tags: post.tags ?? [],
          imageUrl: post.imageUrl ?? "",
        }));

        setPosts(formattedPosts);
      } catch (err: any) {
        setError(err.message || "Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndPosts();
  }, [navigate]);

  if (loading) {
    return (
      <ThemeSpinner />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        {...HeaderPresets.blog()}
        shadow={false}
        border={false} />

      <div className="flex-grow p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div>


          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              showEngagementStats={true}
              onClap={() => handleClap(post.id)}
              onBookmark={() => handleBookmark(post.id)}
              onShare={() => handleShare(post.id)}
            />


          ))}
        </div>
      </div>
    </div>
  );
};