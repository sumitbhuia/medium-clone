import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import medium from '../../public/medium.png';
import { supabase } from "../supabaseClient";
import * as Icons from "../Icons";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Sign-out function
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
};

// Appbar Component
export function Appbar(): JSX.Element {
  const navigate = useNavigate();
  const { id: postId } = useParams(); // Extract postId from URL (e.g., /blog/:id)
  const [session, setSession] = useState<any>(null);
  const [name, setName] = useState<string>("User");
  const [canEdit, setCanEdit] = useState<boolean>(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.user_metadata?.name) {
        setName(session.user.user_metadata.name);
      }
    };

    fetchSession();

    // Set up a listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        if (newSession?.user?.user_metadata?.name) {
          setName(newSession.user.user_metadata.name);
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch edit permission when session and postId are available
  useEffect(() => {
    const checkEditPermission = async () => {
      if (!session?.user?.id || !postId || !session?.access_token) return;

      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/blog/can-edit-post?postId=${postId}&userId=${session.user.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`, // Add the Bearer token
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setCanEdit(data.isOwner || false);
        } else {
          console.error("Failed to check edit permission:", data.error);
          setCanEdit(false);
        }
      } catch (error) {
        console.error("Error checking edit permission:", error);
        setCanEdit(false);
      }
    };

    checkEditPermission();
  }, [session, postId]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="sticky top-0 z-50 flex justify-between items-center bg-white border-b border-gray-200 p-4 shadow-sm">
      {/* Logo */}
      <Link to="/blogs">
        <img
          className="h-9 sm:h-11 cursor-pointer transition-transform duration-200 hover:scale-105"
          alt="Medium Logo"
          src={medium}
        />
      </Link>

      <div className="flex items-center space-x-5">
        {/* Write Button */}
        <button
          onClick={() => navigate('/publish')}
          className="flex items-center text-sm font-semibold text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full px-4 py-2 transition duration-200 bg-gray-100 hover:bg-gray-200"
          aria-label="Write a new post"
        >
          <span className="mr-1.5">Write</span>
          <Icons.PlusIcon size={20} color="currentColor" />
        </button>

        {/* Edit Button (conditional) */}
        {postId && canEdit && (
          <button
            onClick={() => navigate(`/edit/${postId}`)}
            className="flex items-center text-sm font-semibold text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full px-4 py-2 transition duration-200 bg-gray-100 hover:bg-gray-200"
            aria-label="Edit this post"
          >
            <span className="mr-1.5">Edit</span>
            <Icons.PencilIcon size={20} color="currentColor" />
          </button>
        )}

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full transition duration-200 hover:scale-105"
          aria-label={`View profile of ${name}`}
        >
          <Avatar name={name} size={40} />
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="text-gray-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-2 transition duration-200"
          aria-label="Sign out"
        >
          <Icons.SignOutIcon size={22} color="currentColor" />
        </button>
      </div>
    </div>
  );
}