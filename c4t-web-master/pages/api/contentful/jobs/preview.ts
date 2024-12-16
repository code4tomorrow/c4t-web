import { gql } from "graphql-request";
import { graphQLHTTPRequest } from "@utils/contentful";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { IJob } from "common/interfaces/job";

const jobPreviewQuery = gql`
    query ($limit: Int!, $skip: Int!) {
        jobCollection(limit: $limit, skip: $skip) {
            items {
                sys {
                    id
                }
                title
                faction
                realLifeJobs
            }
            total
            skip
            limit
        }
    }
`;

const CACHE_TTL = 60 * 1; // 60 seconds

export default async function handler(req: NextRequest, _ctx: NextFetchEvent) {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "5");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");

    const contentfulResponse = await graphQLHTTPRequest<{
        jobCollection: IJob[];
    }>(jobPreviewQuery, {
        limit,
        skip: page * limit,
    });

    const json = {
        items: [],
        ...(contentfulResponse?.data?.jobCollection || {}),
    };

    const response = NextResponse.json(json);
    response.headers.set(
        "Cache-Control",
        `s-maxage=${CACHE_TTL}, stale-while-revalidate`
    );

    return response;
}

export const config = {
    runtime: "edge",
};
