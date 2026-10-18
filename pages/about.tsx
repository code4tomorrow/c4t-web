import { withSiteAnnouncements } from "@utils/announcements";
import Skill from "@components/About/Skill";
import Animate from "@components/Animate";
import Footer from "@components/Footer";
import { getAlumniDirectory, getDirectory } from "@utils/directory";
import Head from "next/head";
import { ReactElement, useRef, useState } from "react";
import { graphQLClient } from "@utils/contentful";
import { gql } from "graphql-request";
import config from "config";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import Image from "next/legacy/image";
import StaticImage from "next/image";
import { cloudinaryLoader } from "@utils/cloudinary-loader";
import clsx from "clsx";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import dynamic from "next/dynamic";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Navbar from "@components/Navbar";
import type {
    IAlumniDirectoryRow,
    IDirectoryRow,
} from "common/interfaces/directory";

const Directory = dynamic(() => import("@components/About/Directory"));
const AlumniDirectory = dynamic(
    () => import("@components/About/AlumniDirectory")
);

interface AboutProps {
    directoryEntries: IDirectoryRow[];
    alumniDirectoryEntries: IAlumniDirectoryRow[];
    notificationFlags: INotificationFlag[];
}

const About: NextPageWithLayout<AboutProps> = ({
    directoryEntries: directoryEntriesParsed,
    alumniDirectoryEntries: alumniDirectoryEntriesParsed,
}) => {
    const missionRef = useRef<HTMLDivElement | null>(null);

    const [foundingStoryExpanded, setFoundingStoryExpanded] = useState(false);

    return (
        <div
            style={{ width: "100vw", overflowX: "hidden" }}
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary"
        >
            <Head>
                <title>About | C4T</title>
            </Head>

            <Animate>
                <main className="pt-4 md:px-6 px-4 w-full my-8 flex flex-col items-center">
                    <section className="my-6 flex flex-col items-center">
                        {/* The hero fades in with CSS rather than the scroll
                            animator, so it paints with the HTML instead of
                            staying invisible until JavaScript has loaded. */}
                        <div className="fade-up w-full max-w-md mb-16">
                            <StaticImage
                                src="/svg/book.svg"
                                alt=""
                                width={251}
                                height={189}
                                priority
                                unoptimized
                                className="h-auto w-full"
                            />
                        </div>
                        <h1
                            style={{ animationDelay: "60ms" }}
                            className="fade-up md:!text-6xl xs:text-4xl text-3xl font-bold text-white text-center"
                        >
                            What is{" "}
                            <span className="text-brand-purple-secondary whitespace-nowrap">
                                Code 4 Tomorrow
                            </span>
                            ?
                        </h1>
                        <p
                            style={{ animationDelay: "150ms" }}
                            className="fade-up text-lg !mt-3 text-medium-grey text-center max-w-4xl"
                        >
                            Code 4 Tomorrow&apos;s uniqueness lies in the fact
                            that we are entirely student-run, from the official
                            website to merch design and finance management. C4T
                            is a 501(c)(3) non-profit organization that offers
                            free coding classes to students around the globe, as
                            well as community service opportunities to our
                            members and teachers.
                        </p>
                    </section>
                    <section
                        ref={missionRef}
                        className="md:[&>div]:w-1/2 mt-32 md:space-x-6 w-screen flex md:flex-row flex-col-reverse p-3 sm:p-20 max-w-7xl justify-items-center"
                    >
                        <div className="my-10">
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="h1"
                                from={{ y: 60, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white"
                            >
                                Our{" "}
                                <span className="text-brand-purple-secondary">
                                    Mission
                                </span>
                            </Animate.Element>
                            <br></br>
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="p"
                                from={{ y: 90, opacity: 0 }}
                                to={{ y: 0, opacity: 1, delay: 0.15 }}
                                className="text-lg !mt-3 text-medium-grey max-w-4xl"
                            >
                                C4T aims to provide a bridge that connects
                                students worldwide to their future by linking
                                professionals and executives to mentor students,
                                and providing a dynamic, driven team of high
                                school students to teach topics from the
                                humanities to STEM. We aim to inspire the next
                                generation to consider career paths in Computer
                                Science or STEM.
                            </Animate.Element>
                        </div>
                        <Animate.Scrub
                            ref={missionRef}
                            start="top bottom"
                            end="bottom bottom"
                            from={{ y: 300 }}
                            to={{ y: 0 }}
                            className="flex flex-col justify-center"
                        >
                            <StaticImage
                                src="/svg/mission.svg"
                                alt=""
                                width={536}
                                height={370}
                                unoptimized
                                className="h-auto w-full"
                            />
                        </Animate.Scrub>
                    </section>
                    <section className="flex mt-32 flex-col items-center">
                        <div className="my-6 max-w-4xl">
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="h1"
                                from={{ y: 60, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white text-center"
                            >
                                A{" "}
                                <span className="text-brand-purple-secondary">
                                    Crucial
                                </span>{" "}
                                Experience
                            </Animate.Element>
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="p"
                                from={{ y: 90, opacity: 0 }}
                                to={{ y: 0, opacity: 1, delay: 0.15 }}
                                className="text-lg !mt-3 text-medium-grey text-center "
                            >
                                During a 6 week session, learn the most{" "}
                                <b>in-demand skills</b> with motivated students
                                and teachers from the comfort of your home,{" "}
                                <b>plus it&apos;s free.</b>
                            </Animate.Element>
                        </div>
                        <div className="md:[&>div]:w-1/2 md:space-x-6 w-screen flex md:flex-row flex-col-reverse p-3 sm:p-6 max-w-7xl justify-items-center">
                            <div
                                style={{ gridTemplateColumns: "1fr 1fr" }}
                                className="grid md:pt-0 pt-12 sm:gap-6 gap-3 justify-center items-center"
                            >
                                <Skill
                                    stat={"14,050+"}
                                    label="Students Educated"
                                >
                                    In just 6 weeks, students are taught
                                    priceless skills by qualified teachers.
                                </Skill>
                                <Skill stat={"700+"} label="Teachers">
                                    Hundreds of dedicated high-school teachers
                                    passing along their knowledge to k-12
                                    students.
                                </Skill>
                                <Skill stat={"215+"} label="Cities">
                                    Our organization has reached 215+ cities
                                    spread across 15+ countries including
                                    Kazakhstan, Kenya, Turkey, Malaysia, and
                                    Uzbekistan.
                                </Skill>
                                <Skill stat={"70,775+"} label="Hours Taught">
                                    Through our non-profit, STEM initiative we
                                    have globally reached this milestone by our
                                    numerous programs.
                                </Skill>
                            </div>
                            <div className="flex flex-col justify-center">
                                <StaticImage
                                    src="/svg/pair-coding.svg"
                                    alt=""
                                    width={776}
                                    height={508}
                                    unoptimized
                                    className="h-auto w-full"
                                />
                            </div>
                        </div>
                    </section>
                    <section className="flex mt-32 mb-16 w-full flex-col items-center">
                        <div className="my-6 max-w-4xl">
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="h1"
                                from={{ y: 60, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white text-center"
                            >
                                Meet Our{" "}
                                <span className="text-brand-purple-secondary">
                                    Dedicated
                                </span>{" "}
                                Team
                            </Animate.Element>
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="p"
                                from={{ y: 90, opacity: 0 }}
                                to={{ y: 0, opacity: 1, delay: 0.15 }}
                                className="text-lg !mt-3 text-medium-grey text-center"
                            >
                                Together, a devoted set of High schoolers embark
                                on making quality coding lessons{" "}
                                <b>more accessible</b>.
                            </Animate.Element>
                        </div>
                        <Directory directoryEntries={directoryEntriesParsed} />
                    </section>
                    <section className="flex mt-16 mb-32 w-full flex-col items-center">
                        <div className="my-6 max-w-4xl">
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="h1"
                                from={{ y: 60, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white text-center"
                            >
                                Meet Our{" "}
                                <span className="text-brand-purple-secondary">
                                    Alumni
                                </span>
                            </Animate.Element>
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="p"
                                from={{ y: 90, opacity: 0 }}
                                to={{ y: 0, opacity: 1, delay: 0.15 }}
                                className="text-lg !mt-3 text-medium-grey text-center"
                            >
                                Former members and teachers who made C4T what it
                                is <b>today</b>.
                            </Animate.Element>
                        </div>
                        <AlumniDirectory
                            directoryEntries={alumniDirectoryEntriesParsed}
                        />
                    </section>
                    <svg width={0} height={0}>
                        <clipPath
                            transform="scale(0.0125, 0.0125)"
                            id="svgPath"
                            clipPathUnits="objectBoundingBox"
                        >
                            <path
                                transform="translate(40, 40)"
                                d="M20.8,-27.7C28.5,-23.1,37.2,-19,38.6,-12.9C40.1,-6.8,34.3,1.2,31.6,10.4C28.9,19.7,29.1,30,24.3,33.1C19.6,36.2,9.8,32.1,2.4,28.8C-5,25.5,-9.9,23,-16.5,20.4C-23,17.9,-31.2,15.3,-35.8,9.6C-40.4,3.9,-41.4,-5,-38.2,-11.7C-35,-18.4,-27.5,-22.9,-20.4,-27.6C-13.3,-32.4,-6.6,-37.3,0,-37.3C6.6,-37.3,13.2,-32.3,20.8,-27.7Z"
                            ></path>
                        </clipPath>
                    </svg>
                    <section className="[&>*]:w-full [&>*]:lg:w-1/2 flex lg:flex-row flex-col-reverse itmes-center lg:space-x-6 mb-16 max-w-7xl justify-center">
                        <div className="relative">
                            <Animate.Element
                                as="h1"
                                resetAfterTriggered={false}
                                from={{ y: 30, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white"
                            >
                                Our Founding{" "}
                                <span className="text-brand-purple-secondary">
                                    Story
                                </span>
                                .
                            </Animate.Element>
                            <div
                                style={{
                                    WebkitMaskImage: `-webkit-gradient(linear, left 20%, left 100%, from(rgba(0,0,0,1)), to(rgba(0,0,0,${
                                        foundingStoryExpanded ? 1 : 0
                                    })))`,
                                }}
                            >
                                <Animate.Element
                                    as="p"
                                    resetAfterTriggered={false}
                                    from={{ y: 60, opacity: 0 }}
                                    to={{ y: 0, opacity: 1 }}
                                    className="text-lg !mt-6 text-medium-grey"
                                >
                                    Code 4 Tomorrow&apos;s roots lie in Code It
                                    Bay Area (CIBA), a local Bay Area,
                                    dozen-sized volunteer group that lasted for
                                    3 years until March 2020, when only two
                                    active members (Ansh Nagwekar and Jyoti
                                    Rani) remained. However, when the global
                                    pandemic struck, the students decided to
                                    step up, unite, and collaborate to aid the 1
                                    billion children out of school. That’s when
                                    Code 4 Tomorrow launched and became an
                                    official non-profit. In just a few weeks,
                                    students with similar interests gathered at
                                    Code 4 Tomorrow, forming a team of 30+
                                    dedicated members. Though the pandemic
                                    presented numerous difficulties, the
                                    students&apos; resilience completely
                                    restructured the organization. New teams
                                    were formed to create new custom online
                                    courses and facilitate multiple partnerships
                                    to enable global expansion.
                                </Animate.Element>
                                <Animate.Element
                                    resetAfterTriggered={false}
                                    as="p"
                                    from={{ y: 90, opacity: 0 }}
                                    to={{ y: 0, opacity: 1 }}
                                    className="text-lg !mt-3 text-medium-grey"
                                >
                                    Ranging from New York to Lebanon, our
                                    students now enjoy over 7 different courses
                                    taught by 60+ teachers, and our dedicated
                                    volunteer team continues to broaden our
                                    impact and spread our mission. The C4T
                                    Family has always had a focus on empowering
                                    the underprivileged. Especially given the
                                    context of today’s world, where solutions to
                                    societal problems lie in innovation and
                                    technology, we believe that improving access
                                    to technical education and resources is the
                                    best way to uplift the underrepresented. So,
                                    we’re here to teach them those skills,
                                    turning today&apos;s students into
                                    tomorrow&apos;s innovators.
                                </Animate.Element>
                            </div>
                            <button
                                onClick={() =>
                                    setFoundingStoryExpanded(
                                        !foundingStoryExpanded
                                    )
                                }
                                className={clsx(
                                    "z-10 rounded-2xl transition-all cursor-pointer hover:opacity-75 bg-white text-sm font-semibold px-2 py-1 text-dark-grey-primary absolute -translate-x-1/2 left-1/2",
                                    foundingStoryExpanded
                                        ? "top-[calc(100%+10px)]"
                                        : "top-3/4"
                                )}
                            >
                                {foundingStoryExpanded
                                    ? "Read Less"
                                    : "Read More"}
                            </button>
                        </div>
                        <Animate.Scrub
                            start="top bottom"
                            end="bottom bottom"
                            from={{ y: 30, scale: 0.75 }}
                            to={{ y: 0, scale: 1 }}
                            style={{ willChange: "transform" }}
                        >
                            <div className="w-full">
                                <Image
                                    draggable={false}
                                    loader={cloudinaryLoader}
                                    objectFit={"cover"}
                                    alt="Graduated Kids"
                                    src={"graduated-kids"}
                                    width={800}
                                    height={800}
                                    style={{
                                        clipPath: `url(#svgPath)`,
                                        WebkitClipPath: `url(#svgPath)`,
                                        userSelect: "none",
                                        pointerEvents: "none",
                                        WebkitUserSelect: "none",
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        maxWidth: "100%",
                                        height: "auto",
                                    }}
                                />
                            </div>
                        </Animate.Scrub>
                    </section>
                </main>
            </Animate>
            <Footer />
        </div>
    );
};

About.getLayout = (page: ReactElement, props) => {
    return (
        <>
            <Navbar notificationFlags={props?.notificationFlags || []} />
            <WatsonAssistantChat>{page}</WatsonAssistantChat>
        </>
    );
};

export default About;

/**
 * Notification banners live in Contentful. Fetched defensively so an upstream
 * outage hides a banner instead of failing the whole page build.
 */
async function getNotificationFlags(): Promise<INotificationFlag[]> {
    try {
        const response = await graphQLClient.request(
            gql`
                query ($preview: Boolean, $where: NotificationFlagFilter) {
                    notificationFlagCollection(
                        preview: $preview
                        where: $where
                    ) {
                        items {
                            notification {
                                json
                            }
                            type
                            link
                        }
                    }
                }
            `,
            {
                preview: config.contentful.preview,
                where: {
                    isVisible: true,
                    pages_contains_some: ["/about", "*"],
                },
            }
        );

        return withSiteAnnouncements(
            response?.notificationFlagCollection?.items || [],
            { page: "/about" }
        );
    } catch (error) {
        console.warn(
            "Skipping notification flags on /about:",
            error instanceof Error ? error.message : error
        );
        return [];
    }
}

export async function getStaticProps() {
    return {
        props: {
            // Live from Notion, falling back to the checked-in snapshot if
            // Notion is unreachable, so roles edited there show up here.
            directoryEntries: await getDirectory(),
            alumniDirectoryEntries: await getAlumniDirectory(),
            notificationFlags: await getNotificationFlags(),
        },
        // - At most once every 15 minutes
        revalidate: 60 * 15, // In seconds
    };
}
