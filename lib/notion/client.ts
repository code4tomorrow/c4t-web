import { Client } from "@notionhq/client";

/**
 * Notion API client, authenticated with the integration key.
 *
 * NOTION_API_KEY is read by the /about page (team and alumni directories) and
 * by `npm run snapshot:directory`. Without it the page serves the checked-in
 * snapshot in data/ instead.
 */
export const notion = new Client({ auth: process.env.NOTION_API_KEY });
