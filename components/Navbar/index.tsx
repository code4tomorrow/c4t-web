import clsx from "clsx";
import Link from "next/link";
import React, { useState } from "react";
import { useStyles } from "./styles";
import { HomeIcon, LightBulbIcon, HandIcon, CodeIcon, BookOpenIcon } from "@heroicons/react/outline";

interface NavListItemProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode,
}

const NavListItem : React.FC<NavListItemProps> = ({ children, href, ...props }) => {
    return (
        <li className="text-white hover:opacity-75 transition-opacity text-base font-medium">
            <Link href={href || "/"} passHref>
                <a className="flex space-x-2 py-[5px] md:py-0" { ...props }>
                    { children }
                </a>
            </Link>
        </li>
    )
}

const Navbar = () => {
    const { classes } = useStyles();

    const [ mobileNavOpen, setMobileNavOpen ] = useState(false);

    return (
        <div>
            <nav className="px-10 py-5 flex justify-between items-center relative">
                <Link href="/" passHref>
                    <a>
                        <h1 className="text-lg font-bold text-white">C4T</h1>
                    </a>
                </Link>
                <div className={clsx(
                    "flex md:hidden flex-col space-y-1 cursor-pointer", 
                    classes.barsContainer,
                    mobileNavOpen && classes.mobileNavOpen
                )}
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <ul 
                    style={{ boxShadow: "0px 0px 0px 1px #000000" }}
                    className={
                    clsx(
                        classes.linksContainer,
                        "list-none scale-50 opacity-0 z-50",
                        "absolute top-16 right-8 space-y-0 bg-dark-grey-secondary border-solid border-0 border-t border-[#333333] px-6 py-4 rounded-lg",
                        "md:relative md:scale-100 md:top-0 md:transition-none md:opacity-100 md:space-y-0 md:rounded-none md:px-0 md:py-0 md:bg-transparent md:border-none md:right-0 md:flex md:space-x-4",
                        mobileNavOpen && "scale-100 opacity-100"
                    )
                }>
                    <NavListItem href="/">
                        <HomeIcon width={15} />
                        <span>Home</span>
                    </NavListItem>
                    <NavListItem href="/about">
                        <BookOpenIcon width={15} />
                        <span>About</span>
                    </NavListItem>
                    <NavListItem href="/courses">
                        <CodeIcon width={15} />
                        <span>Courses</span>
                    </NavListItem>
                    <NavListItem href="/volunteer">
                        <HandIcon width={15} />
                        <span>Volunteer</span>
                    </NavListItem>
                    <NavListItem href="/learn">
                        <LightBulbIcon width={15} />
                        <span>Learn</span>
                    </NavListItem>
                </ul>
            </nav>
        </div>
    )
}

export default Navbar; 