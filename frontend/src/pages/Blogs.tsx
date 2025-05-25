import { useEffect, useState } from "react";
import * as Spinners from "react-loader-spinner";
import { Appbar } from "../component/Appbar";
import { BlogCard } from "../component/BlogCard";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface BlogProps {
  username: string;
  createdAt: string;
  title: string;
  description: string;
  id: number;
  userId: string; // Added userId to match backend response
  User: {
    username: string;
  };
}

export const Blogs = () => {
  const [posts, setPosts] = useState<BlogProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [username, setUsername] = useState<string>("!");
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchSessionAndPosts = async () => {
      try {
        // Check if the user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate("/signup");
          return;
        }

        // Get user data from session
        const user = session.user;
        setUserId(user.id);

        // Fetch username from User table
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("username")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching username:", userError.message);
          setUsername(user.email || "!");
        } else {
          setUsername(userData?.username || user.email || "!");
        }

        // Fetch posts from the backend
        const response = await fetch(`${BASE_URL}/api/v1/blog/allPosts`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch posts");
        }

        // Map the backend response to match BlogProps
        const formattedPosts: BlogProps[] = result.data.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
          username: post.User?.username || "Unknown",
          userId: post.userId,
          User: {
            username: post.User?.username || "Unknown",
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
      <div className="flex justify-center items-center h-screen w-screen">
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Appbar name={username} blogOwnerId={userId} />
      <div className="flex-grow p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div>
          {posts.slice().reverse().map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};