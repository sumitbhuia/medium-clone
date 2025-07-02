import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Tiptap from "../component/Tiptap";
import { Editor } from '@tiptap/core';
import { Post } from "../types"
import { api } from "../api";
import { ThemeSpinner } from "../component/Spinner";
import { Header, HeaderPresets } from "../component/Header";

export function Edit(): JSX.Element {
  const [blog, setBlog] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);


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
        const result = await api.getPostById(id);

        setBlog(result);
        setTitle(result.title);

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

      if (!id) {
        setError("Invalid blog id");
        setIsLoading(false);
        return;
      }

      const result = await api.editPostById(id, title, description)

      // Navigate to the updated blog post
      navigate(`/blog/${result.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update blog post. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || isUpdating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <ThemeSpinner />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-400 text-sm">
            {error || "The requested post could not be found."}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-3 overscroll-contain">
      <Header
        {...HeaderPresets.publish({
          onPublish: handleSave,
          isPublishing: isUpdating,
          showNotifications: true,
          showOptions: true
        })} />

      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
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
        </div>
      </div>
    </div>
  );
}