import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { gql } from "graphql-request";
import { graphQLHTTPRequest } from "@utils/contentful";

const jobQuery = gql`
    query($jobId:String!) {
        job(id:$jobId) {
            title,
            faction,
            realLifeJobs,
            realLifeJobConnection {
                json
            },
            description {
                json
            }
            skills {
                json
            },
            sys {
                id
            },
            responsibilities {
                json
            }
        }
    }
`

const CACHE_TTL = 60 * 10; 

export default async function handler(
    req: NextRequest,
    _ctx: NextFetchEvent
  ) {

    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) {
        return NextResponse.next({
            status: 400,
            statusText: "Job ID not found."
        })
    
    }

    const contentfulResponse = await graphQLHTTPRequest(jobQuery, { jobId });
    if (!contentfulResponse) {
        return NextResponse.next({
            status: 500,
            statusText: "Internal Server Error. Failed to fetch job information.",
        });
    }
    const job = contentfulResponse.data.job; 

    if (!job) {
        return NextResponse.next({
            status: 400,
            statusText: "Job ID not found.",
        });
    }

    const response = NextResponse.json(job);
    response.headers.set('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`);

    return response; 
}

export const config = {
    runtime: 'edge',
};
