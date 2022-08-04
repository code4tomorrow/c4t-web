import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { graphQLClient } from "@utils/contentful";

export const config = {
    runtime: 'experimental-edge'
}

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

const CACHE_TTL = 60 * 30; 

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
  ) {
    const response = await graphQLClient.request(jobPreviewQuery);
    const items = response?.jobCollection?.items || [];

    res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`);
    res.json(items);
}

