"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { INewsletter } from "common/interfaces/newsletter";
import NewsletterTitle from "./NewsletterTitle";
import Animate from "@components/Animate";
import NewsletterMini from "./NewsletterMini";
import useDimensions from "hooks/useDimensions";

interface NewsletterContentProps {
    newsletters: INewsletter[];
}

const NewsletterContent : React.FC<NewsletterContentProps> = ({ newsletters }) => {
    const [ currentNewsletter, setCurrentNewsletter ] = useState<INewsletter>(newsletters[0]);
    const { width } = useDimensions({ enableDebounce: true });

    const [ primaryWidth, primaryHeight ] = useMemo(() => {
        const graphicWidth = currentNewsletter.graphic.width;
        const graphicHeight = currentNewsletter.graphic.height;
        const primaryWidth = width > 1024 ? width / 2 - 32 : width - 32;

        return [ primaryWidth, primaryWidth * (graphicHeight / graphicWidth) ];
    }, [currentNewsletter.graphic.height, currentNewsletter.graphic.width, width]);

    return (
        <main className="flex lg:flex-row flex-col h-full justify-center mt-16 lg:px-8 px-4">
            <div id="highlighted-newsletter" className="lg:w-1/2 w-full h-full flex flex-col space-y-3 items-center">
                <NewsletterTitle newsletter={currentNewsletter} />
                <div style={{
                    width: primaryWidth,
                    height: primaryHeight,
                }} className="relative w-full h-screen">
                    <Image 
                        src={currentNewsletter.graphic.url} 
                        priority
                        fill
                        quality={100}
                        objectFit="contain"
                        style={{
                            objectPosition: "top"
                        }}
                        alt={"newsletter"}
                    />
                </div>
            </div>
            <Animate>
                <div className="lg:px-4 lg:w-1/2 w-full mt-16 lg:mt-0">
                    <h1
                        style={{
                            textShadow: "5px 5px #5A4CAD",
                        }}
                        className="z-10 xl:text-8xl lg:text-7xl text-6xl flex flex-wrap justify-center text-brand-purple-secondary text-center font-semibold"
                    >
                        <Animate.Element 
                            resetAfterTriggered={false}
                            as="span"
                            className="transition-all duration-300"
                            onDeactivatedClasses="opacity-0 translate-y-[100px]"
                            onActivatedClasses="opacity-100"
                        >
                            C4T&apos;s&nbsp;
                        </Animate.Element>
                        <Animate.Element 
                            as="span" 
                            resetAfterTriggered={false}
                            className="transition-all text-white duration-500 delay-100"
                            onDeactivatedClasses="opacity-0 translate-y-[100px]"
                            onActivatedClasses="opacity-100"
                        >
                                Newsletters
                        </Animate.Element>
                    </h1>
                    <div className="mt-8 flex flex-wrap lg:p-4 justify-center items-center">
                    {
                        newsletters.map(newsletter => (
                            <NewsletterMini 
                                key={newsletter.sys.id} 
                                selectedNewsletter={currentNewsletter}
                                setSelectedNewsletter={setCurrentNewsletter}
                                newsletter={newsletter}
                            />
                        ))
                    }
                    </div>
                </div>
            </Animate>
        </main>
    )
}

export default NewsletterContent;