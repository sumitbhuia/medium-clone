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

  useEffect(() => {
    const fetchSessionAndPosts = async () => {
      try {

        const result = await api.getAllPost();

        const formattedPosts: Post[] = result.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
          readTime: post.readTime ?? 0,
          clapCount: post._count.claps ?? 0,
          responseCount: post._count.comments ?? 0,
          bookmarkCount: post._count.bookmarks ?? 0,
          // #TODO : Work on logic if current user clap this post
          isClapped: post.isClapped ?? false,
          isBookmarked: post.isBookmarked ?? false,
          tags: post.tags.map((pt:any) => pt.tag.name),
          imageUrl: post.imageUrl ?? "",
          author: {
            username: post.author?.username || "user",
            displayName: post.author?.displayName || "user",
            avatar: post.author?.avatar || "",
            bio: post.author?.bio || "", // Used in blog page
          },
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};