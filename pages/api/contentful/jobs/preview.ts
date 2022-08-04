import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { graphQLClient } from "@utils/contentful";

const jobPreviewQuery = gql`
    query {
        jobCollection {
            items {
                sys {
                    id,
                },
                title,
                skills,
                faction
            }
        }
    }
`

const CACHE_TTL = 60 * 10; 

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
  ) {
    const response = await graphQLClient.request(jobPreviewQuery);
    const items = response?.jobCollection?.items || [];

    res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`);
    res.json(items);
}

