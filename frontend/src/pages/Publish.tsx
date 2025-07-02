import { useNavigate } from "react-router-dom";
import { Header, HeaderPresets } from "../component/Header";
import Tiptap from "../component/Tiptap";
import { Editor } from '@tiptap/core';
import { useState } from 'react';

import { api } from "../api";

export function Publish(): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [username, setUsername] = useState<string>("!");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();




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
      setError(""); // Clear previous errors
      setIsUpdating(true);

      const result = await api.createPost(title, description);
      setUsername(result.author.username);
      navigate(`/blog/${result.id}`);

    } catch (err: any) {
      setError(err.message || "Failed to publish post. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="publish-container flex flex-col min-h-screen bg-white">
      <div className="border-b py-1 px-4 sm:py-2 sm:px-4 md:py-3 md:px-6 lg:py-4 lg:px-8">
        {/* <PublishBar name={username} onPublish={handleSave} isPublishing={isUpdating}   showNotifications = {true} showOptions = {true}/> */}
        <Header
          {...HeaderPresets.publish({
            userName: username,
            onPublish: handleSave,
            isPublishing: isUpdating,
            showNotifications: true,
            showOptions: true
          })}
        />

      </div>
      <div className="content-area pt-10 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto w-full">
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
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Error</span>
            <div>
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}
        <textarea
          placeholder="Title"
          className="w-full text-3xl sm:text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none resize-none mb-6"
          rows={2}
          onChange={(e) => {
            setError("");
            setTitle(e.target.value);
          }}
        />
        <Tiptap setEditor={setEditor} />
      </div>
    </div>
  );
}