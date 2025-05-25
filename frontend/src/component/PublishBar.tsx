import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import * as Icons from "../Icons";
import mediumText from '../../public/mediumText.png';

import { supabase } from "../supabaseClient";

// Sign-out function (already provided)
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
};
interface PublishBarProps {
    name: string;
    onPublish: () => void;
    isPublishing?: boolean;
  }
  
  // PublishBar Component
  export function PublishBar({ name, onPublish, isPublishing }: PublishBarProps): JSX.Element {
    const navigate = useNavigate();
  
    const handleSignOut = async () => {
      await signOut();
      navigate("/signin");
    };
  
    return (
      <div className="flex justify-between items-center bg-white  p-4">
        {/* Logo */}
        <Link to="/blogs">
          <img
            className="h-6 sm:h-7 cursor-pointer"
            alt="Medium Logo"
            src={mediumText}
          />
        </Link>
  
        <div className="flex items-center space-x-4">
          {/* Publish Button */}
          <button
            onClick={onPublish}
            className="bg-green-500 text-white text-sm font-medium rounded-full px-4 py-1.5 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Publish post"
            disabled={isPublishing}
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Publishing...
              </span>
            ) : (
              "Publish"
            )}
          </button>
  
          {/* Options Icon */}
          <button
            className="text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1.5 transition duration-150"
            aria-label="Options"
          >
            <Icons.Options size={20} color="currentColor" />
          </button>
  
          {/* Bell Icon */}
          <button
            className="text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1.5 transition duration-150"
            aria-label="Notifications"
          >
            <Icons.Bell size={20} color="currentColor" />
          </button>
  
          {/* Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
            aria-label={`View profile of ${name}`}
          >
            <Avatar name={name} size={38} />
          </button>
  
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1.5 transition duration-150"
            aria-label="Sign out"
          >
            <Icons.SignOutIcon size={20} color="currentColor" />
          </button>
        </div>
      </div>
    );
  }
