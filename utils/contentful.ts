import { GraphQLClient } from "graphql-request";

const ACCESS_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN;

const CONTENTFUL_GRAPHQL_ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`; 

export const graphQLClient = new GraphQLClient(CONTENTFUL_GRAPHQL_ENDPOINT, { 
    headers: { 
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
});

export async function graphQLHTTPRequest(query:string, variables: object) {
    const response = await fetch(CONTENTFUL_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query,
            variables
        })
    }).catch(e => {
        console.error("Contentful GraphQL Query Error: ", e);
        return null;
    });

    if (!response) return null; 

    return await response.json();
}

export enum ContentModelID {
    COURSE = "course",
    PROMOTIONAL_LABEL = "promotionalLabel",
    IMAGE = "image",
    FAQ = "faq",
    NOTIFICATION_FLAG = "notificationFlag",
    VOLUNTEER_OPPORTUNITY = "volunteerOpportunity",
    TESTIMONIAL = "testimonial",
    JOB = "job",
    CONTACT = "contact"
}

export interface IBaseContentModel {
    sys?: {
        id?: string; 
    }
}

export interface IPagination<T> {
    items?: T[];
    skip?: number; 
    total?: number;
    limit?: number; 
}
