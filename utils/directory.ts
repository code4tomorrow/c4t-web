import alumniSnapshot from "data/alumni-directory.json";
import teamSnapshot from "data/team-directory.json";
import type {
    IAlumniDirectoryRow,
    IDirectoryRow,
} from "common/interfaces/directory";

/**
 * Team and alumni directories, read from a version-controlled snapshot.
 *
 * These were live Notion API queries on every ISR revalidation of /about, which
 * meant a public page could break because a third-party API was slow or a token
 * had expired. The roster changes a few times a year, so the data is checked in
 * instead — refresh it with `npm run snapshot:directory`.
 */

export const getDirectory = (): IDirectoryRow[] =>
    teamSnapshot.rows as IDirectoryRow[];

export const getAlumniDirectory = (): IAlumniDirectoryRow[] =>
    alumniSnapshot.rows as IAlumniDirectoryRow[];

/** When the checked-in snapshot was last refreshed, for display on /about. */
export const getDirectoryGeneratedAt = (): string => teamSnapshot.generatedAt;
