import Link from "next/link";
import React from "react";
import { ChevronUpIcon} from "@heroicons/react/outline";

interface FooterHeaderProps {
    children: React.ReactNode;
}

const FooterHeader : React.FC<FooterHeaderProps> = ({ children }) => {
    return (
        <li className="list-none uppercase text-white my-6 font-bold">
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
        <li className="list-none text-medium-grey-primary my-3 font-medium">
            <Link href={href} passHref>
                <a { ...props }>
                    { children }
                </a>
            </Link>
        </li>
    )
}

const Footer = () => {
    return (
        <footer className="bg-dark-grey-secondary w-full space-y-3 mt-auto flex justify-center items-center flex-col p-4">
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
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://www.notion.so/code4tomorrow">Notion</FooterItem>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://discord.code4tomorrow.org/">Discord Guide</FooterItem>
                </ul>
                <ul>
                    <FooterHeader>Socials</FooterHeader>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://github.com/code4tomorrow">Github</FooterItem>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/company/code4tomorrow/">Linkedin</FooterItem>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/code4tomorrow/">Instagram</FooterItem>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/Code-4-Tomorrow-112320087256142">Facebook</FooterItem>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/channel/UCpf6llXUoEEx2AygLEzImKw">Youtube</FooterItem>
                </ul>
                <ul>
                    <FooterHeader>Support Us</FooterHeader>
                    <FooterItem target="_blank" rel="noopener noreferrer" href="">Donate</FooterItem>
                </ul>
            </div>
            <p className="text-medium-grey-primary !mt-8 text-center">©2022 Code4Tomorrow 501(C) Non-Profit.</p>
        </footer>
    )
}

export default Footer; 