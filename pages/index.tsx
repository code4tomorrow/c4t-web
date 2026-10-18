import {
    FALL_2026,
    getTermPhase,
    isRegistrationOpen,
    type TermPhase,
} from "@utils/sessionSchedule";
import { useTermPhase } from "hooks/useTermPhase";
import { withSiteAnnouncements } from "@utils/announcements";
import React, { ReactElement } from "react";
import Head from "next/head";
import Paper from "@components/Paper";
import { useStyles } from "../styles/styles";
import clsx from "clsx";
import Typist from "react-typist-component";
import Animate from "@components/Animate";
import Footer from "@components/Footer";
import Link from "next/link";
import { cloudinaryLoader } from "@utils/cloudinary-loader";
import config from "config";
import { graphQLClient } from "@utils/contentful";
import { gql } from "graphql-request";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { ITestimonial } from "common/interfaces/testimonial";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import { InferGetServerSidePropsType } from "next";
import { modalState } from "common/atoms";
import { useAtomValue } from "@utils/store";
import dynamic from "next/dynamic";
import Image from "next/image";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Navbar from "@components/Navbar";

const BrandButton = dynamic(() => import("@components/BrandButton"));
const Testimonials = dynamic(() => import("@components/Testimonials"));
// const TeacherSignUps = dynamic(() => import("@components/ModalTypes/TeacherSignUps"));

const CODE_ITEMS = ["Today.", "Websites.", "Games.", "iOS Apps."];

const RegisterButton = () => (
    <BrandButton
        href={config.links.studentRegistrationLink}
        containerClass="mr-auto shrink-0 whitespace-nowrap"
        title="Register Now!"
        as="a"
        target={"_blank"}
        rel="noopener noreferrer"
    />
);

/** The Fall 2026 card for each point in the schedule; null once it's over. */
const fallCardCopy = (phase: TermPhase) => {
    const classes =
        "One 1.5-hour class each week for 6 weeks, completely free.";
    switch (phase) {
        case "early":
            return {
                tag: "Fall 2026 · Online",
                heading: "Starts the first week of November",
                body: `${classes} Sign up by ${FALL_2026.earlyDeadlineLabel} to save your spot.`,
            };
        case "open":
            return {
                tag: "Fall 2026 · Online",
                heading: "Starts the first week of November",
                body: `${classes} Registration is open until ${FALL_2026.registrationClosesLabel}.`,
            };
        case "started":
            return {
                tag: "Fall 2026 · Online",
                heading: "Classes started the first week of November",
                body: `${classes} There's still time to join: registration is open until ${FALL_2026.registrationClosesLabel}.`,
            };
        case "closed":
            return {
                tag: "Fall 2026 · Online · In session",
                heading: "Classes are in session",
                body: `Registration for the fall session has closed. Classes run through ${FALL_2026.lastClassLabel}.`,
            };
        default:
            return null;
    }
};

const Home: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getStaticProps>
> = ({ testimonials = [], fallPhase = "early" }) => {
    const phase = useTermPhase(FALL_2026.term, fallPhase);
    const fallCopy = fallCardCopy(phase);
    const fallRegistrationOpen = isRegistrationOpen(phase);
    const { classes } = useStyles();

    const mainRef = React.useRef<HTMLDivElement | null>(null);

    const sessionRef = React.useRef<HTMLDivElement | null>(null);
    const sessionsRef = React.useRef<HTMLDivElement | null>(null);
    const testimonialsRef = React.useRef<HTMLDivElement | null>(null);
    const donateRef = React.useRef<HTMLDivElement | null>(null);
    const partnershipRef = React.useRef<HTMLDivElement | null>(null);

    const modalOpen = useAtomValue(modalState);

    return (
        <div
            style={{ width: "100vw", overflowX: "hidden" }}
            className="w-screen flex flex-col min-h-screen bg-dark-grey-primary"
        >
            <Head>
                <title>Home | C4T</title>
            </Head>

            <header className="flex flex-col space-y-6 justify-center items-center p-3">
                <h1
                    style={{
                        textShadow: "0px 0px 15px rgba(255,255,255,0.45)",
                        whiteSpace: "nowrap",
                    }}
                    className="text-white xs:text-5xl md:!text-6xl text-4xl font-bold mt-16 text-center"
                >
                    Master Coding&nbsp;
                    <br className="md:hidden block" />
                    <Typist
                        pause={modalOpen}
                        cursor={
                            <span className={classes.blinkingCursor}>|</span>
                        }
                        loop={true}
                    >
                        {CODE_ITEMS.map((item, idx) => (
                            <span key={idx}>
                                <span>{item}</span>
                                <Typist.Delay ms={1750} />
                                <Typist.Backspace count={item.length} />
                                <Typist.Delay ms={250} />
                            </span>
                        ))}
                    </Typist>
                </h1>
                <h2 className="text-xl font-medium text-medium-grey text-center">
                    We teach K-12 students around the globe how to code for
                    free.
                </h2>
                <div className="flex space-x-3">
                    <BrandButton
                        className="w-[130px]"
                        title="Sign Up"
                        href={config.links.studentRegistrationLink}
                        as="a"
                        target={"_blank"}
                        rel="noopener noreferrer"
                        label="100% free"
                    />
                    <Link href="/about" passHref legacyBehavior>
                        <BrandButton
                            variant="default"
                            className={clsx("w-[130px]")}
                            title="Learn More"
                            as="a"
                        />
                    </Link>
                </div>
            </header>
            <Animate>
                <main
                    ref={mainRef}
                    className="p-3 mt-10 space-y-32 flex flex-col items-center"
                >
                    <section className="w-screen p-3 md:w-[125vw] h-[80vw] md:h-[60vw] max-w-[1950px] max-h-[850px] flex items-center justify-center">
                        <Animate.Element
                            resetAfterTriggered={false}
                            onDeactivatedClasses="translate-x-[-200px]"
                            onActivatedClasses="translate-x-0"
                            className="hidden w-[25%] h-[100%] transition-all duration-500 space-y-3 p-3 md:flex flex-col items-end justify-center"
                        >
                            <Paper containerClass="w-[75%] min-h-[25%]"></Paper>
                            <div className="w-[100%] min-h-[35%] justify-end flex space-x-3">
                                <div className="w-[35%] min-h-[100%] flex flex-col items-end pb-3 space-y-3">
                                    <Paper containerClass="w-[100%] min-h-[50%]"></Paper>
                                    <Paper containerClass="w-[100%] min-h-[50%]"></Paper>
                                </div>
                                <Paper containerClass="w-[25%] min-h-[100%]"></Paper>
                            </div>
                        </Animate.Element>
                        <div className="w-full md:w-[70%] h-[100%] flex flex-col justify-center space-y-3">
                            <Animate.Element
                                ref={mainRef}
                                resetAfterTriggered={false}
                                start="top bottom"
                                onDeactivatedClasses="translate-y-[200px]"
                                onActivatedClasses="translate-y-0"
                                className={clsx(
                                    "w-full h-[80%] z-10 transition-all duration-500",
                                    classes.carouselContainer
                                )}
                            >
                                <Paper
                                    containerClass={clsx(
                                        "relative w-full h-full"
                                    )}
                                >
                                    <Image
                                        draggable={false}
                                        src="code"
                                        priority
                                        loader={cloudinaryLoader}
                                        // Sharp enough for code text without
                                        // the weight of quality 100.
                                        quality={85}
                                        alt="code-demo"
                                        fill
                                        sizes="(min-width: 1560px) 1365px, (min-width: 768px) 88vw, 100vw"
                                        style={{ objectFit: "cover" }}
                                    />
                                </Paper>
                            </Animate.Element>
                            <Animate.Element
                                resetAfterTriggered={false}
                                onDeactivatedClasses="translate-y-[200px]"
                                onActivatedClasses="translate-y-0"
                                className="h-[20%] flex space-x-3 transition-all duration-500"
                            >
                                <Paper containerClass="w-[30%] h-[50%]"></Paper>
                                <Paper containerClass="w-[35%] h-[100%] flex flex-col p-10 justify-center items-center"></Paper>
                                <Paper containerClass="w-[35%] h-[45%]"></Paper>
                            </Animate.Element>
                        </div>
                        <Animate.Element
                            resetAfterTriggered={false}
                            onDeactivatedClasses="translate-x-[200px]"
                            onActivatedClasses="translate-x-0"
                            className="hidden w-[25%] h-[100%] transition-all duration-500 space-y-3 p-3 md:flex flex-col items-start justify-center"
                        >
                            <div className="w-[100%] min-h-[35%] flex space-x-3">
                                <Paper containerClass="w-[25%] min-h-[100%]"></Paper>
                                <div className="w-[35%] min-h-[100%] flex flex-col pb-3 space-y-3">
                                    <Paper containerClass="w-[100%] min-h-[50%]"></Paper>
                                    <Paper containerClass="w-[100%] min-h-[50%]"></Paper>
                                </div>
                            </div>
                            <Paper containerClass="w-[65%] min-h-[25%]"></Paper>
                        </Animate.Element>
                    </section>
                    <section className="flex py-5 flex-col-reverse md:flex-row md:items-center justify-around w-full max-w-[1250px]">
                        <article
                            ref={sessionRef}
                            className="space-y-5 flex flex-col md:max-w-[50%] px-2"
                        >
                            <Animate.Element
                                onDeactivatedClasses="translate-x-[-200px]"
                                onActivatedClasses="translate-x-0"
                                ref={sessionRef}
                                className="transition-transform duration-500"
                            >
                                <h1 className="text-white text-4xl md:text-5xl font-extrabold">
                                    Signup Now to be a Student!
                                </h1>
                            </Animate.Element>
                            <Animate.Element
                                ref={sessionRef}
                                onDeactivatedClasses="translate-x-[-200px]"
                                onActivatedClasses="translate-x-0"
                                className="transition-transform duration-700 delay-75"
                            >
                                <div className="space-y-3 md:max-w-[75%] text-lg">
                                    <p className="text-medium-grey">
                                        Sign up for Code 4 Tomorrow&apos;s free
                                        computer science classes! We offer
                                        courses in Java, Python, Scratch, Web
                                        Development, Machine Learning,
                                        JavaScript, and C for beginner to
                                        advanced students.{" "}
                                    </p>
                                </div>
                            </Animate.Element>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mr-auto"
                                href={config.links.studentRegistrationLink}
                            >
                                <BrandButton
                                    title="Register Now!"
                                    //label="Coming Soon"
                                />
                            </a>
                        </article>
                        <div className={"md:my-0 my-8"}>
                            <Image
                                src="/svg/learn.svg"
                                alt=""
                                width={252}
                                height={252}
                                unoptimized
                                className="h-auto w-[100%] max-w-[500px] md:max-w-[400px] md:w-[40vw]"
                            />
                        </div>
                    </section>

                    <section
                        id="sessions"
                        ref={sessionsRef}
                        className="flex py-5 flex-col md:flex-row md:items-center md:space-x-12 justify-around w-full max-w-[1250px]"
                    >
                        <article className="space-y-5 flex flex-col md:max-w-[55%] px-2">
                            <Animate.Element
                                ref={sessionsRef}
                                onDeactivatedClasses="translate-x-[-200px]"
                                onActivatedClasses="translate-x-0"
                                className="transition-transform duration-500"
                            >
                                <h1 className="text-white text-4xl md:text-5xl font-extrabold">
                                    Upcoming{" "}
                                    <span className="text-brand-purple-secondary">
                                        Sessions
                                    </span>
                                </h1>
                            </Animate.Element>
                            <Animate.Element
                                ref={sessionsRef}
                                onDeactivatedClasses="translate-x-[-200px]"
                                onActivatedClasses="translate-x-0"
                                className="transition-transform duration-700 delay-75 space-y-4"
                            >
                                {fallCopy && (
                                    <Paper containerClass="p-6 space-y-3 flex flex-col">
                                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-purple-secondary">
                                            {fallCopy.tag}
                                        </p>
                                        <h2 className="text-white text-2xl font-bold">
                                            {fallCopy.heading}
                                        </h2>
                                        <p className="text-medium-grey text-lg">
                                            {fallCopy.body}
                                        </p>
                                        <div className="!mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                                            {fallRegistrationOpen && (
                                                <RegisterButton />
                                            )}
                                            <Link
                                                href="/courses?tab=fall-2026"
                                                className="text-brand-purple-secondary underline underline-offset-4 hover:text-white"
                                            >
                                                See what each class covers
                                            </Link>
                                        </div>
                                    </Paper>
                                )}
                                <Paper containerClass="p-6 space-y-3 flex flex-col">
                                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-purple-secondary">
                                        Winter 2027 &middot; Online &amp; In
                                        Person
                                    </p>
                                    <h2 className="text-white text-2xl font-bold">
                                        Starts February 2027
                                    </h2>
                                    <p className="text-medium-grey text-lg">
                                        Exact dates are coming soon. Along with
                                        our online classes, Winter 2027 will
                                        include{" "}
                                        <b className="text-white whitespace-nowrap">
                                            in-person classes
                                        </b>
                                        .
                                    </p>
                                    {/* Once fall sign-ups close, the sign-up
                                        link moves here. */}
                                    {!fallRegistrationOpen && (
                                        <div className="!mt-5 flex">
                                            <RegisterButton />
                                        </div>
                                    )}
                                </Paper>
                            </Animate.Element>
                            <Animate.Element
                                as="p"
                                ref={sessionsRef}
                                onDeactivatedClasses="translate-x-[-200px]"
                                onActivatedClasses="translate-x-0"
                                className="transition-transform duration-700 delay-150 text-medium-grey text-lg"
                            >
                                <b className="text-white">
                                    Have a space we could teach in?
                                </b>{" "}
                                If your school, library, or community center can
                                host a class, we&apos;d love to hear from you.{" "}
                                <Link
                                    href="/contact"
                                    className="text-brand-purple-secondary underline underline-offset-4 hover:text-white"
                                >
                                    Reach out to us
                                </Link>
                                .
                            </Animate.Element>
                        </article>
                        {/* The flyer advertises fall sign-ups, so it comes
                            down when fall registration closes. */}
                        {fallRegistrationOpen && (
                            <Animate.Element
                                ref={sessionsRef}
                                onDeactivatedClasses="translate-x-[200px] opacity-0"
                                onActivatedClasses="translate-x-0 opacity-100"
                                className="transition-all duration-700 md:my-0 my-10 px-2 w-full md:w-[40%] max-w-[460px] self-center"
                            >
                                <a
                                    href="/fall-2026-flyer.png"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Image
                                        src="/fall-2026-flyer.png"
                                        alt="Fall 2026 flyer: free online coding classes. Intro to Python on Mondays 7:30–9:00 PM EST, Android Studio app development on Wednesdays 8:00–9:30 PM EST, programming with Scratch on Saturdays 5:00–6:30 PM EST, and intermediate ML and model evaluation on Sundays. Sign up at code4tomorrow.org before October 25."
                                        width={1545}
                                        height={1999}
                                        sizes="(min-width: 768px) 460px, 90vw"
                                        className="w-full h-auto rounded-md shadow-2xl"
                                    />
                                </a>
                            </Animate.Element>
                        )}
                    </section>

                    <section className="w-full flex flex-col items-center">
                        <div ref={testimonialsRef} className="mb-20 w-full">
                            <Animate.Element
                                as="h1"
                                ref={testimonialsRef}
                                onDeactivatedClasses="opacity-0 translate-y-[60px]"
                                onActivatedClasses="opacity-100 translate-y-0"
                                className="text-5xl transition-all duration-500 font-bold text-white text-center"
                            >
                                Parent & Alumni{" "}
                                <span className="text-brand-purple-secondary">
                                    Testimonials
                                </span>
                            </Animate.Element>
                            <Animate.Element
                                as="p"
                                ref={testimonialsRef}
                                onDeactivatedClasses="opacity-0 translate-y-[90px]"
                                onActivatedClasses="opacity-100 translate-y-0"
                                className="text-lg !mt-3 transition-all duration-700 delay-150 text-medium-grey text-center"
                            >
                                Read what the Parents & Graduated Students are
                                saying...
                            </Animate.Element>
                        </div>
                        <Testimonials testimonials={testimonials} />
                    </section>
                    <section className="flex py-10 flex-col-reverse md:flex-row-reverse md:items-center justify-around w-full max-w-[1250px]">
                        <article
                            ref={donateRef}
                            className="space-y-5 flex flex-col md:max-w-[50%] px-2"
                        >
                            <Animate.Element
                                ref={donateRef}
                                onDeactivatedClasses="translate-x-[200px]"
                                onActivatedClasses="translate-x-0"
                                className="transition-transform duration-500"
                            >
                                <h1 className="text-white text-4xl md:text-5xl font-extrabold">
                                    Consider Supporting a STEM Initiative.
                                </h1>
                            </Animate.Element>
                            <div className="space-y-3 md:max-w-[75%] text-lg">
                                <Animate.Element
                                    as="p"
                                    ref={donateRef}
                                    onDeactivatedClasses="translate-x-[200px]"
                                    onActivatedClasses="translate-x-0"
                                    className="transition-transform duration-700 delay-75 text-medium-grey"
                                >
                                    If you would like to support our efforts to
                                    make STEM education accessible to all,
                                    please consider donating.
                                </Animate.Element>
                            </div>
                            <BrandButton
                                href="https://gofund.me/8945a55a"
                                containerClass="mr-auto"
                                title="Donate Now"
                                label="Every bit Matters"
                                target={"_blank"}
                                rel="noopener noreferrer"
                                as="a"
                            />
                        </article>
                        <div className="md:my-0 my-8">
                            <Image
                                src="/svg/gifts.svg"
                                alt=""
                                width={325}
                                height={203}
                                unoptimized
                                className="h-auto w-[100%] max-w-[500px] md:max-w-[500px] md:w-[50vw]"
                            />
                        </div>
                    </section>
                    <section className="flex py-10 pb-48 flex-col-reverse md:flex-row md:items-center justify-around w-full max-w-[1250px]">
                        <article
                            ref={partnershipRef}
                            className="space-y-5 flex flex-col md:max-w-[50%] px-2"
                        >
                            <Animate.Element
                                ref={partnershipRef}
                                onDeactivatedClasses="translate-x-[-200px]"
                                onActivatedClasses="translate-x-0"
                                className="transition-transform duration-500"
                            >
                                <h1 className="text-white text-4xl md:text-5xl font-extrabold">
                                    Let&apos;s Build a Partnership.
                                </h1>
                            </Animate.Element>
                            <div className="space-y-3 md:max-w-[75%] text-lg">
                                <Animate.Element
                                    as="p"
                                    ref={partnershipRef}
                                    onDeactivatedClasses="translate-x-[-200px]"
                                    onActivatedClasses="translate-x-0"
                                    className="text-medium-grey transition-transform duration-700 delay-75"
                                >
                                    At C4T, we believe in the power of
                                    partnership. We know it will take a large
                                    coalition of change-makers in order to have
                                    the greatest impact. This is why we
                                    collaborate with other non-profit
                                    organizations to bring STEM-related
                                    opportunities to students.
                                </Animate.Element>
                            </div>
                            <BrandButton
                                containerClass="mr-auto"
                                title="Let's Team Up"
                                as="a"
                                rel="noopener noreferrer"
                                target={"_blank"}
                                href="https://tally.so/r/w7XY42"
                            />
                        </article>
                        <div className="md:my-0 my-8">
                            <Image
                                src="/svg/team.svg"
                                alt=""
                                width={344}
                                height={217}
                                unoptimized
                                className="h-auto w-[100%] max-w-[500px] md:max-w-[500px] md:w-[50vw]"
                            />
                        </div>
                    </section>
                </main>
            </Animate>
            <Footer />
        </div>
    );
};

Home.getLayout = (page: ReactElement, props) => {
    return (
        <>
            <Navbar notificationFlags={props?.notificationFlags || []} />
            <WatsonAssistantChat>{page}</WatsonAssistantChat>
        </>
    );
};

export async function getStaticProps() {
    const response = await graphQLClient.request(
        gql`
            query (
                $preview: Boolean
                $where: NotificationFlagFilter
                $testimonialLimit: Int
            ) {
                notificationFlagCollection(preview: $preview, where: $where) {
                    items {
                        notification {
                            json
                        }
                        type
                        link
                    }
                }
                testimonialCollection(
                    preview: $preview
                    limit: $testimonialLimit
                ) {
                    items {
                        text
                        rating
                        attestant
                        type
                    }
                }
            }
        `,
        {
            preview: config.contentful.preview,
            testimonialLimit: 8,
            where: {
                isVisible: true,
                pages_contains_some: ["/", "*"],
            },
        }
    );

    const notificationFlags: INotificationFlag[] = withSiteAnnouncements(
        response?.notificationFlagCollection?.items || [],
        { page: "/" }
    );
    const testimonials: ITestimonial[] =
        response?.testimonialCollection?.items || [];

    return {
        props: {
            notificationFlags,
            testimonials,
            fallPhase: getTermPhase(FALL_2026.term),
        },
        // - At most once every 15 minutes
        revalidate: 60 * 15, // In seconds
    };
}

export default Home;
