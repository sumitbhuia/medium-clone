import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import parser from "html-react-parser";
import * as Icons from "../Icons"

export function BlogCard({ post }: any): JSX.Element {


  const url: string = "https://picsum.photos/150/150";
  const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const date = new Date(post.createdAt);
  const month = date.getMonth();
  const monthString = month_names_short[month];
  const day = date.getDate();
  const year = date.getFullYear();
  const description = parser(post.description);

  const wordCount = post.description
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/\[[0-9]+\]/g, '') // Remove citations
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .split(/\s+/).length; // Count words
  const time = Math.ceil(wordCount / 225); // 225 wpm


  return (
    <Link to={`/blog/${post.id}`}>
      <div className="flex flex-col sm:flex-row border-b border-gray-200 py-6 hover:bg-gray-50 transition duration-200">
        <div className="flex-grow pr-4 flex flex-col justify-between min-h-[150px]">
          <div>
            <div className="flex items-center mb-3">
              <Avatar name={post.User.username} size={32} />
              <span className="ml-2 text-sm font-medium text-gray-800">{post.User.username}</span>
              <span className="ml-2 text-sm text-gray-500">{`• ${monthString} ${day}, ${year}`}</span>
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition duration-150">
              {post.title}
            </h2>
            <div className="mb-4 overflow-hidden line-clamp-3 text-gray-700 text-base leading-relaxed">
              {description}
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
            <span>{time} min read</span>
            <div className="flex space-x-3">
              <Icons.Save className="hover:text-blue-500 transition duration-150" color="white" />
              <Icons.Stop className="hover:text-red-500 transition duration-150" color="white" />
              <Icons.Options className="hover:text-gray-700 transition duration-150" />
            </div>
          </div>
        </div>
        <div className="w-full sm:w-52 h-auto sm:h-34 mt-4 sm:mt-0 flex-shrink-0">
          <img
            src={url}
            alt="Blog post"
            className="w-full h-full object-cover rounded-lg shadow-sm"
          />
        </div>
      </div>
    </Link>
  );
}