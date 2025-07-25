import { useNavigate, useParams } from "react-router-dom";
import { Header, HeaderPresets } from "../component/Header";
import { UserAvatar } from "../component/Avatar";
import { useEffect, useState } from "react";
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { ThemeSpinner } from "../component/Spinner";
import { Post } from "../types";
import { api } from "../api";

export const Blog = () => {
  const [blog, setBlog] = useState<Post | null>(null);
  const [bio, setBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionAndBlog = async () => {
      try {
        if (!id) {
          setError("Invalid blog id");
          setIsLoading(false);
          return;
        }

        const result = await api.getPostById(Number(id));
        setBio(result.author.bio || "");
        setBlog(result);

      } catch (err: any) {
        setError(err.message || "Failed to load blog post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndBlog();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <ThemeSpinner />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-600 text-sm">{error || "Blog post not found"}</p>
        </div>
      </div>
    );
  }

  const cleanHtml = DOMPurify.sanitize(blog.description || "");
  const description = parse(cleanHtml);

  const name = blog.author.username || "?";
  const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(blog.createdAt);
  const month = date.getMonth();
  const monthString = month_names_short[month];
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
      <Header
        {...HeaderPresets.blog()}
        shadow={false}
        border={false}
      />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Published {monthString} {day}, {year}
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 mb-8 leading-tight tracking-tight">
            {blog.title}
          </h1>

          {/* Author Card */}
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-6 py-4 shadow-sm">
            <UserAvatar
              user={{
                name: blog.author.username,
                avatarUrl: blog.author.avatar
              }}
              size={48}
            />
            <div className="text-left">
              <div className="font-semibold text-slate-900 text-lg">{name}</div>
              <div className="text-slate-600 text-sm max-w-xs truncate">{bio}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
        <article className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-sm p-8 sm:p-12">
          <div className="prose prose-lg prose-slate max-w-none">
            <div className="description text-slate-700 leading-relaxed">
              {description}
            </div>
          </div>
        </article>

        {/* Author Bio Section */}
        <div className="mt-16 pt-12 border-t border-slate-200/60">
          <div className="flex items-start gap-6">

            <button
              onClick={() => navigate('/profile')}
              className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full transition duration-200 hover:scale-105"
              aria-label={`View profile of ${name}`}
            >
              <UserAvatar
                user={{
                  name: name,
                  avatarUrl: blog.author.avatar
                }}
                size={80}
              />
            </button>


            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">About {name}</h3>
              <p className="text-slate-600 leading-relaxed">
                {bio || "This author hasn't written a bio yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Comment Section */}
      {/* <CommentSection 
        postId={blog.id}
        currentUser={blog.author}
      /> */}
    </div>
    // </div>
  );
};