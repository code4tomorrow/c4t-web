import React, { useEffect, useState } from "react";
import type { LessonTocEntry } from "lib/lesson-content";

/** "On this page" list for a lesson, highlighting the section in view. */
const LessonToc: React.FC<{ toc: LessonTocEntry[] }> = ({ toc }) => {
    const [active, setActive] = useState<string | null>(toc[0]?.id ?? null);

    useEffect(() => {
        const headings = toc
            .map((entry) => document.getElementById(entry.id))
            .filter((element): element is HTMLElement => Boolean(element));
        if (!headings.length || !("IntersectionObserver" in window))
            return undefined;
        const visible = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting)
                        visible.set(
                            entry.target.id,
                            entry.boundingClientRect.top
                        );
                    else visible.delete(entry.target.id);
                });
                const ids = toc.map((entry) => entry.id);
                const first = ids.find((id) => visible.has(id));
                if (first) setActive(first);
            },
            { rootMargin: "-80px 0px -60% 0px" }
        );
        headings.forEach((heading) => observer.observe(heading));
        return () => observer.disconnect();
    }, [toc]);

    return (
        <nav aria-label="On this page" className="lesson-toc">
            <p className="lesson-toc__title">On this page</p>
            <ol>
                {toc.map((entry) => (
                    <li
                        key={entry.id}
                        className={entry.level === 3 ? "is-sub" : undefined}
                    >
                        <a
                            href={`#${entry.id}`}
                            className={
                                active === entry.id ? "is-active" : undefined
                            }
                        >
                            {entry.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default LessonToc;
