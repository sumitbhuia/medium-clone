import { useNavigate } from "react-router-dom";
import { PublishBar } from "../component/PublishBar";
import Tiptap from "../component/Tiptap";
import { Editor } from '@tiptap/core';
import { useState } from 'react';
import axios from "axios";


export function Publish(): JSX.Element {

    const [title, setTitle] = useState<string>("");
    //Initializing the editor in a state , so that it can be used in the Tiptap.tsx & PublishBar.tsx 
    // This is also the description of the article
    const [editor, setEditor] = useState<Editor | null>(null);
    const name: string = localStorage.getItem("username") || `!`;

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    if (!token) {
        navigate("/signin");
    }




    const handleSave = () => {
        if (editor) {
            const html = editor.getHTML();

            async function sendData() {
                try {
                    const response = await axios.post(`${BASE_URL}/api/v1/blog/create`, {
                        title,
                        description: html,
                        // userId, // optional because we are getting userId from the token in backend
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    navigate(`/blog/${response.data.id}`);
                }
                catch (error) {
                    return console.error(error);
                }
            }
            sendData();
        }

        else {
            console.log("Editor is null");
        }
    };



    return (<div className="publish-container ">

        <div className="border-b py-1 px-4 sm:py-2 sm:px-4 md:py-3 md:px-6 lg:py-4 lg:px-8">
            <PublishBar name={name} onPublish={handleSave} />
        </div>
        <div className="content-area pt-10">
            {/* Title */}
            <textarea
                placeholder="Title"
                className="title-input"
                onChange={(e) => setTitle(e.target.value)} />
            {/* Description */}
            <Tiptap setEditor={setEditor} />
        </div>

    </div>)

}


