import { Post } from "../types";
import { BlogCard } from "./BlogCard";

export const PostsList: React.FC<{
  posts: Post[];
  isLoading?: boolean;
}> = ({ posts,isLoading }) => {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500 font-sans text-lg">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          showAuthorInfo={false}
          showEngagementStats={true}
        />
      ))}
    </div>
  );
};