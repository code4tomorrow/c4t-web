/**
 * Shapes for the team and alumni directories rendered on /about.
 *
 * The data is a build-time-free snapshot in data/*.json, produced by
 * scripts/snapshot-directory.ts. These types are the contract between that
 * script and the page, so nothing here may reference Notion's SDK types.
 */

export interface IDirectoryItem {
    name: string | null;
    color: string | null;
}

/** One run of text inside a bio, with only the styling bios actually use. */
export interface BioSpan {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    href?: string;
}

export interface BioBlock {
    type: "heading" | "paragraph" | "bullet";
    spans: BioSpan[];
}

export interface IDirectoryRow {
    name: string | null;
    position: IDirectoryItem | null;
    department: IDirectoryItem[] | null;
    projects: IDirectoryItem[] | null;
    state: IDirectoryItem | null;
    country: IDirectoryItem | null;
    bio: BioBlock[];
}

export interface IAlumniDirectoryRow {
    name: string | null;
    former_position: IDirectoryItem | null;
    former_projects: IDirectoryItem[] | null;
    graduation_year: string | null;
    college: IDirectoryItem | null;
    country: IDirectoryItem | null;
    bio: BioBlock[];
}
