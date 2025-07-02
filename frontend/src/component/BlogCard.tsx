import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import Avatar from "./Avatar";
import parser from "html-react-parser";
import { Post, BlogProps } from "../types";
import { api } from "../api";

export function BlogCard({
  post,
  showAuthorInfo = true,
  showEngagementStats = true,
  onClap,
  onBookmark,
  onShare,
}: BlogProps): JSX.Element {
  const [clapCount, setClapCount] = useState(post.clapCount || 0);
  const [isClapped, setIsClapped] = useState(post.isClapped || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isLoading, setIsLoading] = useState({ clap: false, bookmark: false });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const extractFirstTag = () => {
    if (post.tags && post.tags.length > 0) {
      return post.tags[0];
    }
    const title = post.title.toLowerCase();
    if (title.includes("web") || title.includes("javascript") || title.includes("react"))
      return "Web Development";
    if (title.includes("design") || title.includes("ui") || title.includes("ux"))
      return "Design";
    if (title.includes("tech") || title.includes("code") || title.includes("programming"))
      return "Technology";
    return "Article";
  };

  const parsedDescription = parser(post.description);
  const imageUrl = post.imageUrl || "https://picsum.photos/150/150";

  const handleEngagementClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  // const handleClapClick = async () => {
  //   if (isLoading.clap) return;
  //   setIsLoading((prev) => ({ ...prev, clap: true }));
  //   try {
  //     if (onClap) {
  //       await onClap(post.id);
  //     } else {
  //       await api.toggleClap(post.id);
  //       const updatedPost = await api.getPostById(post.id);
  //       setIsClapped(updatedPost.isClapped);
  //       setClapCount(updatedPost.clapCount);
  //     }
  //   } catch (error) {
  //     console.error("Error toggling clap:", error);
  //   } finally {
  //     setIsLoading((prev) => ({ ...prev, clap: false }));
  //   }
  // };

  const handleClapClick = async () => {
    if (isLoading.clap) return;
    setIsLoading((prev) => ({ ...prev, clap: true }));
    try {
      if (onClap) {
        await onClap(post.id);
        // Add immediate state update for better UX
        setIsClapped(!isClapped);
        setClapCount(prev => isClapped ? prev - 1 : prev + 1);
      } else {
        await api.toggleClap(post.id);
        const updatedPost = await api.getPostById(post.id);
        setIsClapped(updatedPost.isClapped);
        setClapCount(updatedPost.clapCount);
      }
    } catch (error) {
      console.error("Error toggling clap:", error);
      // Revert optimistic update on error
      if (onClap) {
        setIsClapped(isClapped);
        setClapCount(prev => isClapped ? prev + 1 : prev - 1);
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, clap: false }));
    }
  };

  // const handleBookmarkClick = async () => {
  //   if (isLoading.bookmark) return;
  //   setIsLoading((prev) => ({ ...prev, bookmark: true }));
  //   try {
  //     if (onBookmark) {
  //       await onBookmark(post.id);
  //     } else {
  //       await api.toggleBookmark(post.id);
  //       const updatedPost = await api.getPostById(post.id);
  //       setIsBookmarked(updatedPost.isBookmarked);
  //     }
  //   } catch (error) {
  //     console.error("Error toggling bookmark:", error);
  //   } finally {
  //     setIsLoading((prev) => ({ ...prev, bookmark: false }));
  //   }
  // };

  const handleBookmarkClick = async () => {
    if (isLoading.bookmark) return;
    setIsLoading((prev) => ({ ...prev, bookmark: true }));
    try {
      if (onBookmark) {
        await onBookmark(post.id);
        // Add immediate state update for better UX
        setIsBookmarked(!isBookmarked);
      } else {
        await api.toggleBookmark(post.id);
        const updatedPost = await api.getPostById(post.id);
        setIsBookmarked(updatedPost.isBookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      // Revert optimistic update on error
      if (onBookmark) {
        setIsBookmarked(isBookmarked);
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, bookmark: false }));
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(post.id);
    } else {
      const url = `${window.location.origin}/blog/${post.id}`;
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.description.replace(/<[^>]+>/g, "").substring(0, 100) + "...",
          url,
        });
      } else {
        navigator.clipboard.writeText(url);
      }
    }
  };

  return (
    <Link to={`/blog/${post.id}`}>
      <article className="group cursor-pointer py-6 hover:bg-gray-50 transition-all duration-200 rounded-md">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {showAuthorInfo && (
              <div className="flex items-center gap-2 mb-3">
                <Avatar
                  name={post.author.displayName || post.author.username}
                  avatarUrl={post.author.avatar}
                  size={20}
                />
                <span className="text-sm text-gray-600 font-sans">
                  {post.author.displayName || post.author.username}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-sm text-gray-500 font-sans">{formatDate(post.createdAt)}</span>
              </div>
            )}
            <h2 className="text-xl font-sans font-medium text-gray-900 mb-2 group-hover:text-green-500 transition-colors line-clamp-2 leading-tight tracking-wide">
              {post.title}
            </h2>
            <div className="text-gray-600 font-sans text-base mb-4 line-clamp-2 leading-relaxed">
              {React.isValidElement(parsedDescription) ? (
                parsedDescription
              ) : (
                post.description.replace(/<[^>]+>/g, "").substring(0, 120) + "..."
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs text-gray-600 font-sans transition-colors">
                  {extractFirstTag()}
                </span>
                <span className="text-xs text-gray-500 font-sans">{post.readTime} min read</span>
              </div>
              {showEngagementStats && (
                <div className="flex items-center gap-3 text-gray-500">

                  <button
                    onClick={(e) => handleEngagementClick(e, handleClapClick)}
                    className={`flex items-center gap-1 hover:text-green-500 transition-colors ${isClapped ? "text-green-500" : "text-gray-500"
                      } ${isLoading.clap ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Clap for this article"
                    disabled={isLoading.clap}
                  >
                    <Heart className={`h-4 w-4 ${isClapped ? "fill-green-500 text-green-500" : ""}`} />
                    {/* <span className="text-xs font-sans">{clapCount > 0 ? clapCount : ""}</span> */}
                    <span className="text-xs font-sans">{clapCount > 0 ? clapCount : ""}</span>
                  </button>


                  <Link to={`/blog/${post.id}#comments`} onClick={(e) => e.stopPropagation()}>
                    <button className="flex items-center gap-1 hover:text-green-500 transition-colors" title="Responses">
                      <MessageCircle className="h-4 w-4" />
                      {(post.responseCount || 0) > 0 && 
                      <span className="text-xs font-sans">{(post.responseCount || 0) > 0 ? post.responseCount : ""}</span>
                      }
                    </button>
                  </Link>
                  <button
                    onClick={(e) => handleEngagementClick(e, handleBookmarkClick)}
                    className={`hover:text-green-500 transition-colors ${isBookmarked ? "text-green-500" : "text-gray-500"
                      } ${isLoading.bookmark ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Save article"
                    disabled={isLoading.bookmark}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-green-500 text-green-500" : ""}`} />
                  </button>

                  <button
                    onClick={(e) => handleEngagementClick(e, handleShareClick)}
                    className="hover:text-green-500 transition-colors"
                    title="Share article"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover rounded group-hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

export function SimpleBlogCard({ post }: { post: Post }): JSX.Element {
  return <BlogCard post={post} showEngagementStats={false} showAuthorInfo={true} />;
}

export function CompactBlogCard({ post }: { post: Post }): JSX.Element {
  return (
    <Link to={`/blog/${post.id}`}>
      <div className="group cursor-pointer py-3 hover:bg-gray-50 transition-colors rounded-md">
        <h3 className="text-sm font-sans font-medium text-gray-900 group-hover:text-green-500 line-clamp-2 mb-1 tracking-wide">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-sans">
          <span>{post.author.username}</span>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>
      </div>
    </Link>
  );
}