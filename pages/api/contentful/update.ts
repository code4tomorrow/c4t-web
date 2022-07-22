
import { ContentModelID } from '@utils/contentful';
import { Pages } from 'common/enums/pages';
import type { NextApiRequest, NextApiResponse } from 'next'
require("dotenv").config();

type Data = {
    revalidatedPages: string[]; 
    message?: string; 
    error?: boolean; 
}

async function attemptRevalidation(res:NextApiResponse<Data>, page:Pages) : Promise<boolean> {
    const success = await res.revalidate(page)
        .then(() => true)
        .catch(err => {
            console.log(`Failed to revalidate ${page}\n`, err);
            return false; 
        });
    return success; 
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Invalid HTTP Method", revalidatedPages: [], error: false });
    }

    const token = req.headers.authorization?.slice(7);

    if (!token || token !== process.env.C4T_FORCE_REVALIDATE_TOKEN) {
        return res.status(401).json({ message: 'Invalid token', revalidatedPages: [], error: false })
    }

    let pagesRevalidated:string[] = [];

    try {
        const modelId = req.body?.sys?.contentType?.sys?.id;

        if ([ ContentModelID.COURSE, ContentModelID.PROMOTIONAL_LABEL ].includes(modelId)) {
            await attemptRevalidation(res, Pages.COURSES) && pagesRevalidated.push(Pages.COURSES);
        }

        if ([ ContentModelID.FAQ ].includes(modelId)) {
            await attemptRevalidation(res, Pages.LEARN) && pagesRevalidated.push(Pages.LEARN);
        }
        
        if ([ ContentModelID.VOLUNTEER_OPPORTUNITY ].includes(modelId)) {
            await attemptRevalidation(res, Pages.VOLUNTEER) && pagesRevalidated.push(Pages.VOLUNTEER);
        }

        if ([ ContentModelID.NOTIFICATION_FLAG].includes(modelId)) {
            const pageLocales = req.body.fields.pages;
            
            let validPages = [];
            for (const pageLocale in pageLocales) {
                const pages = pageLocales[pageLocale];
                const validatedPages = pages.filter((page:Pages) => Object.values(Pages).includes(page))
                validPages.push(...validatedPages);
            }

            console.log(validPages);
            await Promise.all(validPages.map(async (page:Pages) => ( 
                await attemptRevalidation(res, page) && pagesRevalidated.push(page)
            )))
        }

        console.log("Model ID: ", modelId);
        console.log("Pages Revalidated: ", pagesRevalidated);
        return res.json({ revalidatedPages: pagesRevalidated, error: false })
    } catch (err) {
        return res.status(500).send({ revalidatedPages: [], error: true });
    }
}
