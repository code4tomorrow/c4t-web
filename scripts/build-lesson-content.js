#!/usr/bin/env node
/**
 * Compiles authored lessons (learning/content/<course-id>/m<module>-l<lesson>.md)
 * into learning/lesson-content/:
 *
 *   index.json        titles and summaries, read by the course registry
 *   <course-id>.json  rendered HTML per lesson, loaded by the lesson page
 *
 * The output is committed, so the site never parses Markdown at runtime.
 * Run after editing any lesson:  npm run content
 *
 * Fails (exit 1) on malformed files, thin lessons, raw HTML, or text copied
 * between lessons.
 */
const fs = require("fs");
const path = require("path");
const { Marked } = require("marked");
const hljs = require("highlight.js");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "learning", "content");
const OUT_DIR = path.join(ROOT, "learning", "lesson-content");
const FILE_PATTERN = /^m(\d+)-l(\d+)\.md$/;
const MIN_WORDS = Number(process.env.MIN_WORDS || 350);

const errors = [];

const escapeHtml = (value) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const LANGUAGE_LABELS = {
    python: "Python",
    java: "Java",
    xml: "XML",
    javascript: "JavaScript",
    bash: "Terminal",
    shell: "Terminal",
    text: "Output",
    scratch: "Scratch blocks",
    kotlin: "Kotlin",
    json: "JSON",
};

const marked = new Marked({
    gfm: true,
    renderer: {
        // Lessons are Markdown only; raw HTML is shown, never executed.
        html(html) {
            return escapeHtml(typeof html === "string" ? html : html.text);
        },
        code(code, infostring) {
            const text = typeof code === "string" ? code : code.text;
            const lang = String(
                (typeof code === "string" ? infostring : code.lang) || ""
            )
                .split(/\s+/)[0]
                .toLowerCase();
            const highlighted =
                lang &&
                lang !== "text" &&
                lang !== "scratch" &&
                hljs.getLanguage(lang)
                    ? hljs.highlight(text, { language: lang }).value
                    : escapeHtml(text);
            const label = LANGUAGE_LABELS[lang] || (lang ? lang : "Code");
            const kind = lang === "text" ? " lesson-code--output" : "";
            return `<figure class="lesson-code${kind}"><figcaption>${escapeHtml(
                label
            )}</figcaption><pre><code class="hljs language-${escapeHtml(
                lang || "plaintext"
            )}">${highlighted}</code></pre></figure>`;
        },
        link(href, title, text) {
            const url = typeof href === "string" ? href : href.href;
            const label = typeof href === "string" ? text : href.text;
            const external = /^https?:\/\//.test(url);
            return `<a href="${escapeHtml(url)}"${
                external ? ' target="_blank" rel="noopener noreferrer"' : ""
            }>${label}${
                external
                    ? '<span class="sr-only"> (opens in a new tab)</span>'
                    : ""
            }</a>`;
        },
        table(header, body) {
            return `<div class="lesson-table"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
        },
    },
});

const CALLOUTS = {
    tip: { label: "Tip", tag: "aside" },
    note: { label: "Note", tag: "aside" },
    warning: { label: "Watch out", tag: "aside" },
    solution: { label: "Show solution", tag: "details" },
};

/** Renders Markdown, expanding :::tip / :::note / :::warning / :::solution blocks. */
const render = (markdown, file) => {
    const lines = markdown.split("\n");
    const html = [];
    let buffer = [];
    let container = null;
    let fence = false;

    const flush = () => {
        if (buffer.length) html.push(marked.parse(buffer.join("\n")));
        buffer = [];
    };

    for (const line of lines) {
        if (/^ {0,3}```/.test(line)) fence = !fence;
        const open = !fence && line.match(/^:::(\w+)\s*(.*)$/);
        if (open && !container) {
            flush();
            const kind = open[1].toLowerCase();
            if (!CALLOUTS[kind])
                errors.push(`${file}: unknown block ":::${kind}"`);
            container = { kind, title: open[2].trim() };
            continue;
        }
        if (!fence && container && /^:::\s*$/.test(line)) {
            const inner = marked.parse(buffer.join("\n"));
            buffer = [];
            const meta = CALLOUTS[container.kind] || CALLOUTS.note;
            const title = escapeHtml(container.title || meta.label);
            html.push(
                meta.tag === "details"
                    ? `<details class="lesson-solution"><summary>${title}</summary><div>${inner}</div></details>`
                    : `<aside class="lesson-callout lesson-callout--${container.kind}"><p class="lesson-callout__label">${title}</p>${inner}</aside>`
            );
            container = null;
            continue;
        }
        buffer.push(line);
    }
    if (container)
        errors.push(`${file}: ":::${container.kind}" is never closed`);
    flush();
    return html.join("\n");
};

const parseFrontMatter = (raw, file) => {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
        errors.push(`${file}: missing front matter`);
        return { meta: {}, body: raw };
    }
    const meta = {};
    match[1].split("\n").forEach((line) => {
        const pair = line.match(/^(\w+):\s*(.*)$/);
        if (pair) meta[pair[1]] = pair[2].trim().replace(/^["']|["']$/g, "");
    });
    return { meta, body: match[2] };
};

const wordCount = (text) =>
    text
        .replace(/```[\s\S]*?```/g, " ")
        .split(/\s+/)
        .filter(Boolean).length;

/** Sentences long enough that repeating them is copy-paste, not coincidence. */
const sentences = (body) =>
    body
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/^[#>:|-].*$/gm, " ")
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.replace(/\s+/g, " ").trim().toLowerCase())
        .filter((sentence) => sentence.length >= 90);

fs.mkdirSync(OUT_DIR, { recursive: true });
const index = {};
const seen = new Map();

const courseDirs = fs.existsSync(CONTENT_DIR)
    ? fs
          .readdirSync(CONTENT_DIR)
          .filter((name) =>
              fs.statSync(path.join(CONTENT_DIR, name)).isDirectory()
          )
          .sort()
    : [];

for (const courseId of courseDirs) {
    const dir = path.join(CONTENT_DIR, courseId);
    const lessons = {};
    for (const name of fs.readdirSync(dir).sort()) {
        if (!name.endsWith(".md")) continue;
        const file = `${courseId}/${name}`;
        if (!FILE_PATTERN.test(name)) {
            errors.push(`${file}: name must look like m2-l1.md`);
            continue;
        }
        const raw = fs
            .readFileSync(path.join(dir, name), "utf8")
            .replace(/\r\n/g, "\n");
        const { meta, body } = parseFrontMatter(raw, file);
        if (!meta.title) errors.push(`${file}: front matter needs a title`);
        if (!meta.summary) errors.push(`${file}: front matter needs a summary`);
        const words = wordCount(body);
        if (words < MIN_WORDS) {
            errors.push(`${file}: only ${words} words (minimum ${MIN_WORDS})`);
        }
        for (const sentence of sentences(body)) {
            const first = seen.get(sentence);
            if (first && first !== file) {
                errors.push(
                    `${file}: repeats a sentence from ${first}: "${sentence.slice(
                        0,
                        70
                    )}…"`
                );
            } else if (!first) {
                seen.set(sentence, file);
            }
        }
        const key = name.replace(/\.md$/, "");
        lessons[key] = {
            title: meta.title || key,
            summary: meta.summary || "",
            words,
            html: render(body, file),
        };
    }
    if (!Object.keys(lessons).length) continue;
    index[courseId] = Object.fromEntries(
        Object.entries(lessons).map(([key, lesson]) => [
            key,
            { title: lesson.title, summary: lesson.summary },
        ])
    );
    fs.writeFileSync(
        path.join(OUT_DIR, `${courseId}.json`),
        `${JSON.stringify(
            Object.fromEntries(
                Object.entries(lessons).map(([key, lesson]) => [
                    key,
                    lesson.html,
                ])
            )
        )}\n`
    );
}

fs.writeFileSync(
    path.join(OUT_DIR, "index.json"),
    `${JSON.stringify(index, null, 2)}\n`
);

if (errors.length) {
    console.error(`Lesson content has ${errors.length} problem(s):`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
}

const total = Object.values(index).reduce(
    (sum, lessons) => sum + Object.keys(lessons).length,
    0
);
console.log(
    `Compiled ${total} lessons across ${Object.keys(index).length} courses.`
);
