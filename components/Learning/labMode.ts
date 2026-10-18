import type { FreeLabMode } from "./types";

const INTERNAL_TOOL_PREFIX = "/learn/tools/";

/**
 * Which guided lab a /learn/tools/<slug> page shows.
 *
 * This is the single source of truth for lab selection: the lesson player uses
 * it too (via labModeForCourse), so a course's lessons always show the same lab
 * as that course's own tool page. Order matters — the first match wins.
 */
export const labModeForToolSlug = (slug: string): FreeLabMode => {
    if (slug.includes("android")) return "android";
    if (slug.includes("ml-evaluation")) return "ml-evaluation";
    if (slug.includes("microbit")) return "microbit";
    if (slug.includes("tinyml") || slug.includes("edge")) return "tinyml";
    if (
        slug.includes("robot") ||
        slug.includes("circuit") ||
        slug.includes("electronics")
    ) {
        return "circuits";
    }
    if (
        slug.includes("gpio") ||
        slug.includes("iot") ||
        slug.includes("raspberry")
    ) {
        return "gpio-iot";
    }
    if (slug.includes("git") || slug.includes("collaboration")) return "git";
    if (
        slug.includes("unity") ||
        slug.includes("game") ||
        slug.includes("physics")
    ) {
        return "unity-physics";
    }
    if (
        slug.includes("agent") ||
        slug.includes("mcp") ||
        slug.includes("harness") ||
        slug.includes("tool")
    ) {
        return "agent-tools";
    }
    if (
        slug.includes("data") ||
        slug.includes("model") ||
        slug.includes("ml") ||
        slug.includes("mlops") ||
        slug.includes("ai-") ||
        slug.startsWith("ai") ||
        slug.includes("deep-learning") ||
        slug.includes("nlp") ||
        slug.includes("retrieval") ||
        slug.includes("vision") ||
        slug.includes("language") ||
        slug.includes("research")
    ) {
        return "data-ml";
    }
    if (
        slug.includes("web") ||
        slug.includes("javascript") ||
        slug.includes("html") ||
        slug.includes("backend") ||
        slug.includes("api")
    ) {
        return "web";
    }
    return "logic-code";
};

/**
 * The lab for a course's lessons: the lab of its first built-in tool. Courses
 * whose main tool is external (the Scratch editor) get the general logic and
 * code tracer, which models events, loops, and conditions.
 */
export const labModeForCourse = (
    requirements: ReadonlyArray<{ freePath: { url?: string } }>
): FreeLabMode => {
    const url = requirements
        .map((requirement) => requirement.freePath.url)
        .find((candidate) => candidate?.startsWith(INTERNAL_TOOL_PREFIX));
    return url
        ? labModeForToolSlug(url.slice(INTERNAL_TOOL_PREFIX.length))
        : "logic-code";
};
