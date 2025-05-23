import { Heading } from "../component/Heading";
import { Warning } from "../component/Warning";
import { Inputbox } from "../component/Inputbox";
import { Button } from "../component/Button";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Quotes } from "../component/Quotes";
import * as Icons from "../Icons";

export const Signin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const handleSignIn = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/v1/users/signin`, {
                email: email,
                password: password
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", response.data.user.username);
            localStorage.setItem("email", response.data.user.email);
            localStorage.setItem("userId", response.data.user.userId);

            navigate("/blogs", { state: { username: email } });
        } 
        catch (error) {
            let errorMessage = "Unable to login. Please try again.";
            
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Access to config, request, and response
                    errorMessage = error.response.data.error || error.response.data.message || errorMessage;
                } else if (error.request) {
                    // The request was made but no response was received
                    errorMessage = "No response received from server. Please try again.";
                } else {
                    // Something happened in setting up the request that triggered an Error
                    errorMessage = error.message;
                }
            } else {
                // This is not an Axios error, so it's likely a generic Error object
                errorMessage = (error as Error).message;
            }

            setError(errorMessage);
        }
    };

    return (
        // Whole screen
        <form>
        <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-white">
            {/* Signup form */}
            <div className="w-full lg:w-1/2 p-4 lg:p-8 flex justify-center items-center  bg-blend-luminosity">
                <div className="rounded-md shadow-xl w-full max-w-md bg-white p-6 lg:p-8 ">
                    <Heading label={"Login"}></Heading>
                    <Warning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"}></Warning>
                    
                    <Inputbox 
                        label={"Email"} 
                        placeholder={"Enter your email"} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                        type={"text"}
                    />
                    <Inputbox 
                        label={"Password"} 
                        placeholder={"Enter your password"} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                        type={"password"}
                    />
                    
                    {error && (
                        <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
                            <Icons.Error/>
                            <span className="sr-only">Error</span>
                            <div>
                                <span className="font-medium">Error alert!</span> {error}
                            </div>
                        </div>
                    )}
                    
                    <Button label={"Login"} onClick={handleSignIn}></Button>
                </div>
            </div>

            {/* Random quotes */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-50 justify-center items-center p-8">
                <Quotes></Quotes>
            </div>
        </div>
        </form>
    );
};