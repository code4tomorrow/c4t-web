import clsx from "clsx";
import Link from "next/link";
import React, { useMemo } from "react";

interface FooterHeaderProps {
    children: React.ReactNode;
}

const FooterHeader : React.FC<FooterHeaderProps> = ({ children }) => {
    return (
        <li className="list-none uppercase px-2 text-white my-6 font-bold">
            { children }
        </li>
    )
}

interface FooterItemProps extends React.HTMLProps<HTMLAnchorElement> {
    href?: string; 
    children: React.ReactNode;
}

const FooterItem : React.FC<FooterItemProps> = ({ href = "/", children, ...props }) => {
    return (
        <li className={clsx("list-none w-min hover:bg-black transition-all rounded-md px-2 hover:bg-opacity-10 p-1 text-medium-grey my-2 font-medium")}>
            <Link href={href} passHref>
                <a className="flex whitespace-nowrap items-center" { ...props }>
                    { children }
                </a>
            </Link>
        </li>
    )
}

interface FooterProps extends React.HTMLProps<HTMLDivElement> {}

const Footer : React.FC<FooterProps> = ({ className, ...props }) => {
    const currentYear = useMemo(() => {
        return new Date().getFullYear().toString();
    }, []);

    return (
        <footer
            className={clsx("bg-dark-grey-secondary w-full space-y-3 mt-auto flex justify-center items-center flex-col p-4", className)}
            { ...props}
        >
            <div className="w-full flex justify-center">
                <div className="grid w-full justify-items-center grid-cols-2 md:grid-cols-4 max-w-[1450px]">
                    <ul>
                        <FooterHeader>sitemap</FooterHeader>
                        <FooterItem>Home</FooterItem>
                        <FooterItem href="/about">About</FooterItem>
                        <FooterItem href="/courses">Courses</FooterItem>
                        <FooterItem href="/volunteer">Volunteer</FooterItem>
                        <FooterItem href="/learn">Learn</FooterItem>
                    </ul>
                    <ul>
                        <FooterHeader>Resources</FooterHeader>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://www.notion.so/code4tomorrow">Notion</FooterItem>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://discord.code4tomorrow.org/">Discord Guide</FooterItem>
                        <FooterItem href="/learn#faqs">FAQs</FooterItem>
                    </ul>
                    <ul>
                        <FooterHeader>Socials</FooterHeader>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://github.com/code4tomorrow">Github</FooterItem>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://www.linkedin.com/company/code4tomorrow/">Linkedin</FooterItem>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://www.instagram.com/code4tomorrow/">Instagram</FooterItem>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://www.facebook.com/Code-4-Tomorrow-112320087256142">Facebook</FooterItem>
                        <FooterItem target="_blank" rel="noopener nofollow noreferrer" href="https://www.youtube.com/channel/UCpf6llXUoEEx2AygLEzImKw">Youtube</FooterItem>
                    </ul>
                    <ul>
                        <FooterHeader>Support Us</FooterHeader>
                        <FooterItem href="/jobboard">Careers</FooterItem>
                        <FooterItem target="_blank" rel="noopener noreferrer" href="https://www.gofundme.com/f/fundraiser-for-coding-classes-in-code4tomorrow">Donate</FooterItem>
                    </ul>
                </div>
            </div>
            <p className="text-medium-grey !mt-8 text-center">©{currentYear} Code 4 Tomorrow 501(c) Non-Profit.</p>
        </footer>
    )
}

export default Footer; 