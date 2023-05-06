import { notion } from "./client";
import { formatNotionRoute } from "./formatNotionRoute";
import pRetry from 'p-retry';

const getPageIDFromBlockChildren = async (blockId: string, pages: Set<string>, route: string[]) : Promise<{ pageId: string, route: string[] }[]> => {
    const { results } = await pRetry(async () => {
        return await notion.blocks.children.list({
            block_id: blockId,
            page_size: undefined
        })
    }, { retries: 3, minTimeout: 3000 });

    const page = await pRetry(async () => {
        return await notion.pages.retrieve({ page_id: blockId });
    }, { retries: 3, minTimeout: 3000 });
    
    const pageName = (page as any)?.properties?.title?.title?.[0]?.plain_text; 
    if (!!pageName && typeof pageName === "string") route.push(pageName.toLowerCase());

    const childPagesSet = new Set<string>();
    
    results.forEach(((result: any) => {
        switch (result.type) {
            case "child_page":
                if (!pages.has(result.id)) {
                    childPagesSet.add(result.id);
                    pages.add(result.id);
                }
                break;
            default:
                break
        }
    })); 
    
    // TODO: this may cause too many requests to Notion API at once.
    const nestedPages = await Promise.all(Array.from(childPagesSet).map(async (blockId)=> {
        return await getPageIDFromBlockChildren(blockId as string, pages, Array.from(route));
    }))

    return [ 
        {
            pageId: blockId, route,
        },
        ...nestedPages.flat()
    ]; 
};

export const getSiteMap = async (blockId: string) => {
    if (process.env.NODE_ENV === "development") return [];

    const pageIds = await getPageIDFromBlockChildren(blockId, new Set([ blockId ]), []);
    return pageIds.map(({ pageId, route }) => ({
        blockId: pageId,
        route: formatNotionRoute(route)
    }))
};