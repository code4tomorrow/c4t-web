import clsx from "clsx";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useStyles } from "./styles";
import { HomeIcon, LightBulbIcon, HandIcon, CodeIcon, BookOpenIcon } from "@heroicons/react/outline";
import { useRef } from "react";
import { useRouter } from "next/router";
import gsap from "gsap";
import { useThrottledCallback } from "use-debounce";
import { useNavigator } from "hooks/useNavigator";

interface ILink { 
    el: HTMLLIElement,
    route: string;
}

interface NavListItemProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode;
}

const NavListItem = React.forwardRef<ILink[], NavListItemProps>(({ children, href = "/", ...props }, ref) => {
    const containerRef = useRef<HTMLLIElement | null>(null);

    const router = useNavigator();

    const handleRouteChange = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(href, { pathname: href });
    };

    return (
        <li onClick={handleRouteChange} ref={(el) => {
            containerRef.current = el;
            if (ref) {
               (ref as any).current = [ ...((ref as any).current || []), { el, route: href }]
            }
        }} className={clsx(
            "text-white cursor-pointer hover:opacity-75 transition-opacity text-base font-medium"
        )}>
            <a href={href} className="flex md:px-2 space-x-2 md:space-x-0 py-[5px] md:py-1" { ...props }>
                { children }
            </a>
        </li>
    )
})

NavListItem.displayName = "NavListItem";

const Navbar = () => {
    const { classes } = useStyles();

    const [ mobileNavOpen, setMobileNavOpen ] = useState(false);
    const [ navHidden, setNavHidden ] = useState(false);

    const navItemRefs = React.useRef<ILink[]>(null);

    const linkHighlightRef = useRef<HTMLDivElement | null>(null);

    const router = useNavigator();

    const scrollOffset = useRef(0);

    const handleRouterChange = useCallback(() => {
        if (!linkHighlightRef.current || !navItemRefs.current) return; 

        const currentLink = navItemRefs.current.find(link => link.route === router.pathname);

        if (!currentLink) return; 

        const ref = router.previousRoute()?.toString();

        let prevLink:ILink | undefined; 
   
        if (ref) {
            prevLink = navItemRefs.current.find(item => item.route === encodeURI(ref));
        }
        if (!prevLink) prevLink = currentLink;

        const { x, y, width, height } = prevLink.el.getBoundingClientRect();
        const { x:x2, y:y2, width:width2, height:height2 } = currentLink.el.getBoundingClientRect();

        gsap.fromTo(
            linkHighlightRef.current, 
            { x, y, width, height }, 
            { x:x2, y:y2, width: width2, height:height2, duration: 0.15 },
        )
    }, [ navItemRefs, router.pathname ]);

    useEffect(handleRouterChange, [ handleRouterChange ]);

    const handleScroll = useCallback(() => {
        if (window.scrollY >= scrollOffset.current && window.scrollY !== 0) setNavHidden(true);
        else setNavHidden(false);

        let scrollY = window.scrollY;
        if (scrollY < 0) scrollY = 0; 
        else if (scrollY > document.body.scrollHeight - window.innerHeight) {
            scrollY = document.body.scrollHeight - window.innerHeight;
        }

        scrollOffset.current = scrollY;  
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [ handleScroll ]);

    const handleResize = useThrottledCallback(() => {
        if (!linkHighlightRef.current || !navItemRefs.current) return; 
        const currentLink = navItemRefs.current.find(link => link.route === router.pathname);
        if (!currentLink) return; 
        const { x, y, width, height } = currentLink.el.getBoundingClientRect();
        gsap.fromTo(
            linkHighlightRef.current, 
            { opacity: 0 },
            { opacity: 1, x, y, width, height, duration: 0.15 }
        )
    }, 350);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [ handleResize, linkHighlightRef, navItemRefs ]);

    return (
        <>
        <div 
            style={{ transition: "opacity 200ms ease" }}
            className={clsx(
                "fixed z-50 cursor-pointer hidden pointer-events-none md:pointer-events-auto md:block rounded-md bg-white bg-opacity-5 left-0 right-0",
                navHidden ? "!opacity-0" : "opacity-1"
            )}
            ref={linkHighlightRef}
        />
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
                    "md:relative md:!shadow-none md:scale-100 md:!pointer-events-auto md:top-0 md:transition-none md:opacity-100 md:space-y-0 md:rounded-none md:px-0 md:py-0 md:bg-transparent md:border-none md:right-0 md:flex md:space-x-0",
                    mobileNavOpen ? "scale-100 opacity-100 pointer-events-auto" : "pointer-events-none",
                )
            }>
                <NavListItem ref={navItemRefs} href="/">
                    <HomeIcon className="md:hidden" width={15} />
                    <span>Home</span>
                </NavListItem>
                <NavListItem ref={navItemRefs}  href="/about">
                    <BookOpenIcon className="md:hidden" width={15} />
                    <span>About</span>
                </NavListItem>
                <NavListItem ref={navItemRefs} href="/courses">
                    <CodeIcon className="md:hidden" width={15} />
                    <span>Courses</span>
                </NavListItem>
                <NavListItem ref={navItemRefs} href="/volunteer">
                    <HandIcon className="md:hidden" width={15} />
                    <span>Volunteer</span>
                </NavListItem>
                <NavListItem ref={navItemRefs} href="/learn">
                    <LightBulbIcon className="md:hidden" width={15} />
                    <span>Learn</span>
                </NavListItem>
            </ul>
        </nav>
        </>
    )
}

export default Navbar; 