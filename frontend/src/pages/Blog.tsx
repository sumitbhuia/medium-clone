import { useNavigate, useParams } from "react-router-dom";
import { Appbar } from "../component/Appbar";
import Avatar from "../component/Avatar";
import { useEffect, useState } from "react";
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import * as Spinners from "react-loader-spinner";
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

export const Blog = () => {
  const [blog, setBlog] = useState<BlogProp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [username, setUsername] = useState<string>("!");
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

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen">
        <div className="text-red-600 text-lg">{error || "Blog post not found"}</div>
      </div>
    );
  }

  const cleanHtml = DOMPurify.sanitize(blog.description || "");
  const description = parse(cleanHtml);

  const name = blog.User.username || "?";
  const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(blog.createdAt);
  const month = date.getMonth();
  const monthString = month_names_short[month];
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-3">
      <Appbar name={username} blogOwnerId={userId} blogId={id} />
      <div className="container mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 lg:mt-8 mb-2 sm:mb-4">{blog.title}</h1>
            <div className="text-gray-600 text-sm sm:text-md mb-4 sm:mb-6">{`${monthString} ${day}, ${year}`}</div>
            <div className="description">{description}</div>
          </div>
          <div className="lg:col-span-4">
            <div className="flex flex-col items-center lg:items-start">
              <div className="flex items-center space-x-3 mb-4">
                {/* <Avatar name={name} size={38} /> */}
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
};