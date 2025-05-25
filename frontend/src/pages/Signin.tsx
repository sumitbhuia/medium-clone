import { Heading } from "../component/Heading";
import { Warning } from "../component/Warning";
import { Inputbox } from "../component/Inputbox";
import { Button } from "../component/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quotes } from "../component/Quotes";
import * as Icons from "../Icons";
import { supabase } from "../supabaseClient";

export const googleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw new Error(error.message);
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
  localStorage.clear(); // Clear any custom localStorage items
};

export const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Fetch user data from your User table (optional)
        const { data: userData } = await supabase
          .from('User')
          .select('username')
          .eq('id', data.user.id)
          .single();

        localStorage.setItem("username", userData?.username || "");
        localStorage.setItem("email", data.user.email || email);
        localStorage.setItem("userId", data.user.id);

        navigate("/blogs", { state: { username: userData?.username || email } });
      }
    } catch (err: any) {
      setError(err.message || "Unable to login. Please try again.");
    }
  };

  const handleInputChange = (setter: (value: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setter(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <div className="w-full lg:w-1/2 p-4 lg:p-8 flex justify-center items-center bg-blend-luminosity">
        <div className="rounded-md shadow-xl w-full max-w-md bg-white p-6 lg:p-8">
          <form onSubmit={handleSignIn}>
            <Heading label={"Login"} />
            <Warning
              label={"Don't have an account?"}
              buttonText={"Sign up"}
              to={"/signup"}
            />

            <Inputbox
              label={"Email"}
              placeholder={"Enter your email"}
              onChange={handleInputChange(setEmail)}
              type={"email"}

            />
            <Inputbox
              label={"Password"}
              placeholder={"Enter your password"}
              onChange={handleInputChange(setPassword)}
              type={"password"}

            />

            {error && (
              <div
                className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
                role="alert"
              >
                <Icons.Error />
                <span className="sr-only">Error</span>
                <div>
                  <span className="font-medium">Error alert!</span> {error}
                </div>
              </div>
            )}

            <Button
              label={"Login"}
              onClick={handleSignIn}
              type="submit"
              className="mt-4"
            />
            <Button
              label={"Google"}
              onClick={googleSignIn}
              icon={<Google size={22} color="white" />}
              className="mt-2 text-black  bg-green-400 border border-gray-300 hover:bg-gray-100"
            />
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 justify-center items-center p-8">
        <Quotes />
      </div>
    </div>
  );
};

export const Google = ({ size = 24, color = "black", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
  </svg>
);