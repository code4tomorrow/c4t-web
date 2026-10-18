"use client";

import clsx from "clsx";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStyles } from "./styles";
import {
    HomeIcon,
    LightBulbIcon,
    HandIcon,
    CodeIcon,
    BookOpenIcon,
    PaperAirplaneIcon,
    SparklesIcon,
} from "@heroicons/react/outline";
import { useRef } from "react";
import { useThrottledCallback } from "use-debounce";
import GoArrow from "@components/GoArrow";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import Document from "@components/Document";
import { usePathname, useRouter } from "next/navigation";
import { cloudinaryLoader } from "@utils/cloudinary-loader";
import Image from "next/image";
import { buildRegistrationFlag } from "@utils/announcements";
import { FALL_2026 } from "@utils/sessionSchedule";
import { useTermPhase } from "hooks/useTermPhase";

/**
 * A scheduled banner (student registration) re-checks its phase in the
 * browser, so cached HTML from before a deadline still flips on time.
 */
const useLiveFlag = (flag: INotificationFlag): INotificationFlag => {
    const phase = useTermPhase(
        flag.schedule?.term ?? FALL_2026.term,
        flag.schedule?.phase ?? "open"
    );
    return flag.schedule ? buildRegistrationFlag(phase) : flag;
};

const NavNotification = ({
    notificationFlag: renderedFlag,
}: {
    notificationFlag: INotificationFlag;
}) => {
    const { classes } = useStyles();
    const notificationFlag = useLiveFlag(renderedFlag);
    const Component = !!notificationFlag.link ? "a" : "div";

    return (
        <Component
            {...(!!notificationFlag.link
                ? {
                      href: notificationFlag.link,
                      rel: "noopener noreferrer nofollow",
                      target: "_blank",
                  }
                : {})}
            className={clsx(
                "flex px-8 justify-center mt-8 md:mt-3 items-center",
                !!notificationFlag.link &&
                    "[&>span>p]:hover:underline cursor-pointer chevrow-container"
            )}
        >
            <span
                className={clsx(
                    "hidden md:inline-block flex-shrink-0 w-2 h-2 rounded-full mx-3 bg-brand-purple-secondary before:bg-brand-purple-primary",
                    classes.notificationDot
                )}
            />
            <span className="text-brand-purple-secondary text-center text-sm font-semibold">
                <Document
                    color="text-brand-purple-secondary"
                    document={notificationFlag.notification?.json}
                />
            </span>
            {!!notificationFlag.link && (
                <GoArrow className="hidden md:inline mx-1" />
            )}
        </Component>
    );
};

interface ILink {
    el: HTMLLIElement;
    route: string;
}

interface NavListItemProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode;
}

const NavListItem = React.forwardRef<ILink[], NavListItemProps>(
    ({ children, href = "/", ...props }, ref) => {
        const containerRef = useRef<HTMLLIElement | null>(null);

        const pathname = usePathname();
        const router = useRouter();

        const handleRouteChange = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(href);
        };

        const { classes } = useStyles();

        const isActive = useMemo(() => href === pathname, [href, pathname]);

        return (
            <Link href={{ pathname: href }} legacyBehavior>
                <li
                    onClick={handleRouteChange}
                    ref={(el) => {
                        containerRef.current = el;
                        if (ref) {
                            (ref as any).current = [
                                ...((ref as any).current || []),
                                { el, route: href },
                            ];
                        }
                    }}
                    className={clsx(
                        "text-white cursor-pointer bg-transparent md:hover:opacity-75 text-base font-medium",
                        classes.linkContainer
                    )}
                >
                    <a
                        href={href}
                        className={clsx(
                            "flex md:px-2 space-x-2 md:space-x-0 py-[3px] md:py-1",
                            classes.link,
                            isActive && classes.linkActive
                        )}
                        {...props}
                    >
                        {children}
                    </a>
                </li>
            </Link>
        );
    }
);

NavListItem.displayName = "NavListItem";

interface NavbarProps {
    notificationFlags?: INotificationFlag[];
}

interface HighlightBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

const highlightFrame = (box: HighlightBox, opacity: number) => ({
    transform: `translate(${box.x}px, ${box.y}px)`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    opacity: String(opacity),
});

/**
 * Slides the active-link highlight (a fixed element at 0,0) onto a link with
 * the Web Animations API. This used to be gsap, which shipped ~25 KB of
 * animation library on every page for this one 150 ms tween.
 */
const moveHighlight = (
    element: HTMLElement,
    from: HighlightBox & { opacity: number },
    to: HighlightBox
) => {
    const end = highlightFrame(to, 1);
    Object.assign(element.style, end);
    if (typeof element.animate === "function") {
        element.animate([highlightFrame(from, from.opacity), end], {
            duration: 150,
            easing: "ease-out",
        });
    }
};

const Navbar: React.FC<NavbarProps> = ({ notificationFlags = [] }) => {
    const { classes } = useStyles();

    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [navHidden, setNavHidden] = useState(false);

    const navItemRefs = React.useRef<ILink[]>(null);
    const navRef = React.useRef<HTMLDivElement | null>(null);

    const linkHighlightRef = useRef<HTMLDivElement | null>(null);

    const pathname = usePathname();
    const scrollOffset = useRef(0);

    const handleRouterChange = useCallback(() => {
        if (!linkHighlightRef.current || !navItemRefs.current) return;

        const currentLink = navItemRefs.current.find(
            (link) => link.route === pathname
        );

        if (!currentLink?.el) return;

        let { x, y, width, height } =
            linkHighlightRef.current.getBoundingClientRect();
        let originalOpacity = 1;

        const {
            x: x2,
            y: y2,
            width: width2,
            height: height2,
        } = currentLink.el.getBoundingClientRect();

        if (x == 0 && y == 0) {
            x = x2;
            y = y2;
            width = width2;
            height = height2;
            originalOpacity = 0;
        }

        moveHighlight(
            linkHighlightRef.current,
            { x, y, width, height, opacity: originalOpacity },
            { x: x2, y: y2, width: width2, height: height2 }
        );
    }, [navItemRefs, pathname]);

    useEffect(handleRouterChange, [handleRouterChange]);

    const handleResize = useThrottledCallback(() => {
        if (
            !linkHighlightRef.current ||
            !navItemRefs.current ||
            !navRef.current
        )
            return;
        const currentLink = navItemRefs.current.find(
            (link) => link.route === pathname
        );
        if (!currentLink?.el) return;
        const { x, width, height, y } = currentLink.el.getBoundingClientRect();
        const current = linkHighlightRef.current.getBoundingClientRect();
        moveHighlight(
            linkHighlightRef.current,
            {
                x: current.x,
                y: current.y,
                width: current.width,
                height: current.height,
                opacity: Number(
                    getComputedStyle(linkHighlightRef.current).opacity
                ),
            },
            { x, y, width, height }
        );
    }, 350);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize, linkHighlightRef, navItemRefs]);

    useEffect(() => {
        setTimeout(() => {
            handleResize();
        }, 500);
    }, [handleResize]);

    const handleScroll = useCallback(() => {
        if (window.scrollY >= scrollOffset.current && window.scrollY !== 0)
            setNavHidden(true);
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
    }, [handleScroll]);

    return (
        <>
            <div
                style={{
                    transition: "opacity 200ms ease",
                    backdropFilter: "blur(10px)",
                }}
                className={clsx(
                    "fixed z-50 top-0 border-[rgba(255,255,255,0.1)] border-[1px] border-solid cursor-pointer hidden pointer-events-none md:poinster-events-auto md:block rounded-md bg-white bg-opacity-5 left-0 right-0",
                    navHidden ? "!opacity-0" : "opacity-1"
                )}
                ref={linkHighlightRef}
            />
            <nav
                ref={navRef}
                className={clsx(
                    "px-10 md:py-6 py-8 flex fixed w-screen top-0 z-50 left-0 justify-between items-center transition-transform duration-300",
                    navHidden ? "-translate-y-full" : "translate-y-0",
                    classes.nav
                )}
            >
                <Link
                    href="/"
                    passHref
                    className="hover:opacity-80 flex items-center h-4 transition-opacity"
                >
                    <Image
                        src="logo-v2"
                        loader={cloudinaryLoader}
                        alt="C4T Logo"
                        width={40}
                        height={40}
                        className="mr-2"
                    />
                    <h1 className="text-lg font-bold text-white hidden md:inline-block">
                        C4T
                    </h1>
                </Link>
                <div
                    className={clsx(
                        "flex md:hidden flex-col space-y-1 cursor-pointer",
                        classes.barsContainer,
                        mobileNavOpen && classes.mobileNavOpen
                    )}
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                >
                    <span />
                    <span />
                    <span />
                </div>
                <ul
                    className={clsx(
                        classes.linksContainer,
                        "list-none scale-50 z-50",
                        "absolute top-16 right-8 space-y-0 bg-dark-grey-secondary border-solid border-0 border-t border-[#333333] px-4 md:px-6 py-4 rounded-lg",
                        "md:relative md:!shadow-none md:scale-100 md:!pointer-events-auto md:top-0 md:transition-none md:opacity-100 md:space-y-0 md:rounded-none md:px-0 md:py-0 md:bg-transparent md:border-none md:right-0 md:flex md:space-x-0",
                        mobileNavOpen
                            ? "!scale-100 opacity-100 pointer-events-auto"
                            : "pointer-events-none opacity-0"
                    )}
                >
                    <NavListItem ref={navItemRefs} href="/">
                        <HomeIcon className="md:hidden" width={15} />
                        <span>Home</span>
                    </NavListItem>
                    <NavListItem ref={navItemRefs} href="/about">
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
                    <NavListItem ref={navItemRefs} href="/contact">
                        <PaperAirplaneIcon
                            className="md:hidden rotate-45"
                            width={15}
                        />
                        <span>Contact</span>
                    </NavListItem>
                    <NavListItem ref={navItemRefs} href="/news">
                        <SparklesIcon
                            className="text-brand-purple-secondary rotate-45"
                            width={15}
                        />
                        <span>News</span>
                    </NavListItem>
                </ul>
            </nav>
            <div className="w-screen md:z-50 lg:none flex relative justify-center items-center mt-16">
                {!!notificationFlags?.length && (
                    <NavNotification notificationFlag={notificationFlags[0]} />
                )}
            </div>
        </>
    );
};

export default Navbar;
