import Navbar from "@components/Navbar";
import { graphQLHTTPRequest } from "@utils/contentful";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { INewsletter } from "common/interfaces/newsletter";
import config from "config";
import { gql } from "graphql-request";
import React from "react";
import NewsletterContent from "./NewsletterContent";
import Footer from "@components/Footer";


const Newsletter = async () => {
    const response = await graphQLHTTPRequest<{
        newsletterCollection: {
            items: INewsletter[]
        },
        notificationFlagCollection: {
            items: INotificationFlag[]
        },
    }>(gql`
        query ($preview: Boolean, $order: [NewsletterOrder], $limit: Int, $where: NotificationFlagFilter) {
            newsletterCollection(preview: $preview, order: $order, limit: $limit) {
                items {
                    sys {
                        id
                    }
                    date,
                    title,
                    graphic {
                        url,
                        width,
                        height
                    },
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
    `, {
        preview: config.contentful.preview,
        order: ["date_DESC"],
        limit: 12,
        where: {
            isVisible: true,
            pages_contains_some: ["/news", "*"],
        },
    }, {
        revalidate: 60 * 15,
        tags: ["newsletters"]
    });

    return (
        <>
            <Navbar notificationFlags={response?.data.notificationFlagCollection.items || []} />
            <NewsletterContent newsletters={response?.data.newsletterCollection.items || []} />
            <br />
            <Footer />
        </>
    )
}

export default Newsletter; 