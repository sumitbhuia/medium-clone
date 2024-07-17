import axios from "axios";
import {BlogCard} from "../component/BlogCard";
import { useEffect, useState } from "react";
import * as Spinners from "react-loader-spinner";
import { Appbar } from "../component/Appbar";
import { useNavigate } from "react-router-dom";



interface BlogProps {
    username: string;
    createdAt: string;
    title: string;
    description: string;
    id:number;
}




export const Blogs = () => {
    const [posts , setPosts] = useState<BlogProps[]>([]);
    const [loading, setLoading] = useState(true);
    const name:string = localStorage.getItem("username")||`!`;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
   


   useEffect(()=>{

    if(!token){
        navigate("/signup");
    }

    const getPosts = async () =>{
        try{
            const response = await axios.get("https://backend.sumitbhuia.workers.dev/api/v1/blog/allPosts");
            setPosts(response.data);
        }
    
        catch(error){
            console.log("bhai galt hai ",error);
        }
        finally{
            setLoading(false);
        }
    };
    getPosts();
   },[token, navigate]) 

   if (loading) {
    return <div className="flex justify-center items-center h-screen w-screen">
              {loading && (
        <Spinners.Oval
          visible={true}
          height={50}
          width={50}
          color="#000000"
          secondaryColor = "#000000"
            strokeWidth={3}
            strokeWidthSecondary={4}
          ariaLabel="oval-loading"

          wrapperStyle={{}}
          wrapperClass=""
        />
      )}

    </div>;
}




return <div className="flex flex-col min-h-screen bg-white">
    
    <Appbar name={name}/>
    <div className="flex-grow p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div >
            {posts.map(it => <BlogCard  key={it.id} post={it} />)}
        </div>
    </div>
</div>;
}