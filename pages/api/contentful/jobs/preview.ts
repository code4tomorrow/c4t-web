import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { graphQLClient, IPagination } from "@utils/contentful";
import { IJobPreview } from "common/interfaces/job";

const jobPreviewQuery = gql`
    query($limit: Int!, $skip: Int!) {
        jobCollection(limit:$limit, skip:$skip) {
            items {
                sys {
                    id,
                },
                title,
                faction,
                realLifeJobs
            },
            total,
            skip,
            limit
        }
    }
`

const CACHE_TTL = 60 * 10; 

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IPagination<IJobPreview>>
  ) {
    const limit = parseInt(req.query.limit as string) || 5;
    const page = parseInt(req.query.page as string) || 0;

    const response = await graphQLClient.request(jobPreviewQuery, { 
        limit,
        skip: page * limit
    });

    const json = { items: [], ...response?.jobCollection }

    res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`);

    res.json(json);
}

