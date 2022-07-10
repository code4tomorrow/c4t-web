import { GraphQLClient } from "graphql-request";

export const graphQLClient = new GraphQLClient(`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`, { 
    headers: { 
        'Authorization': `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`
    }
});

export enum ContentModelID {
    COURSE = "course",
    PROMOTIONAL_LABEL = "promotionalLabel",
    IMAGE = "image",
    FAQ = "faq"
}