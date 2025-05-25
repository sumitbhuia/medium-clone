import { useNavigate, useParams } from "react-router-dom";
import { PublishBar } from "../component/PublishBar";
import Avatar from "../component/Avatar";
import { useEffect, useState } from "react";
import * as Spinners from "react-loader-spinner";
import Tiptap from "../component/Tiptap";
import { Editor } from '@tiptap/core';
import { supabase } from "../supabaseClient";

interface BlogProp {
  title: string;
  description: string;
  userId: string; // Changed to string to match Supabase UUID
  id: number;
  createdAt: string;
  User: {
    username: string;
  };
}

export function Edit(): JSX.Element {
  const [blog, setBlog] = useState<BlogProp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [userId, setUserId] = useState<string>("");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchSessionAndBlog = async () => {
      try {
        // Check if the user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate("/signin");
          return;
        }

        // Get user data from session
        const user = session.user;
        setUserId(user.id);

        // Fetch the blog post from the backend
        const response = await fetch(`${BASE_URL}/api/v1/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch blog post");
        }

        setBlog(result.data);
        setTitle(result.data.title);
      } catch (err: any) {
        setError(err.message || "Failed to load blog post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndBlog();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!editor) {
      setError("Editor is not initialized. Please try again.");
      return;
    }

    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }

    const description = editor.getHTML();
    if (!description || description === "<p></p>") {
      setError("Description cannot be empty.");
      return;
    }

    try {
      setError("");
      setIsUpdating(true);

      // Get the current user's session to retrieve the JWT
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
        return;
      }

      // Update the blog post via the backend
      const response = await fetch(`${BASE_URL}/api/v1/blog/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update blog post");
      }

      // Navigate to the updated blog post
      navigate(`/blog/${result.data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update blog post. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-screen">
        <Spinners.Oval
          visible={true}
          height={50}
          width={50}
          color="#000000"
          secondaryColor="#000000"
          strokeWidth={3}
          strokeWidthSecondary={4}
          ariaLabel="oval-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-screen w-screen text-xl font-semibold">
        {error || "Blog post not found"}
      </div>
    );
  }

  if (userId !== blog.userId) {
    return (
      <div className="flex justify-center items-center min-h-screen w-screen text-xl font-semibold">
        You are not authorized to edit this blog.
      </div>
    );
  }

  const name = blog.User.username || "?";

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-3 overscroll-contain">
      <PublishBar name={name} onPublish={handleSave} isPublishing={isUpdating} />
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {error && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 mr-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Error</span>
            <div>
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 w-full">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <textarea
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  setError("");
                  setTitle(e.target.value);
                }}
                className="w-full font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 lg:mt-8 mb-2 sm:mb-4 border-b border-gray-300 focus:outline-none focus:border-gray-500 resize-none"
                rows={2}
              />
              <div className="w-full min-h-[400px] max-h-[600px] overflow-auto">
                <Tiptap setEditor={setEditor} initialContent={blog.description || ""} />
              </div>
            </form>
          </div>
          <div className="lg:col-span-4 w-full">
            <div className="flex flex-col items-center lg:items-start p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar name={name} size={38} />
                <span className="font-medium text-lg">{name}</span>
              </div>
              <div className="text-center lg:text-left text-gray-500 text-sm sm:text-base">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}