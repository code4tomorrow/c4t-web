import Head from "next/head";
import React, {
    FormEvent,
    ReactElement,
    useEffect,
    useMemo,
    useState,
} from "react";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import DepartmentContact from "@components/Contact/DepartmentContact";
import { graphQLClient } from "@utils/contentful";
import { gql } from "graphql-request";
import config from "config";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { IDepartmentContact } from "common/interfaces/departmentContact";
import { makeStyles } from "tss-react/mui";
import clsx from "clsx";
import BrandButton from "@components/BrandButton";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/outline";
import useEmblaCarousel from "embla-carousel-react";
import { SEND_EMAIL } from "common/endpoints";
import Loader from "@components/Loader";
import { ISendEmailBody } from "./api/sendEmail";
import { useStyles } from "styles/contact";
import { useSetRecoilState } from "recoil";
import { snackBarState } from "@components/Snackbar";
import { v1 } from "uuid";

interface ContactProps {
    notificationFlags: INotificationFlag[];
    departmentContacts: IDepartmentContact[];
}

const ContactPage: NextPageWithLayout<ContactProps> = ({
    departmentContacts,
}) => {
    const [departmentId, setDepartmentId] = useState<string | undefined>(
        departmentContacts[Math.floor(departmentContacts.length / 2)].sys.id
    );
    const setSnackbar = useSetRecoilState(snackBarState);

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const { classes } = makeStyles()(() => ({
        inputContainer: {
            WebkitAppearance: "none",
            borderTop: "1px solid #333333",
            boxShadow: `0px 0px 0px 1px rgba(0,0,0,1)`,
            "&:focus": {
                boxShadow: "0px 0px 0px 3px #8C8796",
            },
        },
        gradientOverlay: {},
    }))();

    const [sending, setSending] = useState<boolean>(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (sending) return;

        setSending(true);

        fetch(SEND_EMAIL, {
            body: JSON.stringify({
                to: departmentContacts.find((c) => c.sys.id === departmentId)
                    ?.email,
                email,
                fullName,
                message,
            } as ISendEmailBody),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        })
            .then(() => {
                setSnackbar((oldSnacks) => [
                    ...oldSnacks,
                    {
                        key: v1(),
                        content: "Sent Message Successfully!",
                    },
                ]);
                setMessage("");
                setEmail("");
                setFullName("");
                setDepartmentId(undefined);
            })
            .catch(() => {
                setSnackbar((oldSnacks) => [
                    ...oldSnacks,
                    {
                        key: v1(),
                        content: "Failed to Send Message!",
                    },
                ]);
            })
            .finally(() => setSending(false));
    };

    const isSubmitDisabled = useMemo(() => {
        if (!departmentId || !fullName || !email || !message) return true;
        return false;
    }, [message, email, fullName, departmentId]);

    const [emblaRef, emblaAPI] = useEmblaCarousel(
        { startIndex: Math.floor(departmentContacts.length / 2) },
        []
    );

    const { classes: contactStyles } = useStyles();

    useEffect(() => {
        emblaAPI?.on("select", () => {
            setDepartmentId(
                departmentContacts[emblaAPI.selectedScrollSnap()].sys.id
            );
        });
        emblaAPI?.on("settle", () => {
            setDepartmentId(
                departmentContacts[emblaAPI.selectedScrollSnap()].sys.id
            );
        });
    }, [emblaAPI, departmentContacts]);

    const handleContactClick = (index: number) => (id: string) => {
        setDepartmentId(id);

        if (emblaAPI?.clickAllowed()) emblaAPI?.scrollTo(index);
    };

    return (
        <div
            style={{ width: "100vw" }}
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary"
        >
            <Head>
                <title>Contact | C4T</title>
            </Head>
            <main className="flex-1 flex relative flex-col items-center my-5 w-full px-3">
                <div className={contactStyles.gradientBubble}></div>
                <h1
                    style={{
                        textShadow: "5px 5px #5A4CAD",
                    }}
                    className="z-10 text-7xl md:text-8xl text-brand-purple-secondary text-center space-x-6 flex md:flex-row flex-col font-semibold"
                >
                    <span>Contact</span>
                    <span className="text-white">C4T</span>
                </h1>
                <section className="flex items-center mt-5">
                    <ChevronLeftIcon
                        onClick={() => {
                            emblaAPI?.scrollPrev();
                        }}
                        width={25}
                        color={"#fff"}
                        className="cursor-pointer opacity-75 transition-opacity hover:opacity-100"
                    />
                    <div className="space-x-1 flex justify-center items-center">
                        {departmentContacts.map(({ sys }, i) => (
                            <span
                                onClick={() => {
                                    handleContactClick(i)(sys.id);
                                }}
                                className={clsx(
                                    "w-3 h-1 block cursor-pointer rounded-full transition-all",
                                    departmentId === sys.id
                                        ? "bg-brand-purple-secondary"
                                        : "bg-dim-grey"
                                )}
                                key={i}
                            />
                        ))}
                    </div>
                    <ChevronRightIcon
                        onClick={() => {
                            emblaAPI?.scrollNext();
                        }}
                        width={25}
                        color={"#fff"}
                        className="cursor-pointer opacity-75 transition-opacity hover:opacity-100"
                    />
                </section>
                <section
                    className={clsx("py-4 mt-1", classes.gradientOverlay)}
                    ref={emblaRef}
                >
                    <div className="flex space-x-3">
                        {departmentContacts.map((contact, index) => (
                            <div key={contact.sys.id}>
                                <DepartmentContact
                                    contact={contact}
                                    onClick={handleContactClick(index)}
                                    selected={contact.sys.id === departmentId}
                                />
                            </div>
                        ))}
                    </div>
                </section>
                <form
                    onSubmit={handleSubmit}
                    className="z-10 w-full max-w-screen-2xl mb-5 mt-3 flex flex-col items-center space-y-3"
                >
                    <input
                        value={fullName}
                        required
                        placeholder="Full Name"
                        onChange={(e) => setFullName(e.target.value)}
                        className={clsx(
                            "bg-dark-grey-secondary transition-all outline-none rounded-md text-white p-3 w-full md:w-1/2",
                            classes.inputContainer
                        )}
                    />
                    <input
                        value={email}
                        required
                        type={"email"}
                        placeholder=" Your Email"
                        onChange={(e) => setEmail(e.target.value)}
                        className={clsx(
                            "bg-dark-grey-secondary transition-all outline-none rounded-md text-white p-3 w-full md:w-1/2",
                            classes.inputContainer
                        )}
                    />
                    <textarea
                        maxLength={2500}
                        value={message}
                        required
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className={clsx(
                            "bg-dark-grey-secondary transition-all resize-none outline-none rounded-md min-h-[250px] text-white p-3 w-full md:w-1/2",
                            classes.inputContainer
                        )}
                    ></textarea>
                    <BrandButton
                        disabled={isSubmitDisabled}
                        className="flex items-center"
                        title="Send Message"
                    >
                        <PaperAirplaneIcon
                            color="#fff"
                            className="rotate-45 -translate-y-[1px]"
                            width={20}
                        />
                        {sending && <Loader className="!h-0" />}
                    </BrandButton>
                </form>
                <div className={contactStyles.gradientBubbleBottom}></div>
            </main>
            <Footer className="z-10" />
        </div>
    );
};

ContactPage.getLayout = (page: ReactElement, props) => {
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
            query ($preview: Boolean, $where: NotificationFlagFilter) {
                notificationFlagCollection(preview: $preview, where: $where) {
                    items {
                        notification {
                            json
                        }
                        type
                        link
                    }
                }
                contactCollection(preview: $preview) {
                    items {
                        name
                        email
                        description
                        sys {
                            id
                        }
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

    const notificationFlags: INotificationFlag[] =
        response?.notificationFlagCollection?.items || [];
    const departmentContacts = response?.contactCollection?.items || [];

    return {
        props: {
            departmentContacts,
            notificationFlags,
        },
        // - At most once every 15 minutes
        revalidate: 60 * 15, // In seconds
    };
}

export default ContactPage;
