import { notionColorMap } from "common/maps/color";
import config from "config";
import { notion } from "./client";

export interface IDirectoryItem {
    name: string | null; 
    color: string | null; 
}

export interface IDirectoryRow {
    name: string | null;
    position: IDirectoryItem | null,
    department: IDirectoryItem[] | null,
    projects: IDirectoryItem[] | null,
    state: IDirectoryItem | null,
    country: IDirectoryItem | null
}

// Team Directory Notion Database UUID
const databaseId = config.notion.directoryDatabaseId;

export const getDirectory = async () : Promise<IDirectoryRow[]> => {
    let data; 

    try {
        data = await notion.databases.query({
          database_id: databaseId,
          start_cursor: undefined,
          sorts: [{ 
            property: "Position", direction: "ascending"
        }]
        });
    } catch (e:any) {
        return [];
    }
  
      // Filters any rows with "Status" field as null
    const filteredResults = data?.results?.filter((row) => {
        const properties = (row as any).properties;
        return properties?.Status?.[properties?.Status?.type] !== null;
    });
  
    // Extracts data from Notion API response and maps fields to reduce unnecessary data
    const rows = filteredResults?.map((row) => {
        const properties = (row as any).properties;
        
        const country = properties?.Country?.[properties?.Country?.type]; 
        const position = properties?.Position?.[properties?.Position?.type]; 
        const state = properties?.["State/Province"][properties?.["State/Province"]?.type]; 
        const department = properties?.Department?.[properties?.Department?.type] || []; 
        const projects =  properties?.Projects?.[properties?.Projects?.type];

        return {
            name: properties?.Name?.title[0]?.text.content || null,
            position: {
                name: position?.name || null,
                color: position?.color ? notionColorMap(position.color) : null
            },
            department: department.map(({ name = null, color = null } : IDirectoryItem) => ({ 
                name, color: color ? notionColorMap(color) : null
            })),
            projects:  projects.map(({ name = null, color = null } : IDirectoryItem) => ({
                name, color: color ? notionColorMap(color) : null
            })),
            state: {
                name: state?.name || null,
                color: state?.color ? notionColorMap(state.color) : null
            },
            country: {
                name: country?.name || null,
                color: country?.color ? notionColorMap(country.color) : null
            },
        };
    });
  
    return rows;
}