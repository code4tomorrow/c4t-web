import alumniSnapshot from "data/alumni-directory.json";
import teamSnapshot from "data/team-directory.json";
import { toBio } from "lib/notion/bio";
import type {
    IAlumniDirectoryRow,
    IDirectoryRow,
} from "common/interfaces/directory";

/**
 * Team and alumni directories for /about.
 *
 * Read live from Notion on each ISR revalidation, so a role or roster change
 * made in Notion reaches the site within the page's revalidate window. If
 * NOTION_API_KEY is unset, Notion is slow or down, or a query comes back empty,
 * the checked-in snapshot in data/ is served instead, so the page never breaks
 * or empties because of Notion. Refresh that fallback with
 * `npm run snapshot:directory`.
 */

const NOTION_TIMEOUT_MS = 20_000;

const snapshotTeam = () => teamSnapshot.rows as IDirectoryRow[];
const snapshotAlumni = () => alumniSnapshot.rows as IAlumniDirectoryRow[];

const withTimeout = <T>(promise: Promise<T>): Promise<T> =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error("Notion request timed out")),
            NOTION_TIMEOUT_MS
        );
        promise.then(resolve, reject).finally(() => clearTimeout(timer));
    });

/**
 * Runs a live Notion read, falling back to the snapshot on any failure. The
 * Notion modules are imported lazily so a build without a key never loads them.
 */
const liveOrSnapshot = async <T>(
    label: string,
    read: () => Promise<T[]>,
    snapshot: () => T[]
): Promise<T[]> => {
    if (!process.env.NOTION_API_KEY) return snapshot();
    try {
        const rows = await withTimeout(read());
        if (rows.length) return rows;
        console.warn(
            `[directory] ${label}: Notion returned no rows; using snapshot.`
        );
    } catch (error) {
        console.warn(
            `[directory] ${label}: Notion read failed; using snapshot.`,
            error
        );
    }
    return snapshot();
};

export const getDirectory = (): Promise<IDirectoryRow[]> =>
    liveOrSnapshot(
        "team",
        async () => {
            const { getDirectory: readTeam } = await import(
                "lib/notion/directory"
            );
            return (await readTeam()).map(({ page_children, ...row }) => ({
                ...row,
                bio: toBio(page_children),
            }));
        },
        snapshotTeam
    );

export const getAlumniDirectory = (): Promise<IAlumniDirectoryRow[]> =>
    liveOrSnapshot(
        "alumni",
        async () => {
            const { getAlumniDirectory: readAlumni } = await import(
                "lib/notion/alumniDirectory"
            );
            return (await readAlumni()).map(({ page_children, ...row }) => ({
                ...row,
                bio: toBio(page_children),
            }));
        },
        snapshotAlumni
    );
