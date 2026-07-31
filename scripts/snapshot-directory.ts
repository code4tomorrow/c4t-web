/**
 * Exports the team and alumni directories from Notion into version-controlled
 * JSON under data/.
 *
 * The site used to query Notion on every ISR revalidation of /about, which made
 * a public page depend on a third-party API being reachable and on a secret
 * being present at build time. The roster changes a few times a year, so a
 * checked-in snapshot is faster, cheaper, and cannot break in production.
 *
 * Re-run when the roster changes:
 *   npx tsx scripts/snapshot-directory.ts
 *
 * This is the ONLY code left that talks to Notion, and it never runs during a
 * build or a request — it is a developer tool.
 */
import { writeFileSync } from "fs";
import { join } from "path";
import type { BioBlock, BioSpan } from "../common/interfaces/directory";
import { getAlumniDirectory } from "./notion/alumniDirectory";
import { getDirectory } from "./notion/directory";

/**
 * Collapses Notion's rich-text array into the small span shape the site
 * renders. Only the annotations existing bios actually use are kept; anything
 * else degrades to plain text rather than being dropped.
 */
const toSpans = (richText: any[]): BioSpan[] =>
    (richText || [])
        .map((node) => {
            const text: string = node?.plain_text ?? "";
            if (!text) return null;
            const annotations = node?.annotations || {};
            const span: BioSpan = { text };
            if (annotations.bold) span.bold = true;
            if (annotations.italic) span.italic = true;
            if (annotations.code) span.code = true;
            if (node?.href) span.href = node.href;
            return span;
        })
        .filter((span): span is BioSpan => span !== null);

/** Notion block type -> the handful of shapes the bio panel knows how to draw. */
const BLOCK_TYPES: Record<string, BioBlock["type"]> = {
    heading_1: "heading",
    heading_2: "heading",
    heading_3: "heading",
    paragraph: "paragraph",
    bulleted_list_item: "bullet",
    numbered_list_item: "bullet",
};

/**
 * A checklist is the tell-tale sign that a directory page is being used as an
 * internal working doc rather than a biography — one was tracking meeting
 * attendance, and the old renderer published it on the public About page.
 * Dropping only the checkboxes would leave their headings behind ("Log the
 * attendance below…"), so the whole page is discarded instead.
 */
const isWorkingDoc = (pageChildren: any): boolean =>
    (pageChildren?.results || []).some((block: any) => block?.type === "to_do");

const toBio = (pageChildren: any): BioBlock[] => {
    if (isWorkingDoc(pageChildren)) return [];

    return (pageChildren?.results || [])
        .map((block: any) => {
            const type = BLOCK_TYPES[block?.type];
            if (!type) return null;
            const spans = toSpans(block?.[block.type]?.rich_text);
            // An empty paragraph is Notion's blank line; it carries no meaning
            // once the layout supplies its own spacing.
            return spans.length ? { type, spans } : null;
        })
        .filter((block: BioBlock | null): block is BioBlock => block !== null);
};

const main = async () => {
    if (!process.env.NOTION_API_KEY) {
        throw new Error(
            "NOTION_API_KEY is required to refresh the snapshot. It is only needed here, never at build or request time."
        );
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
        .filter((row: any) =>
            ((row.page_children as any)?.results || []).some(
                (block: any) => block?.type === "to_do"
            )
        )
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
        `✓ alumni: ${alumniRows.length} rows (${withBios(alumniRows)} with bios)`
    );
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
