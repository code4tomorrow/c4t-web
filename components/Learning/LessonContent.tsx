import React, { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import TracePlayer, { type TraceData } from "./TracePlayer";

/**
 * Shows a compiled lesson (scripts/build-lesson-content.js) and brings its
 * blocks to life: videos load only when played, quizzes give instant
 * feedback, traces become step-through players, diagrams and Scratch blocks
 * render on demand, and code gets a copy button. Without JavaScript the
 * lesson still reads correctly.
 */

type Cleanup = () => void;

const TAB_KEY = "c4t-lesson-tab";
const readTab = () => {
    try {
        return window.localStorage.getItem(TAB_KEY);
    } catch {
        return null;
    }
};
const saveTab = (label: string) => {
    try {
        window.localStorage.setItem(TAB_KEY, label);
    } catch {
        /* private mode: the choice just isn't remembered */
    }
};

/** Marks an element as enhanced; false if it already was (effects can run twice). */
const claim = (element: HTMLElement, key: string) => {
    if (element.dataset[key]) return false;
    element.dataset[key] = "1";
    return true;
};

const whenNear = (
    elements: Element[],
    callback: (element: Element) => void
): Cleanup => {
    if (!elements.length) return () => undefined;
    if (!("IntersectionObserver" in window)) {
        elements.forEach(callback);
        return () => undefined;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    callback(entry.target);
                }
            });
        },
        { rootMargin: "400px 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
};

const enhanceVideos = (root: HTMLElement) => {
    root.querySelectorAll<HTMLAnchorElement>(".lesson-video__frame").forEach(
        (frame) => {
            if (!claim(frame, "enhanced")) return;
            frame.addEventListener("click", (event) => {
                const figure = frame.closest<HTMLElement>(".lesson-video");
                if (!figure || event.metaKey || event.ctrlKey || event.shiftKey)
                    return;
                event.preventDefault();
                const id = figure.dataset.video;
                const start = Number(figure.dataset.start || 0);
                const iframe = document.createElement("iframe");
                iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${
                    start ? `&start=${start}` : ""
                }`;
                iframe.title =
                    frame
                        .getAttribute("aria-label")
                        ?.replace(/^Play video: /, "") || "Video";
                iframe.allow =
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                iframe.allowFullscreen = true;
                iframe.referrerPolicy = "strict-origin-when-cross-origin";
                iframe.className = "lesson-video__iframe";
                const holder = document.createElement("div");
                holder.className = "lesson-video__frame is-playing";
                holder.appendChild(iframe);
                frame.replaceWith(holder);
                iframe.focus();
            });
        }
    );
};

const enhanceQuizzes = (root: HTMLElement) => {
    root.querySelectorAll<HTMLElement>("[data-quiz]").forEach((quiz) => {
        if (!claim(quiz, "enhanced")) return;
        quiz.classList.add("is-interactive");
        const questions = Array.from(
            quiz.querySelectorAll<HTMLElement>("[data-question]")
        );
        const score = quiz.querySelector<HTMLElement>("[data-score]");
        const firstTry = new Map<HTMLElement, boolean>();
        const update = () => {
            if (!score) return;
            const answered = questions.filter((question) =>
                question.classList.contains("is-solved")
            );
            if (answered.length < questions.length) {
                score.textContent = `${answered.length} of ${questions.length} answered`;
                return;
            }
            const right = questions.filter((question) =>
                firstTry.get(question)
            ).length;
            score.textContent =
                right === questions.length
                    ? `All ${questions.length} right on the first try`
                    : `${right} of ${questions.length} right on the first try`;
            quiz.classList.add("is-complete");
        };
        questions.forEach((question) => {
            const options = Array.from(
                question.querySelectorAll<HTMLButtonElement>(
                    ".lesson-quiz__option"
                )
            );
            options.forEach((option) => {
                option.addEventListener("click", () => {
                    if (question.classList.contains("is-solved")) return;
                    const correct = option.dataset.correct === "true";
                    if (!firstTry.has(question))
                        firstTry.set(question, correct);
                    const why =
                        option.parentElement?.querySelector<HTMLElement>(
                            ".lesson-quiz__why"
                        );
                    if (why) why.hidden = false;
                    option.classList.remove("is-wrong");
                    // restart the shake animation
                    void option.offsetWidth;
                    option.classList.add(correct ? "is-right" : "is-wrong");
                    option.setAttribute("aria-pressed", "true");
                    if (correct) {
                        question.classList.add("is-solved");
                        options.forEach((other) => {
                            if (other !== option) other.disabled = true;
                        });
                    }
                    update();
                });
            });
        });
        update();
    });
};

const enhanceTabs = (root: HTMLElement) => {
    const groups = Array.from(
        root.querySelectorAll<HTMLElement>("[data-tabs]")
    );
    const selectAll = (label: string) =>
        groups.forEach((group) => {
            const select = (
                group as HTMLElement & {
                    selectTab?: (value: string) => boolean;
                }
            ).selectTab;
            select?.(label);
        });
    groups.forEach((group, groupIndex) => {
        if (!claim(group, "enhanced")) return;
        const panels = Array.from(
            group.querySelectorAll<HTMLElement>(".lesson-tabs__panel")
        );
        const list = document.createElement("div");
        list.className = "lesson-tabs__list";
        list.setAttribute("role", "tablist");
        const buttons = panels.map((panel, index) => {
            const label = panel.dataset.tab || `Tab ${index + 1}`;
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.setAttribute("role", "tab");
            button.id = `tabs-${groupIndex}-${index}`;
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", button.id);
            button.addEventListener("click", () => {
                saveTab(label);
                selectAll(label);
            });
            button.addEventListener("keydown", (event) => {
                const step =
                    event.key === "ArrowRight"
                        ? 1
                        : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                if (!step) return;
                const next =
                    buttons[(index + step + buttons.length) % buttons.length];
                next.focus();
                next.click();
            });
            list.appendChild(button);
            return button;
        });
        const select = (label: string) => {
            const index = panels.findIndex(
                (panel) => panel.dataset.tab === label
            );
            if (index < 0) return false;
            panels.forEach((panel, position) => {
                panel.hidden = position !== index;
                buttons[position].setAttribute(
                    "aria-selected",
                    String(position === index)
                );
                buttons[position].tabIndex = position === index ? 0 : -1;
            });
            return true;
        };
        (
            group as HTMLElement & { selectTab?: (value: string) => boolean }
        ).selectTab = select;
        group.prepend(list);
        group.classList.add("is-interactive");
        const remembered = readTab();
        if (!remembered || !select(remembered))
            select(panels[0]?.dataset.tab || "");
    });
};

const enhanceTraces = (root: HTMLElement, roots: Root[]): Cleanup => {
    const mounts: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>("[data-trace]").forEach((figure) => {
        try {
            const data = JSON.parse(figure.dataset.trace || "") as TraceData;
            const mount = document.createElement("div");
            mount.className = "lesson-trace__player";
            figure.appendChild(mount);
            figure.classList.add("is-interactive");
            const reactRoot = createRoot(mount);
            reactRoot.render(<TracePlayer data={data} />);
            roots.push(reactRoot);
            mounts.push(mount);
        } catch {
            /* the static code stays visible */
        }
    });
    return () =>
        mounts.forEach((mount) => {
            mount.parentElement?.classList.remove("is-interactive");
            mount.remove();
        });
};

let mermaidReady: Promise<typeof import("mermaid").default> | null = null;
const loadMermaid = () => {
    if (!mermaidReady) {
        mermaidReady = import("mermaid").then(({ default: mermaid }) => {
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                theme: "base",
                fontFamily: "inherit",
                themeVariables: {
                    darkMode: true,
                    background: "#16151a",
                    primaryColor: "#262a45",
                    primaryTextColor: "#f4f3f7",
                    primaryBorderColor: "#7892ee",
                    secondaryColor: "#2b2338",
                    secondaryTextColor: "#f4f3f7",
                    secondaryBorderColor: "#b28cf5",
                    tertiaryColor: "#1d2b2a",
                    tertiaryTextColor: "#f4f3f7",
                    tertiaryBorderColor: "#4fd1a5",
                    lineColor: "#a5b8ff",
                    textColor: "#e8e6ee",
                    mainBkg: "#262a45",
                    nodeBorder: "#7892ee",
                    clusterBkg: "#1f1e26",
                    clusterBorder: "#3a3947",
                    edgeLabelBackground: "#1f1e26",
                    noteBkgColor: "#3a3320",
                    noteTextColor: "#fff4d6",
                    noteBorderColor: "#d8b44a",
                    actorBkg: "#262a45",
                    actorBorder: "#7892ee",
                    actorTextColor: "#f4f3f7",
                    signalColor: "#cfd8ff",
                    signalTextColor: "#f4f3f7",
                    labelBoxBkgColor: "#262a45",
                    labelTextColor: "#f4f3f7",
                    git0: "#7892ee",
                    git1: "#4fd1a5",
                    git2: "#f4a261",
                    git3: "#e76f9a",
                    gitBranchLabel0: "#ffffff",
                    gitBranchLabel1: "#0b1b16",
                    gitBranchLabel2: "#1d1206",
                    gitBranchLabel3: "#ffffff",
                    fontSize: "15px",
                },
            });
            return mermaid;
        });
    }
    return mermaidReady;
};

let diagramCount = 0;
const enhanceDiagrams = (root: HTMLElement): Cleanup =>
    whenNear(
        Array.from(root.querySelectorAll("[data-mermaid]")),
        async (element) => {
            const canvas = element as HTMLElement;
            try {
                const mermaid = await loadMermaid();
                diagramCount += 1;
                const { svg } = await mermaid.render(
                    `lesson-diagram-${diagramCount}`,
                    canvas.dataset.mermaid || ""
                );
                canvas.innerHTML = svg;
                canvas.classList.add("is-rendered");
            } catch {
                canvas.classList.add("is-failed");
            }
        }
    );

let scratchReady: Promise<{
    parse: (code: string, options: object) => unknown;
    render: (doc: unknown, options: object) => SVGElement;
}> | null = null;
const enhanceScratch = (root: HTMLElement): Cleanup =>
    whenNear(
        Array.from(root.querySelectorAll(".lesson-code--scratch")),
        async (element) => {
            const figure = element as HTMLElement;
            const code = figure.querySelector("code")?.textContent || "";
            try {
                if (!scratchReady) {
                    scratchReady = import("scratchblocks/browser.es.js").then(
                        (module) => module.default as never
                    );
                }
                const scratchblocks = await scratchReady;
                const doc = scratchblocks.parse(code, { languages: ["en"] });
                const svg = scratchblocks.render(doc, {
                    style: "scratch3",
                    scale: 0.8,
                });
                const holder = document.createElement("div");
                holder.className = "lesson-scratch";
                holder.setAttribute("role", "img");
                holder.setAttribute(
                    "aria-label",
                    `Scratch blocks: ${code.replace(/\s+/g, " ").trim()}`
                );
                holder.appendChild(svg);
                figure.querySelector("pre")?.replaceWith(holder);
                figure.classList.add("is-rendered");
            } catch (error) {
                // keep the text version
                if (process.env.NODE_ENV !== "production") console.warn("scratchblocks", error);
            }
        }
    );

const enhanceCode = (root: HTMLElement) => {
    root.querySelectorAll<HTMLElement>(
        ".lesson-code:not(.lesson-code--output):not(.lesson-code--scratch)"
    ).forEach((figure) => {
        const caption = figure.querySelector("figcaption");
        const code = figure.querySelector("code");
        if (!caption || !code || caption.querySelector(".lesson-copy")) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-copy";
        button.textContent = "Copy";
        button.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(code.textContent || "");
                button.textContent = "Copied ✓";
            } catch {
                button.textContent = "Select and copy";
            }
            window.setTimeout(() => {
                button.textContent = "Copy";
            }, 1600);
        });
        caption.appendChild(button);
    });
};

const REVEAL =
    ".lesson-video, .lesson-diagram, .lesson-trace, .lesson-chart, .lesson-quiz, .lesson-cell, .lesson-box, .lesson-callout, .lesson-preview, .lesson-image";
const enhanceReveal = (root: HTMLElement): Cleanup => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return () => undefined;
    const below = Array.from(root.querySelectorAll<HTMLElement>(REVEAL)).filter(
        (element) => element.getBoundingClientRect().top > window.innerHeight
    );
    below.forEach((element) => element.classList.add("lesson-reveal"));
    return whenNear(below, (element) => element.classList.add("is-visible"));
};

const LessonContent: React.FC<{ html: string; className?: string }> = ({
    html,
    className = "",
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return undefined;
        const roots: Root[] = [];
        const cleanups: Cleanup[] = [];
        enhanceVideos(root);
        enhanceQuizzes(root);
        enhanceTabs(root);
        enhanceCode(root);
        cleanups.push(
            enhanceTraces(root, roots),
            enhanceDiagrams(root),
            enhanceScratch(root),
            enhanceReveal(root)
        );
        return () => {
            cleanups.forEach((cleanup) => cleanup());
            // Unmount after React finishes the current render.
            window.setTimeout(
                () => roots.forEach((reactRoot) => reactRoot.unmount()),
                0
            );
        };
    }, [html]);

    return (
        <div
            ref={ref}
            className={`lesson-prose ${className}`}
            // The browser re-serializes the HTML (e.g. `<img/>` -> `<img>`),
            // which React would otherwise report as a hydration mismatch.
            suppressHydrationWarning
            // Compiled at build time from the course's own Markdown, which
            // escapes raw HTML (scripts/build-lesson-content.js).
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default LessonContent;
