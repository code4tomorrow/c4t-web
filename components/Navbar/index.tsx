import clsx from "clsx";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useStyles } from "./styles";
import { HomeIcon, LightBulbIcon, HandIcon, CodeIcon, BookOpenIcon } from "@heroicons/react/outline";
import { useRef } from "react";

interface NavListItemProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode,
}

const NavListItem : React.FC<NavListItemProps> = ({ children, href, ...props }) => {
    return (
        <li className="text-white hover:opacity-75 transition-opacity text-base font-medium">
            <Link href={href || "/"} passHref>
                <a className="flex space-x-2 md:space-x-0 py-[5px] md:py-0" { ...props }>
                    { children }
                </a>
            </Link>
        </li>
    )
}

const Navbar = () => {
    const { classes } = useStyles();

    const [ mobileNavOpen, setMobileNavOpen ] = useState(false);
    const [ navHidden, setNavHidden ] = useState(false);

    const scrollOffset = useRef(0);

    const handleScroll = useCallback(() => {
        if (window.scrollY > scrollOffset.current) setNavHidden(true);
        else setNavHidden(false);
        scrollOffset.current = window.scrollY; 
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [ handleScroll ]);

    return (
        <nav className={clsx(
            "px-10 py-5 flex fixed w-screen top-0 z-50 left-0 justify-between items-center transition-transform duration-300",
            navHidden ? "-translate-y-full" : "translate-y-0",
            classes.nav
        )}>
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
                className={
                clsx(
                    classes.linksContainer,
                    "list-none scale-50 opacity-0 z-50",
                    "absolute top-16 right-8 space-y-0 bg-dark-grey-secondary border-solid border-0 border-t border-[#333333] px-6 py-4 rounded-lg",
                    "md:relative md:!shadow-none md:scale-100 md:!pointer-events-auto md:top-0 md:transition-none md:opacity-100 md:space-y-0 md:rounded-none md:px-0 md:py-0 md:bg-transparent md:border-none md:right-0 md:flex md:space-x-4",
                    mobileNavOpen ? "scale-100 opacity-100 pointer-events-auto" : "pointer-events-none",
                )
            }>
                <NavListItem href="/">
                    <HomeIcon className="md:hidden" width={15} />
                    <span>Home</span>
                </NavListItem>
                <NavListItem href="/about">
                    <BookOpenIcon className="md:hidden" width={15} />
                    <span>About</span>
                </NavListItem>
                <NavListItem href="/courses">
                    <CodeIcon className="md:hidden" width={15} />
                    <span>Courses</span>
                </NavListItem>
                <NavListItem href="/volunteer">
                    <HandIcon className="md:hidden" width={15} />
                    <span>Volunteer</span>
                </NavListItem>
                <NavListItem href="/learn">
                    <LightBulbIcon className="md:hidden" width={15} />
                    <span>Learn</span>
                </NavListItem>
            </ul>
        </nav>
    )
}

export default Navbar; 