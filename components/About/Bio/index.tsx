import type { BioBlock, BioSpan } from "common/interfaces/directory";
import React from "react";

/**
 * Renders a directory member's biography.
 *
 * Bios used to be raw Notion blocks handed to `notion-block-renderer` at
 * runtime. They are now a small, closed set of shapes produced by
 * scripts/snapshot-directory.ts, so a ~40-line component covers every case and
 * the site ships no Notion code to the browser.
 */

const Span: React.FC<{ span: BioSpan }> = ({ span }) => {
    let content: React.ReactNode = span.text;

    if (span.code) {
        content = (
            <code className="rounded bg-white/10 px-1 py-0.5 text-[0.9em]">
                {content}
            </code>
        );
    }
    if (span.bold) content = <strong>{content}</strong>;
    if (span.italic) content = <em>{content}</em>;

    if (span.href) {
        return (
            <a
                href={span.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-purple-secondary underline underline-offset-2 hover:text-white"
            >
                {content}
            </a>
        );
    }

    return <>{content}</>;
};

const Spans: React.FC<{ spans: BioSpan[] }> = ({ spans }) => (
    <>
        {spans.map((span, index) => (
            <Span key={index} span={span} />
        ))}
    </>
);

const Bio: React.FC<{ blocks: BioBlock[] }> = ({ blocks }) => {
    if (!blocks?.length) return null;

    const nodes: React.ReactNode[] = [];

    // Consecutive bullets belong to one list, so they are gathered rather than
    // emitted as a run of single-item lists.
    for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index];

        if (block.type === "bullet") {
            const items: BioBlock[] = [];
            while (index < blocks.length && blocks[index].type === "bullet") {
                items.push(blocks[index]);
                index += 1;
            }
            index -= 1;

            nodes.push(
                <ul
                    key={`list-${index}`}
                    className="list-outside list-disc space-y-1 pl-5 text-sm leading-6 text-[#C7C3CE]"
                >
                    {items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                            <Spans spans={item.spans} />
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        if (block.type === "heading") {
            nodes.push(
                <h3
                    key={index}
                    className="pt-1 text-base font-bold text-white first:pt-0"
                >
                    <Spans spans={block.spans} />
                </h3>
            );
            continue;
        }

        nodes.push(
            <p key={index} className="text-sm leading-6 text-[#C7C3CE]">
                <Spans spans={block.spans} />
            </p>
        );
    }

    return <div className="flex w-full flex-col gap-2 text-left">{nodes}</div>;
};

export default Bio;
