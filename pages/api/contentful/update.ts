
import type { NextApiRequest, NextApiResponse } from 'next'
require("dotenv").config();

type Data = {
    revalidated: boolean; 
    message?: string; 
    error?: boolean; 
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Invalid HTTP Method", revalidated: false, error: false });
    }

    const token = req.headers.authorization?.slice(7);

    if (!token || token !== process.env.C4T_FORCE_REVALIDATE_TOKEN) {
        return res.status(401).json({ message: 'Invalid token', revalidated: false, error: false })
    }

    try {
        console.log("Body: ", req.body);
        console.log("Query: ", req.query);

        await res.revalidate('/courses')
        return res.json({ revalidated: true, error: false })
    } catch (err) {
        return res.status(500).send({ revalidated: false, error: true });
    }
}
