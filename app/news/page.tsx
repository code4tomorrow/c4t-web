import Navbar from "@components/Navbar";
import { graphQLHTTPRequest } from "@utils/contentful";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { INewsletter } from "common/interfaces/newsletter";
import config from "config";
import { gql } from "graphql-request";
import React from "react";
import NewsletterContent from "./NewsletterContent";
import Footer from "@components/Footer";
import { getNewsletterPlaceholder } from "@utils/getNewsletterPlaceholder";
import { Metadata } from "next";
import Head from "next/head";

export interface ISubscribeState {
    success: boolean | null;
}

export async function generateMetadata(): Promise<Metadata> {
    const response = await graphQLHTTPRequest<{
        newsletterCollection: {
            items: INewsletter[];
        };
    }>(
        gql`
            query ($preview: Boolean, $order: [NewsletterOrder], $limit: Int) {
                newsletterCollection(
                    preview: $preview
                    order: $order
                    limit: $limit
                ) {
                    items {
                        date
                        title
                        graphic {
                            url
                            width
                            height
                        }
                    }
                }
            }
        `,
        {
            preview: config.contentful.preview,
            order: ["date_DESC"],
            limit: 1,
        }
    );

    const latestNewsletter = response?.data.newsletterCollection.items[0];
    const images = [];

    if (latestNewsletter) {
        images.push({
            url: latestNewsletter.graphic.url,
            width: latestNewsletter.graphic.width,
            height: latestNewsletter.graphic.height,
            alt: latestNewsletter.title,
        });
    }

    return {
        title: "News | C4T",
        openGraph: {
            images,
        },
    };
}

const Newsletter = async () => {
    const response = await graphQLHTTPRequest<{
        newsletterCollection: {
            items: INewsletter[];
        };
        notificationFlagCollection: {
            items: INotificationFlag[];
        };
    }>(
        gql`
            query (
                $preview: Boolean
                $order: [NewsletterOrder]
                $limit: Int
                $where: NotificationFlagFilter
            ) {
                newsletterCollection(
                    preview: $preview
                    order: $order
                    limit: $limit
                ) {
                    items {
                        sys {
                            id
                        }
                        date
                        title
                        graphic {
                            url
                            width
                            height
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
            order: ["date_DESC"],
            limit: 12,
            where: {
                isVisible: true,
                pages_contains_some: ["/news", "*"],
            },
        },
        {
            revalidate: 60 * 15,
            tags: ["newsletters"],
        }
    );

    const newsletters = await Promise.all(
        (response?.data.newsletterCollection.items || []).map(
            async (newsletter) => {
                const dataURL = await getNewsletterPlaceholder(
                    newsletter.graphic.url
                );
                return { ...newsletter, placeholderDataURL: dataURL };
            }
        )
    );

    const subscribe = async (
        _prevState: ISubscribeState,
        formData: FormData
    ): Promise<ISubscribeState> => {
        "use server";

        const response = await fetch(config.sender.apiBaseURL, {
            body: JSON.stringify({
                email: formData.get("email"),
                groups: [config.sender.groups.c4tWeb],
            }),
            headers: {
                Authorization: `Bearer ${process.env.SENDER_NET_API_TOKEN}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            method: "POST",
        })
            .then((res) => res.json())
            .catch((err) => {
                console.error(err);
                return null;
            });

        return {
            success: !!response?.success,
        };
    };

    return (
        <>
            <Head></Head>
            <Navbar
                notificationFlags={
                    response?.data.notificationFlagCollection.items || []
                }
            />
            <NewsletterContent
                newsletters={newsletters}
                subscribe={subscribe}
            />
            <br />
            <Footer />
        </>
    );
};

export default Newsletter;
