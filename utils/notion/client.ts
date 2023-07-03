import { Client } from "@notionhq/client";
require("dotenv").config();

/**
 * Initialize Notion API Client using Notion Integration API Key
 */

export const notion = new Client({ auth: process.env.NOTION_API_KEY });
