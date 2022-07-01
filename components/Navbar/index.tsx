import Link from "next/link";
import React from "react";

interface NavListItemProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode,
}

const NavListItem : React.FC<NavListItemProps> = ({ children, href, ...props }) => {
    return (
        <li className="text-white hover:opacity-75 transition-opacity text-base font-medium">
            <Link href={href || "/"} passHref>
                <a { ...props }>
                    { children }
                </a>
            </Link>
        </li>
    )
}

const Navbar = () => {
    return (
        <div>
            <nav className="px-10 py-5 flex justify-between items-center">
                <h1 className="text-lg text-white">C4T</h1>
                <ul className="list-none flex space-x-4">
                    <NavListItem href="/">Home</NavListItem>
                    <NavListItem href="/about">About</NavListItem>
                    <NavListItem href="/courses">Courses</NavListItem>
                    <NavListItem href="/volunteer">Volunteer</NavListItem>
                    <NavListItem href="/learn">Learn</NavListItem>
                </ul>
            </nav>
        </div>
    )
}

export default Navbar; 