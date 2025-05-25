import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import medium from '../../public/medium.png';
import { supabase } from "../supabaseClient";

// Sign-out function (already provided)
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
};

// Appbar Props
interface AppbarProps {
  name: string;
  blogOwnerId?: string;
  blogId?: number | string;
}

// Appbar Component
export function Appbar({ name, blogOwnerId, blogId }: AppbarProps): JSX.Element {
  const navigate = useNavigate();
  const currentUserId = (localStorage.getItem("userId"));
  console.log("cui",currentUserId)

  const userString = localStorage.getItem("user");
  console.log("ustring",userString)

let avatar_url = null; // Default to null if not found

if (userString) {
  try {
    // Parse the JSON string into an object
    const user = JSON.parse(userString);
    // Access the nested avatar_url field
    avatar_url = user || null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }
}

console.log("a",avatar_url);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-200 p-4">
      {/* Logo */}
      <Link to="/blogs">
        <img
          className="h-8 sm:h-10 cursor-pointer"
          alt="Medium Logo"
          src={medium}
        />
      </Link>

      <div className="flex items-center space-x-4">
        {/* Write Button */}
        <button
          onClick={() => navigate('/publish')}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full px-3 py-1.5 transition duration-150"
          aria-label="Write a new post"
        >
          <span className="mr-1">Write</span>
          <PlusIcon size={20} color="currentColor" />
        </button>

        {/* Edit Button (conditional) */}
        {blogOwnerId && blogId && currentUserId === blogOwnerId && (
          <button
            onClick={() => navigate(`/edit/${blogId}`)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full px-3 py-1.5 transition duration-150"
            aria-label="Edit this post"
          >
            <span className="mr-1">Edit</span>
            <PencilIcon size={20} color="currentColor" />
          </button>
        )}

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
          <SignOutIcon size={20} color="currentColor" />
        </button>
      </div>
    </div>
  );
}



// PlusIcon (unchanged)
export const PlusIcon = ({ size = 24, color = "black", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"></path>
  </svg>
);

// PencilIcon (unchanged)
export const PencilIcon = ({ size = 24, color = "black", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89H6.41421L15.7279 9.57627ZM17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785L17.1421 8.16206ZM7.24264 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L7.24264 20.89Z"></path>
  </svg>
);

// SignOutIcon (new)
export const SignOutIcon = ({ size = 24, color = "black", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M4 18H6V20H18V4H6V6H4V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V18ZM6 11H13V13H6V16L1 12L6 8V11Z"></path>
  </svg>
);