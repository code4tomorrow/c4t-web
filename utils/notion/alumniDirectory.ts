import { notionColorMap } from "common/maps/color";
import config from "config";
import { notion } from "./client";
import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

export interface IAlumniDirectoryItem {
    name: string | null;
    color: string | null;
}

export interface IAlumniDirectoryRow {
    name: string | null;
    former_position: IAlumniDirectoryItem | null;
    former_projects: IAlumniDirectoryItem[] | null;
    graduation_year: string | null;
    college: IAlumniDirectoryItem | null;
    country: IAlumniDirectoryItem | null;
    page_children: ListBlockChildrenResponse | null;
}

// Team Directory Notion Database UUID
const databaseId = config.notion.alumniDirectoryDatabaseId;

export const getAlumniDirectory = async (): Promise<IAlumniDirectoryRow[]> => {
    let data;

    try {
        data = await notion.databases.query({
            database_id: databaseId,
            start_cursor: undefined,
            sorts: [
                {
                    property: "C4T Graduating Year",
                    direction: "descending",
                },
            ]
        });
    } catch (e: any) {
        return [];
    }


    

    // Filters any rows with "Status" field as null
    const filteredResults = data?.results?.filter((row) => {
        const properties = (row as any).properties;
        return (
            properties?.Status?.[properties?.Status?.type] !== null &&
            (row as any).archived === false
        );
    });

    // Extracts data from Notion API response and maps fields to reduce unnecessary data
    const rows = filteredResults?.map(async (row) => {
        const properties = (row as any).properties;

        const country = properties?.Country?.[properties?.Country?.type];
        const former_position = properties?.["Former Position"]?.[properties?.["Former Position"]?.type];
        const college = properties?.College?.[properties?.College?.type]
        const former_projects = properties?.["Former Projects"]?.[properties?.["Former Projects"]?.type] || [];

        let pageContents : ListBlockChildrenResponse;
        try{
            pageContents = await notion.blocks.children.list({
                block_id: row.id
            });
        }catch (e: any) {
            return [];
        }

        

        return {
            name: properties?.Name?.title[0]?.text.content || null,
            graduation_year: properties?.["C4T Graduating Year"]?.number || null,
            former_position: {
                name: former_position?.name || null,
                color: former_position?.color ? notionColorMap(former_position.color) : null,
            },
            former_projects: former_projects.map(
                ({ name = null, color = null }: IAlumniDirectoryItem) => ({
                    name,
                    color: color ? notionColorMap(color) : null,
                })
            ),
            college: {
                name: college?.name || null,
                color: college?.color ? notionColorMap(college.color) : null,
            },
            country: {
                name: country?.name || null,
                color: country?.color ? notionColorMap(country.color) : null,
            },
            page_children: await pageContents || null,
        };
    });

    const resolvedRows = await Promise.all(rows);

    return resolvedRows.filter(Boolean) as IAlumniDirectoryRow[];
};
