import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import  parser  from "html-react-parser";


export function BlogCard({post}: any): JSX.Element {

  const wordCount = post.description
  .replace(/<[^>]+>/g, '') // Strip HTML tags
  .replace(/\[[0-9]+\]/g, '') // Remove citations
  .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
  .replace(/\s+/g, ' ') // Normalize spaces
  .trim()
  .split(/\s+/).length; // Count words
  
const time = Math.ceil(wordCount / 225); // 225 wpm

 const url: string = "https://random.imagecdn.app/150/150";

  const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const date = new Date(post.createdAt);
  const month = date.getMonth();
  const monthString = month_names_short[month];
  const day = date.getDate();
  const year = date.getFullYear();

  const description = parser(post.description);

  return (
    <Link to={`/blog/${post.id}`}>
      <div className="flex flex-col sm:flex-row border-b border-gray-200 py-6">
        <div className="flex-grow pr-4">
          <div className="flex items-center mb-2">
            <Avatar name={post.User.username} size={32} />
            <span className="ml-2 text-sm font-medium">{post.User.username}</span>
            <span className="ml-2 text-sm text-gray-500">{`• ${monthString} ${day}, ${year}`}</span>
          </div>
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          <div className="mb-4 overflow-hidden line-clamp-3 text-gray-700">{description}</div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{time} min read</span>
            <div className="flex space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-52 h-auto sm:h-34 mt-4 sm:mt-0 flex-shrink-0">
          <img src={url} alt="Blog post" className="w-full h-full object-cover" />
        </div>
      </div>
    </Link>
  );
}