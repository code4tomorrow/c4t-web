/**
 * Exports the team and alumni directories from Notion into version-controlled
 * JSON under data/.
 *
 * /about reads Notion live, and serves this snapshot only when Notion is
 * unreachable or NOTION_API_KEY is unset. Re-run it now and then so that
 * fallback stays close to the real roster:
 *   npm run snapshot:directory
 */
import "dotenv/config";
import { writeFileSync } from "fs";
import { join } from "path";
import type { BioBlock } from "../common/interfaces/directory";
import { getAlumniDirectory } from "../lib/notion/alumniDirectory";
import { toBio, isWorkingDoc } from "../lib/notion/bio";
import { getDirectory } from "../lib/notion/directory";

const main = async () => {
    if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY is required to refresh the snapshot.");
    }

    const [team, alumni] = await Promise.all([
        getDirectory(),
        getAlumniDirectory(),
    ]);

    // getDirectory swallows API errors and returns []. Failing loudly here
    // stops a bad run from silently emptying the About page.
    if (!team.length) throw new Error("Team directory came back empty.");
    if (!alumni.length) throw new Error("Alumni directory came back empty.");

    const teamRows = team.map(({ page_children, ...row }) => ({
        ...row,
        bio: toBio(page_children),
    }));
    const alumniRows = alumni.map(({ page_children, ...row }) => ({
        ...row,
        bio: toBio(page_children),
    }));

    // Surface pages that look like working docs rather than biographies, so a
    // roster refresh does not quietly republish internal notes.
    const checklistPages = [...team, ...alumni]
        .filter((row) => isWorkingDoc(row.page_children))
        .map((row: any) => row.name);
    if (checklistPages.length) {
        console.warn(
            `! Skipped checklists on: ${checklistPages.join(
                ", "
            )}. Those Notion pages hold internal notes, not bios, so no bio is published for them. Clear them in Notion if that is wrong.`
        );
    }

    const write = (file: string, rows: unknown[]) =>
        writeFileSync(
            join(process.cwd(), "data", file),
            `${JSON.stringify(
                { generatedAt: new Date().toISOString(), rows },
                null,
                2
            )}\n`
        );

    write("team-directory.json", teamRows);
    write("alumni-directory.json", alumniRows);

    const withBios = (rows: { bio: BioBlock[] }[]) =>
        rows.filter((row) => row.bio.length).length;

    console.log(
        `✓ team: ${teamRows.length} rows (${withBios(teamRows)} with bios)`
    );
    console.log(
        `✓ alumni: ${alumniRows.length} rows (${withBios(
            alumniRows
        )} with bios)`
    );
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
