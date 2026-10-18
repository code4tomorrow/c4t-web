import type { BioBlock, BioSpan } from "common/interfaces/directory";

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
export const isWorkingDoc = (pageChildren: any): boolean =>
    (pageChildren?.results || []).some((block: any) => block?.type === "to_do");

export const toBio = (pageChildren: any): BioBlock[] => {
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
