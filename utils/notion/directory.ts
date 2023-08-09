import { notionColorMap } from "common/maps/color";
import config from "config";
import { notion } from "./client";
import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

export interface IDirectoryItem {
    name: string | null;
    color: string | null;
}

export interface IDirectoryRow {
    name: string | null;
    position: IDirectoryItem | null;
    department: IDirectoryItem[] | null;
    projects: IDirectoryItem[] | null;
    state: IDirectoryItem | null;
    country: IDirectoryItem | null;
    page_children: ListBlockChildrenResponse | null;

}

// Team Directory Notion Database UUID
const databaseId = config.notion.directoryDatabaseId;

export const getDirectory = async (): Promise<IDirectoryRow[]> => {
    let data;

    try {
        data = await notion.databases.query({
            database_id: databaseId,
            start_cursor: undefined,
            sorts: [
                {
                    property: "Position",
                    direction: "ascending",
                },
            ],
            filter: {
                or: [
                    {
                        property: "Status",
                        select: {
                            equals: "Active",
                        },
                        type: "select",
                    },
                    {
                        property: "Status",
                        select: {
                            equals: "On Break",
                        },
                        type: "select",
                    },
                ],
            },
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
        const position = properties?.Position?.[properties?.Position?.type];
        const state =
            properties?.["State/Province"][
                properties?.["State/Province"]?.type
            ];
        const department =
            properties?.Department?.[properties?.Department?.type] || [];
        const projects = properties?.Projects?.[properties?.Projects?.type];

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
            position: {
                name: position?.name || null,
                color: position?.color ? notionColorMap(position.color) : null,
            },
            department: department.map(
                ({ name = null, color = null }: IDirectoryItem) => ({
                    name,
                    color: color ? notionColorMap(color) : null,
                })
            ),
            projects: projects.map(
                ({ name = null, color = null }: IDirectoryItem) => ({
                    name,
                    color: color ? notionColorMap(color) : null,
                })
            ),
            state: {
                name: state?.name || null,
                color: state?.color ? notionColorMap(state.color) : null,
            },
            country: {
                name: country?.name || null,
                color: country?.color ? notionColorMap(country.color) : null,
            },
            page_children: await pageContents || null,
        };
    });

    const resolvedRows = await Promise.all(rows);

    return resolvedRows.filter(Boolean) as IDirectoryRow[];
};
