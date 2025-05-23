import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import * as Icons from '../Icons'
import medium from '../../public/medium.png'
import React from "react";

interface AppbarProps {
    name: string;
    blogOwnerId?: number;
    blogId?: number | string;
}

// Without {} destructuring 
// console.log(name) ->{name: "Sumit Bhuia"}
// console.log(name.name) -> Sumit Bhuia
// With {} destructuring
// console.log(name) -> {"Sumit Bhuia"}
export function Appbar({ name, blogOwnerId, blogId }: AppbarProps): JSX.Element {
    const navigate = useNavigate();
    const currentUserId = Number(localStorage.getItem("userId"));
    return (
        <div className="flex justify-between items-center bg-white border-b p-2">
            <Link to={"/blogs"}><div>
                <img className="flex-none justify-center items-center cursor-pointer h-10" alt="Medium" src={medium} />
            </div></Link>
            <div>

                <div className="flex justify-center items-center text-gray-600">
                    {/* Create button on home page */}
                    <button className="mr-10 flex" onClick={() => { navigate('/publish') }}>
                        <span className="mr-1">Write</span>
                        <PlusIcon size={22} color="black" />
                    </button>
                    {/* Edit button only for blog owner */}
                    {blogOwnerId && blogId && currentUserId === blogOwnerId && (
                        <button className="mr-10 flex" onClick={() => { navigate(`/edit/${blogId}`) }}>
                            <span className="mr-1">Edit</span>
                            <PencilIcon size={22} color="black" />
                        </button>
                    )}
                    <span className="flex items-center" onClick={() => { navigate('/profile') }}><Avatar name={name} size={38} /></span>
                </div>


            </div>

        </div>
    )

}

export const PlusIcon = ({ size = 24, color = "black", ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={color}
        width={size}
        height={size}
        {...props}
    >
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"></path>
    </svg>
);

export const PencilIcon = ({ size = 24, color = "black", ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={color}
        width={size}
        height={size}
        {...props}
    >
        <path d="M15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89H6.41421L15.7279 9.57627ZM17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785L17.1421 8.16206ZM7.24264 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L7.24264 20.89Z"></path>
    </svg>
);


