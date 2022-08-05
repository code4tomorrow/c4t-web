import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { graphQLClient } from "@utils/contentful";

const jobQuery = gql`
    query($jobId:String!) {
        job(id:$jobId) {
            title,
            faction,
            description {
                json
            }
            skills,
            sys {
                id
            }
        }
    }
`

const CACHE_TTL = 60 * 10; 

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const jobId = req.query.jobId;

    if (!jobId) {
        res.status(400).send("Job ID not found.");
        return; 
    }

    const response = await graphQLClient.request(jobQuery, { jobId }).catch(_e => null);
    if (response === null) {
        res.status(500).json(null);
        return; 
    }
    const job = response.job; 

    if (!job) {
        res.status(400).send("Job ID not found.");
        return; 
    }

    res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate`);
    res.json(job);
}

