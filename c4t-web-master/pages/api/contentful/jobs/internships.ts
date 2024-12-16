import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { graphQLClient, IPagination } from "@utils/contentful";
import { IJobPreview } from "common/interfaces/job";

const internshipsQuery = gql`
    query ($limit: Int!, $skip: Int!, $preview: Boolean!) {
        internshipCollection(limit: $limit, skip: $skip, preview: $preview) {
            items {
                sys {
                    id
                }
                timeCommitment {
                    json
                }
                description {
                    json
                }
                startDate
                endDate
                skills {
                    json
                }
                responsibilities {
                    json
                }
                realLifeJobConnection {
                    json
                }
                title
                realLifeJobs
            }
            total
            skip
            limit
        }
    }
`;

const CACHE_TTL = 60 * 1; // 60 seconds;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IPagination<IJobPreview>>
) {
    const limit = parseInt(req.query.limit as string) || 5;
    const page = parseInt(req.query.page as string) || 0;

    const response = await graphQLClient.request(internshipsQuery, {
        limit,
        skip: page * limit,
        preview: process.env.NODE_ENV !== "production",
    });

    const json = { items: [], ...response?.internshipCollection };

    res.setHeader(
        "Cache-Control",
        `s-maxage=${CACHE_TTL}, stale-while-revalidate`
    );

    res.json(json);
}
