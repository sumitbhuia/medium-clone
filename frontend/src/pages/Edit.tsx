import { useNavigate, useParams } from "react-router-dom";
import { PublishBar } from "../component/PublishBar";
import Avatar from "../component/Avatar";
import { useEffect, useState } from "react";
import axios from "axios";
import * as Spinners from "react-loader-spinner";
import Tiptap from "../component/Tiptap";
import { Editor } from '@tiptap/core';

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

export function Edit(): JSX.Element {
    const [blog, setBlog] = useState<BlogProp>();
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [ _ , setDescription] = useState("");
    const [editor, setEditor] = useState<Editor | null>(null);

    const { id } = useParams<{ id: string }>();
    const token = localStorage.getItem("token");
    const userId = Number(localStorage.getItem("userId"));
    const navigate = useNavigate();

    const BASE_URL = "https://backend.sumitbhuia.workers.dev";

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
                setTitle(res.data.title);
                setDescription(res.data.description);
            } catch (error) {
                console.log("Error getting blog", error);
            } finally {
                setIsLoading(false);
            }
        };
        getBlog();
    }, [id, token, navigate]);

    useEffect(() => {
        if (editor && blog) {
            editor.commands.setContent(blog.description || "");
        }
    }, [editor, blog]);

    if (blog && userId !== blog.userId) {
        return (
            <div className="flex justify-center items-center min-h-screen w-screen text-xl font-semibold">
                You are not authorized to edit this blog.
            </div>
        );
    }

    const handleSave = () => {
        if (editor) {
            const html = editor.getHTML();
            async function sendData() {
                try {
                    const response = await axios.put(
                        `${BASE_URL}/api/v1/blog/edit/${id}`,
                        {
                            title,
                            description: html,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    navigate(`/blog/${response.data.id}`);
                } catch (error) {
                    console.error(error);
                }
            }
            sendData();
        } else {
            console.log("Editor is null");
        }
    };

    const name = blog?.User.username || "?";

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-screen">
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
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-3 overscroll-contain">
            <PublishBar name={name} onPublish={handleSave} />
            <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 w-full">
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <textarea
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 lg:mt-8 mb-2 sm:mb-4 border-b border-gray-300 focus:outline-none focus:border-gray-500 resize-none"
                                rows={2}
                            />
                            <div className="w-full min-h-[400px] max-h-[600px] overflow-auto">
                                <Tiptap setEditor={setEditor} initialContent={blog?.description || ""} />
                            </div>
                        </form>
                    </div>
                    <div className="lg:col-span-4 w-full">
                        <div className="flex flex-col items-center lg:items-start p-4">
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