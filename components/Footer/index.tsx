"use client";

import { PaperAirplaneIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import Link from "next/link";
import React, { useMemo } from "react";
import { makeStyles } from "tss-react/mui";

interface FooterHeaderProps {
    children: React.ReactNode;
}

const FooterHeader: React.FC<FooterHeaderProps> = ({ children }) => {
    return (
        <li className="list-none uppercase px-2 text-white my-6 font-bold">
            {children}
        </li>
    );
};

interface FooterItemProps extends React.HTMLProps<HTMLAnchorElement> {
    href?: string;
    children: React.ReactNode;
}

const FooterItem: React.FC<FooterItemProps> = ({
    href = "/",
    children,
    ...props
}) => {
    const { classes } = makeStyles()(() => ({
        footerItem: {
            "&:hover": {
                boxShadow: "0px 0px 0px 2px rgba(255,255,255,0.2)",
            },
        },
    }))();

    return (
        <li
            className={clsx(
                "list-none w-min hover:bg-black transition-all rounded-md px-2 hover:bg-opacity-10 p-1 text-medium-grey my-2 font-medium",
                classes.footerItem
            )}
        >
            <Link href={href} passHref scroll={false} legacyBehavior>
                <a className="flex whitespace-nowrap items-center" {...props}>
                    {children}
                </a>
            </Link>
        </li>
    );
};

type FooterProps = React.HTMLProps<HTMLDivElement>;

const Footer: React.FC<FooterProps> = ({ className, ...props }) => {
    const currentYear = useMemo(() => {
        return new Date().getFullYear().toString();
    }, []);

    return (
        <footer
            className={clsx(
                "bg-dark-grey-secondary w-full space-y-3 mt-auto flex justify-center items-center flex-col p-4",
                className
            )}
            {...props}
        >
            <div className="w-full flex justify-center">
                <div className="grid w-full justify-items-center grid-cols-2 md:grid-cols-4 max-w-[1450px]">
                    <ul>
                        <FooterHeader>sitemap</FooterHeader>
                        <FooterItem>Home</FooterItem>
                        <FooterItem href="/news">Newsletter</FooterItem>
                        <FooterItem href="/about">About</FooterItem>
                        <FooterItem href="/courses">Courses</FooterItem>
                        <FooterItem href="/volunteer">Volunteer</FooterItem>
                        <FooterItem href="/learn">Learn</FooterItem>
                    </ul>
                    <ul>
                        <FooterHeader>Resources</FooterHeader>
                        <FooterItem href="/contact">
                            <PaperAirplaneIcon
                                className="rotate-45 text-brand-purple-secondary -translate-y-[2px]"
                                width={20}
                            />
                            <span>Contact Us</span>
                        </FooterItem>
                        <FooterItem href="/learn#faqs">FAQs</FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://www.notion.so/code4tomorrow"
                        >
                            Notion
                        </FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://discord.code4tomorrow.org/"
                        >
                            Discord Guide
                        </FooterItem>
                    </ul>
                    <ul>
                        <FooterHeader>Socials</FooterHeader>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://github.com/code4tomorrow"
                        >
                            Github
                        </FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://www.linkedin.com/company/code4tomorrow/"
                        >
                            Linkedin
                        </FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://www.instagram.com/code4tomorrow/"
                        >
                            Instagram
                        </FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://www.facebook.com/Code-4-Tomorrow-112320087256142"
                        >
                            Facebook
                        </FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            href="https://www.youtube.com/channel/UCpf6llXUoEEx2AygLEzImKw"
                        >
                            Youtube
                        </FooterItem>
                    </ul>
                    <ul>
                        <FooterHeader>Support Us</FooterHeader>
                        <FooterItem href="/jobs">Careers</FooterItem>
                        <FooterItem href="/internships">Internships</FooterItem>
                        <FooterItem
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.gofundme.com/f/fundraiser-for-coding-classes-in-code4tomorrow"
                        >
                            Donate
                        </FooterItem>
                    </ul>
                </div>
            </div>
            <p className="text-medium-grey !mt-8 text-center">
                ©{currentYear} Code 4 Tomorrow 501(c)(3) Non-Profit
                <span className="italic">{" (EIN: 92-0635065)"}</span>
            </p>
        </footer>
    );
};

export default Footer;
