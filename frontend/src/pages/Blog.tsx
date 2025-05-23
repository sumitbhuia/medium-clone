import { useNavigate, useParams } from "react-router-dom";
import { Appbar } from "../component/Appbar";
import Avatar from "../component/Avatar";
import { useEffect, useState } from "react";
import parse from 'html-react-parser';
import axios from "axios";
import DOMPurify from 'dompurify';
import * as Spinners from "react-loader-spinner";


interface BlogProp {
    title: string;
    description: string;
    userId: number;
    id: number;
    createdAt: string;
    User: {
        username: string;
    };
}

export function Blog(): JSX.Element {
    const [blog, setBlog] = useState<BlogProp>();
    const [isLoading, setIsLoading] = useState(true);
    const userId: number = Number(localStorage.getItem("userId"));
    const { id } = useParams<{ id: string }>();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {

        if (!token) {
            navigate("/signin");
        }


        const getBlog = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${BASE_URL}/api/v1/blog/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setBlog(res.data);
            } catch (error) {
                console.log("Error getting blog", error);
            }
            finally {
                setIsLoading(false);
            }
        };

        getBlog();
    }, [id, token, navigate]);

    const cleanHtml = DOMPurify.sanitize(blog?.description || "");
    const description = parse(cleanHtml);

    const name = blog?.User.username || "?";
    const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = blog ? new Date(blog.createdAt) : new Date();
    const month = date.getMonth();
    const monthString = month_names_short[month];
    const day = date.getDate();
    const year = date.getFullYear();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen w-screen">
            {isLoading && (
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
            )}

        </div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-3">
            <Appbar name={localStorage.getItem("username") || ""} blogOwnerId={userId} blogId={id} />
            <div className="container mx-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 lg:mt-8 mb-2 sm:mb-4 ">{blog?.title}</h1>
                        <div className="text-gray-600 text-sm sm:text-md mb-4 sm:mb-6">{`${monthString} ${day}, ${year}`}</div>
                        <div className="description">{description}</div>
                    </div>
                    <div className="lg:col-span-4">
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="flex items-center space-x-3 mb-4">
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
}

