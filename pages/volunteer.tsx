import { withSiteAnnouncements } from "@utils/announcements";
import Footer from "@components/Footer";
import Head from "next/head";
import VolunteerCard from "@components/Volunteer";
import { gql } from "graphql-request";
import { graphQLClient, IBaseContentModel } from "@utils/contentful";
import Animate from "@components/Animate";
import Image from "next/image";
import config from "config";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { ReactElement } from "react";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Navbar from "@components/Navbar";

export interface IVolunteerOpportunity extends IBaseContentModel {
    name?: string;
    description?: {
        json: any;
    };
    link?: string;
    buttonLabel?: string;
    accentColor?: string;
}

interface VolunteerProps {
    volunteerOpportunities: IVolunteerOpportunity[];
    notificationFlags: INotificationFlag[];
}

const Volunteer: NextPageWithLayout<VolunteerProps> = ({
    volunteerOpportunities,
}) => {
    return (
        <div
            style={{ width: "100vw", overflowX: "hidden" }}
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary"
        >
            <Head>
                <title>Volunteer | C4T</title>
            </Head>
            <Animate>
                <main className="pt-4 px-6 w-full my-12 flex flex-col items-center">
                    {/* CSS entrance, so the hero paints before JavaScript. */}
                    <div className="fade-up w-full flex justify-center items-center relative h-[200px] mb-8">
                        <Image
                            src="/svg/volunteer-team.svg"
                            alt=""
                            width={454}
                            height={232}
                            priority
                            unoptimized
                            className="h-full w-auto"
                        />
                    </div>
                    <h1
                        style={{ animationDelay: "150ms" }}
                        className="fade-up text-5xl font-bold text-white text-center"
                    >
                        Volunteer Opportunities
                    </h1>
                    <p
                        style={{ animationDelay: "300ms" }}
                        className="fade-up text-lg !mt-3 text-medium-grey text-center"
                    >
                        Apply today for an opportunity to hone your skills and
                        help others, all while gaining <b>volunteer hours</b>.
                    </p>
                    <div
                        style={{
                            gridTemplateColumns: "repeat(auto-fit, 300px)",
                        }}
                        className="grid w-full mt-9 gap-6 justify-items-center justify-center"
                    >
                        {volunteerOpportunities.map((opportunity) => (
                            <VolunteerCard
                                key={opportunity.sys?.id}
                                opportunity={opportunity}
                            />
                        ))}
                    </div>
                </main>
            </Animate>
            <Footer />
        </div>
    );
};

Volunteer.getLayout = (page: ReactElement, props) => {
    return (
        <>
            <Navbar notificationFlags={props?.notificationFlags || []} />
            <WatsonAssistantChat>{page}</WatsonAssistantChat>
        </>
    );
};

export default Volunteer;

export async function getStaticProps() {
    const response = await graphQLClient.request(
        gql`
            query ($preview: Boolean, $where: NotificationFlagFilter) {
                volunteerOpportunityCollection(preview: $preview) {
                    items {
                        sys {
                            id
                        }
                        accentColor
                        name
                        buttonLabel
                        link
                        description {
                            json
                        }
                    }
                }
                notificationFlagCollection(preview: $preview, where: $where) {
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
                pages_contains_some: ["/volunteer", "*"],
            },
        }
    );

    const volunteerOpportunities: IVolunteerOpportunity[] =
        response?.volunteerOpportunityCollection?.items || [];
    const notificationFlags: INotificationFlag[] = withSiteAnnouncements(
        response?.notificationFlagCollection?.items || [],
        { page: "/volunteer" }
    );

    return {
        props: {
            volunteerOpportunities,
            notificationFlags,
        },
        // - At most once every 15 minutes
        revalidate: 60 * 15, // In seconds
    };
}
