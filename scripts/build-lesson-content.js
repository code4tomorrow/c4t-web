#!/usr/bin/env node
/**
 * Compiles authored lessons (learning/content/<course-id>/m<module>-l<lesson>.md)
 * into learning/lesson-content/:
 *
 *   index.json        title, summary, and reading time per lesson (read by the
 *                     course registry)
 *   <course-id>.json  rendered HTML and table of contents per lesson (loaded by
 *                     the lesson page)
 *
 * Charts drawn by `python run` cells are written to public/lesson-media/.
 * Everything is committed, so the site never parses Markdown or runs code at
 * request time. Read learning/content/AUTHORING.md for the lesson format.
 *
 *   npm run content                    build every course
 *   npm run content -- course-03       build one course (others are kept)
 *   npm run content -- --check course-03
 *                                      validate only; writes nothing
 *
 * Fails (exit 1) on malformed blocks, thin lessons, code that crashes, broken
 * videos or images, invalid diagrams, filler phrases, or text copied between
 * lessons.
 */
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { Marked } = require("marked");
const hljs = require("highlight.js");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "learning", "content");
const OUT_DIR = path.join(ROOT, "learning", "lesson-content");
const MEDIA_FILE = path.join(CONTENT_DIR, "media.json");
const FIGURE_DIR = path.join(ROOT, "public", "lesson-media");
const CACHE_DIR = path.join(ROOT, "node_modules", ".cache", "lesson-content");
const RUNTIME = path.join(__dirname, "lesson-runtime");
const FILE_PATTERN = /^m(\d+)-l(\d+)\.md$/;
const MIN_WORDS = Number(process.env.MIN_WORDS || 450);
const RUNNER_VERSION = "4";

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const ONLY = args.filter((arg) => !arg.startsWith("--"));

const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const sha = (value) =>
    crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);

const slugify = (text) =>
    text
        .toLowerCase()
        .replace(/<[^>]+>/g, "")
        .replace(/&[a-z]+;/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "section";

const LANGUAGE_LABELS = {
    python: "Python",
    py: "Python",
    java: "Java",
    xml: "XML",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    yaml: "YAML",
    sql: "SQL",
    bash: "Terminal",
    shell: "Terminal",
    powershell: "PowerShell",
    text: "Output",
    scratch: "Scratch blocks",
    kotlin: "Kotlin",
    csharp: "C#",
    cpp: "C++",
    c: "C",
    toml: "TOML",
    dockerfile: "Dockerfile",
    diff: "Changes",
    ini: "Config",
    makecode: "MakeCode",
    arduino: "Arduino",
};
const HIGHLIGHT_ALIASES = { arduino: "cpp", makecode: "javascript" };
const RUNNABLE = new Set(["python", "javascript", "java"]);

/* ---------- fence info: ```python run title="loop.py" input="3|4" ---------- */

const parseInfo = (info) => {
    const text = String(info || "").trim();
    const lang = (text.split(/\s+/)[0] || "").toLowerCase();
    const rest = text.slice(lang.length);
    const attrs = {};
    const flags = new Set();
    rest.replace(/(\w+)="([^"]*)"|(\w+)/g, (_, key, value, flag) => {
        if (key) attrs[key] = value;
        else if (flag) flags.add(flag.toLowerCase());
        return "";
    });
    return { lang, attrs, flags };
};

/** Every fenced block in a lesson, in document order. */
const fencesOf = (markdown) => {
    const blocks = [];
    const lines = markdown.split("\n");
    let open = null;
    lines.forEach((line, index) => {
        const match = line.match(/^ {0,3}(```+)(.*)$/);
        if (!open && match) {
            open = {
                ticks: match[1].length,
                info: match[2],
                start: index,
                code: [],
            };
        } else if (
            open &&
            match &&
            match[1].length >= open.ticks &&
            !match[2].trim()
        ) {
            blocks.push({
                ...parseInfo(open.info),
                info: open.info.trim(),
                code: open.code.join("\n"),
            });
            open = null;
        } else if (open) {
            open.code.push(line);
        }
    });
    return blocks;
};

const highlight = (code, lang) => {
    const language = HIGHLIGHT_ALIASES[lang] || lang;
    return language &&
        !["text", "scratch"].includes(language) &&
        hljs.getLanguage(language)
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value
        : escapeHtml(code);
};

/**
 * A preview snippet becomes a standards-mode page (no quirks-mode surprises)
 * with readable defaults; the snippet's own styles still win.
 */
const previewDocument = (snippet) => {
    if (/<!doctype/i.test(snippet)) return snippet;
    if (/<html[\s>]/i.test(snippet)) return `<!DOCTYPE html>\n${snippet}`;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:16px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.5;color:#1d1b22}</style></head><body>\n${snippet}\n</body></html>`;
};

const codeFigure = (code, lang, attrs = {}, extraClass = "") => {
    const label =
        attrs.title || LANGUAGE_LABELS[lang] || (lang ? lang : "Code");
    const kind =
        lang === "text"
            ? " lesson-code--output"
            : lang === "scratch"
            ? " lesson-code--scratch"
            : "";
    return `<figure class="lesson-code${kind}${extraClass}" data-lang="${escapeHtml(
        lang || "plaintext"
    )}"><figcaption><span>${escapeHtml(
        label
    )}</span></figcaption><pre><code class="hljs language-${escapeHtml(
        lang || "plaintext"
    )}">${highlight(code.replace(/\n+$/, ""), lang)}</code></pre></figure>`;
};

/* ---------- media: YouTube videos and images, verified and cached ---------- */

const media = fs.existsSync(MEDIA_FILE)
    ? JSON.parse(fs.readFileSync(MEDIA_FILE, "utf8"))
    : { videos: {}, images: {} };
media.videos = media.videos || {};
media.images = media.images || {};

const IMAGE_HOSTS = ["upload.wikimedia.org"];
fs.mkdirSync(CACHE_DIR, { recursive: true });

const fetchVideo = async (id) => {
    const oembed = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
            `https://www.youtube.com/watch?v=${id}`
        )}&format=json`
    );
    if (oembed.status !== 200) {
        return {
            error: `YouTube says ${oembed.status} (${
                oembed.status === 401
                    ? "embedding disabled"
                    : "no such public video"
            })`,
        };
    }
    const info = await oembed.json();
    let seconds = null;
    try {
        const page = await fetch(
            `https://www.youtube.com/watch?v=${id}&hl=en`,
            {
                headers: {
                    "Accept-Language": "en-US",
                    "User-Agent": "Mozilla/5.0",
                },
            }
        );
        const match = (await page.text()).match(/"lengthSeconds":"(\d+)"/);
        if (match) seconds = Number(match[1]);
    } catch {
        /* the length is a nice-to-have */
    }
    return { title: info.title, author: info.author_name, seconds };
};

const fetchImage = async (url) => {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "C4T-lesson-builder/1.0 (educational nonprofit)",
        },
    });
    const type = response.headers.get("content-type") || "";
    if (response.status !== 200 || !type.startsWith("image/")) {
        return { error: `returned ${response.status} ${type}` };
    }
    return { ok: true };
};

// Successful lookups are also cached per item, so repeated --check runs
// (which never write media.json) don't ask YouTube again.
const mediaCacheFile = (kind, key) =>
    path.join(CACHE_DIR, `media-${kind}-${sha(key)}.json`);
const readMediaCache = (kind, key) => {
    try {
        return JSON.parse(fs.readFileSync(mediaCacheFile(kind, key), "utf8"));
    } catch {
        return null;
    }
};

const resolveMedia = async (videoIds, imageUrls) => {
    [...videoIds].forEach((id) => {
        if (!media.videos[id]) {
            const hit = readMediaCache("video", id);
            if (hit) media.videos[id] = hit;
        }
    });
    [...imageUrls].forEach((url) => {
        if (!media.images[url]) {
            const hit = readMediaCache("image", url);
            if (hit) media.images[url] = hit;
        }
    });
    const missingVideos = [...videoIds].filter((id) => !media.videos[id]);
    const missingImages = [...imageUrls].filter((url) => !media.images[url]);
    const queue = [
        ...missingVideos.map((id) => async () => {
            const result = await fetchVideo(id).catch((error) => ({
                error: error.message,
            }));
            if (!result.error) {
                media.videos[id] = result;
                fs.writeFileSync(
                    mediaCacheFile("video", id),
                    JSON.stringify(result)
                );
            } else media.videos[`!${id}`] = result.error;
        }),
        ...missingImages.map((url) => async () => {
            const result = await fetchImage(url).catch((error) => ({
                error: error.message,
            }));
            if (!result.error) {
                media.images[url] = result;
                fs.writeFileSync(
                    mediaCacheFile("image", url),
                    JSON.stringify(result)
                );
            } else media.images[`!${url}`] = result.error;
        }),
    ];
    const workers = Array.from({ length: 6 }, async () => {
        while (queue.length) await queue.shift()();
    });
    await Promise.all(workers);
};

/* ---------- mermaid diagrams, validated with mermaid's own parser ---------- */

let mermaidParser = null;
const loadMermaid = async () => {
    if (mermaidParser) return mermaidParser;
    const { default: DOMPurify } = await import("dompurify");
    // Parsing needs no DOM; only the sanitizer hooks expect one.
    Object.assign(DOMPurify, {
        addHook() {},
        removeHook() {},
        removeHooks() {},
        sanitize: (value) => value,
    });
    const { default: mermaid } = await import("mermaid");
    mermaidParser = mermaid;
    return mermaid;
};

/* ---------- running code: python (notebook-style), node, java ---------- */

fs.mkdirSync(CACHE_DIR, { recursive: true });

const cached = (key, compute) => {
    const file = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
    const value = compute();
    if (!value.transient) fs.writeFileSync(file, JSON.stringify(value));
    return value;
};

const inputsOf = (attrs) =>
    attrs.input === undefined ? [] : attrs.input.split("|");

const runPythonCells = (cells, notebook) => {
    const key = sha(`py${RUNNER_VERSION}${notebook}${JSON.stringify(cells)}`);
    return cached(key, () => {
        const work = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-py-"));
        const request = path.join(work, "request.json");
        const result = path.join(work, "result.json");
        fs.writeFileSync(request, JSON.stringify({ notebook, cells }));
        const run = spawnSync(
            "python3",
            [path.join(RUNTIME, "run_cells.py"), request, result, work],
            {
                cwd: work,
                timeout: 240_000,
                encoding: "utf8",
                env: { ...process.env, MPLBACKEND: "Agg", PYTHONHASHSEED: "0" },
            }
        );
        if (run.error || !fs.existsSync(result)) {
            fs.rmSync(work, { recursive: true, force: true });
            return {
                transient: true,
                crash: `python could not run this lesson (${
                    run.error
                        ? run.error.code || run.error.message
                        : (run.stderr || "").trim().split("\n").slice(-1)[0]
                })`,
            };
        }
        const outputs = JSON.parse(fs.readFileSync(result, "utf8")).map(
            (cell) => ({
                out: cell.out,
                error: cell.error,
                figures: cell.figures.map((file) =>
                    fs.readFileSync(file, "utf8")
                ),
            })
        );
        fs.rmSync(work, { recursive: true, force: true });
        return { outputs };
    });
};

const runSingle = (lang, code, input) => {
    const key = sha(`${lang}${RUNNER_VERSION}${code}${input.join("|")}`);
    return cached(key, () => {
        const work = fs.mkdtempSync(path.join(os.tmpdir(), `lesson-${lang}-`));
        const stdin = input.length ? `${input.join("\n")}\n` : "";
        let run;
        if (lang === "javascript") {
            fs.writeFileSync(path.join(work, "main.js"), code);
            run = spawnSync("node", ["main.js"], {
                cwd: work,
                input: stdin,
                timeout: 30_000,
                encoding: "utf8",
            });
        } else {
            const className =
                (code.match(/public\s+(?:final\s+)?class\s+(\w+)/) || [])[1] ||
                "Main";
            fs.writeFileSync(path.join(work, `${className}.java`), code);
            const compile = spawnSync("javac", [`${className}.java`], {
                cwd: work,
                timeout: 60_000,
                encoding: "utf8",
            });
            run =
                compile.status !== 0
                    ? { status: 1, stdout: "", stderr: compile.stderr }
                    : spawnSync("java", ["-cp", ".", className], {
                          cwd: work,
                          input: stdin,
                          timeout: 30_000,
                          encoding: "utf8",
                      });
        }
        fs.rmSync(work, { recursive: true, force: true });
        if (run.error)
            return {
                transient: true,
                crash: `${lang} timed out or failed to start`,
            };
        return {
            outputs: [
                {
                    out: run.stdout || "",
                    error:
                        run.status === 0
                            ? null
                            : (run.stderr || "exited with an error").trim(),
                    figures: [],
                },
            ],
        };
    });
};

const traceProgram = (code, input) => {
    const key = sha(`trace${RUNNER_VERSION}${code}${input.join("|")}`);
    return cached(key, () => {
        const run = spawnSync("python3", [path.join(RUNTIME, "trace.py")], {
            input: JSON.stringify({ code, input }),
            timeout: 30_000,
            encoding: "utf8",
        });
        if (run.status !== 0 || !run.stdout) {
            return {
                transient: true,
                crash: (run.stderr || "the tracer failed")
                    .trim()
                    .split("\n")
                    .slice(-1)[0],
            };
        }
        return JSON.parse(run.stdout);
    });
};

/* ---------- containers (:::name … :::) ---------- */

const CALLOUTS = {
    tip: { label: "Tip", icon: "💡" },
    note: { label: "Note", icon: "📝" },
    warning: { label: "Watch out", icon: "⚠️" },
    try: { label: "Try it yourself", icon: "🧪" },
    info: { label: "Good to know", icon: "ℹ️" },
};
const DISCLOSURES = { solution: "Show solution", hint: "Need a hint?" };
const SECTIONS = {
    objectives: "What you'll learn",
    takeaways: "Key takeaways",
    recap: "Quick recap",
};
const CUSTOM = new Set(["video", "quiz", "trace", "tabs"]);
const KNOWN = new Set([
    ...Object.keys(CALLOUTS),
    ...Object.keys(DISCLOSURES),
    ...Object.keys(SECTIONS),
    ...CUSTOM,
]);

/* ---------- filler and AI-ish phrasing the lessons must not use ---------- */

const BANNED = [
    "dive in",
    "dive into",
    "deep dive",
    "delve",
    "let's explore",
    "let us explore",
    "in this lesson, we",
    "in this lesson we",
    "in this lesson, you will",
    "in this lesson you will",
    "it's important to note",
    "it is important to note",
    "it's worth noting",
    "it is worth noting",
    "whether you're",
    "unlock the",
    "unleash",
    "embark",
    "journey",
    "seamless",
    "seamlessly",
    "leverage",
    "game-changer",
    "game changer",
    "in today's",
    "elevate your",
    "harness the power",
    "tapestry",
    "testament to",
    "the realm of",
    "the world of",
    "in conclusion",
    "happy coding",
    "buckle up",
    "without further ado",
    "supercharge",
    "magic happens",
    "a myriad",
    "plethora",
    "crucial",
    "pivotal",
    "cutting-edge",
    "fear not",
    "rest assured",
    "let's get started",
    "exciting world",
    "powerful tool",
    "empower",
    "c4t simulator",
    "concept lab",
    "guided lab",
    "/learn/tools",
    "concept simulator",
];

const proseOf = (body) =>
    body
        .replace(/^ {0,3}```[\s\S]*?^ {0,3}```/gm, " ")
        .replace(/`[^`\n]*`/g, " ")
        .replace(/\]\([^)]*\)/g, "]");

const wordCount = (text) => proseOf(text).split(/\s+/).filter(Boolean).length;

/** Sentences long enough that repeating them is copy-paste, not coincidence. */
const sentences = (body) =>
    proseOf(body)
        .replace(/^[#>:|-].*$/gm, " ")
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.replace(/\s+/g, " ").trim().toLowerCase())
        .filter((sentence) => sentence.length >= 90);

/* ---------- one lesson ---------- */

const formatLength = (seconds) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
};

const parseStart = (value) => {
    if (!value) return 0;
    if (/^\d+$/.test(value)) return Number(value);
    const parts = value.split(":").map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
};

const svgSize = (svg) => {
    const width = svg.match(/<svg[^>]*\swidth="([\d.]+)pt"/);
    const height = svg.match(/<svg[^>]*\sheight="([\d.]+)pt"/);
    return width && height
        ? {
              width: Math.round(Number(width[1]) * 1.333),
              height: Math.round(Number(height[1]) * 1.333),
          }
        : { width: 640, height: 480 };
};

const compileLesson = async ({
    courseId,
    name,
    raw,
    moduleOrder,
    lessonOrder,
    moduleCount,
    figuresWritten,
}) => {
    const file = `${courseId}/${name}`;
    const key = name.replace(/\.md$/, "");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
        fail(file, "missing front matter");
        return null;
    }
    const meta = {};
    match[1].split("\n").forEach((line) => {
        const pair = line.match(/^(\w+):\s*(.*)$/);
        if (pair) meta[pair[1]] = pair[2].trim().replace(/^["']|["']$/g, "");
    });
    const body = match[2];
    const notebook = /^(true|yes)$/i.test(meta.notebook || "");
    if (!meta.title) fail(file, "front matter needs a title");
    if (!meta.summary) fail(file, "front matter needs a summary");

    /* lint */
    const words = wordCount(body);
    if (words < MIN_WORDS)
        fail(file, `only ${words} words of explanation (minimum ${MIN_WORDS})`);
    const prose = proseOf(body).toLowerCase();
    BANNED.forEach((phrase) => {
        if (prose.includes(phrase))
            fail(file, `uses the filler phrase "${phrase}" — say it plainly`);
    });
    const dashes = (proseOf(body).match(/—/g) || []).length;
    if (dashes > 4)
        fail(
            file,
            `uses ${dashes} em dashes (max 4); use commas, colons, or periods`
        );
    if (
        /<\/?(div|span|iframe|script|img|br|p|b|i|u|a|table|video|style|center|font)\b[^>]*>/i.test(
            proseOf(body)
        )
    ) {
        fail(
            file,
            "contains raw HTML (it is shown as text, not rendered); use Markdown or a ::: block"
        );
    }

    /* collect fences, media, and runnable cells */
    const fences = fencesOf(body);
    const videoIds = new Set();
    for (const found of body.matchAll(/^:::video\s+([\w-]{11})\b/gm))
        videoIds.add(found[1]);
    const imageUrls = new Set();
    for (const found of body.matchAll(
        /!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g
    )) {
        const url = found[1];
        if (url.startsWith("/lesson-media/")) continue;
        if (!IMAGE_HOSTS.some((host) => url.startsWith(`https://${host}/`))) {
            fail(
                file,
                `images must come from ${IMAGE_HOSTS.join(", ")} (got ${url})`
            );
        } else imageUrls.add(url);
    }
    await resolveMedia(videoIds, imageUrls);
    videoIds.forEach((id) => {
        if (media.videos[`!${id}`])
            fail(file, `video ${id}: ${media.videos[`!${id}`]}`);
    });
    imageUrls.forEach((url) => {
        if (media.images[`!${url}`])
            fail(file, `image ${url}: ${media.images[`!${url}`]}`);
    });

    const mermaidBlocks = fences.filter((fence) => fence.lang === "mermaid");
    if (mermaidBlocks.length) {
        const mermaid = await loadMermaid();
        for (const block of mermaidBlocks) {
            try {
                await mermaid.parse(block.code);
            } catch (error) {
                fail(
                    file,
                    `diagram does not parse: ${String(error.message || error)
                        .split("\n")
                        .slice(0, 3)
                        .join(" ")}`
                );
            }
        }
    }

    const results = new Map(); // fence index -> {out, error, figures}
    const pythonCells = [];
    fences.forEach((fence, index) => {
        if (!fence.flags.has("run")) return;
        if (!RUNNABLE.has(fence.lang)) {
            fail(
                file,
                `"${fence.lang} run" is not supported (python, javascript, java only)`
            );
            return;
        }
        if (fence.lang === "python")
            pythonCells.push({
                index,
                code: fence.code,
                input: inputsOf(fence.attrs),
            });
        else {
            const { outputs, crash } = runSingle(
                fence.lang,
                fence.code,
                inputsOf(fence.attrs)
            );
            if (crash) fail(file, crash);
            else results.set(index, outputs[0]);
        }
    });
    if (pythonCells.length) {
        const { outputs, crash } = runPythonCells(
            pythonCells.map(({ code, input }) => ({ code, input })),
            notebook
        );
        if (crash) fail(file, crash);
        else
            pythonCells.forEach((cell, position) =>
                results.set(cell.index, outputs[position])
            );
    }
    results.forEach((result, index) => {
        const fence = fences[index];
        const expectsError = fence.flags.has("raises");
        const where = `${fence.lang} run block ${
            [...results.keys()].indexOf(index) + 1
        }`;
        if (result.error && !expectsError) {
            fail(
                file,
                `${where} crashed: ${
                    result.error.trim().split("\n").slice(-1)[0]
                }`
            );
        } else if (!result.error && expectsError) {
            fail(file, `${where} is marked "raises" but ran without an error`);
        }
        if (fence.attrs.alt === undefined && result.figures.length) {
            fail(
                file,
                `${where} draws a chart, so it needs alt="what the chart shows"`
            );
        }
    });

    /* render */
    const toc = [];
    const usedIds = new Set();
    let fenceCursor = 0;
    let quizCount = 0;
    let questionCount = 0;
    const stats = {
        videos: 0,
        videoSeconds: 0,
        diagrams: 0,
        traces: 0,
        charts: 0,
        images: 0,
    };

    const marked = new Marked({
        gfm: true,
        renderer: {
            html(html) {
                return escapeHtml(typeof html === "string" ? html : html.text);
            },
            heading(text, level, rawText) {
                const label = typeof text === "string" ? text : text.text;
                const raw = typeof text === "string" ? rawText : text.raw;
                let id = slugify(raw || label);
                while (usedIds.has(id)) id = `${id}-x`;
                usedIds.add(id);
                if (level === 2 || level === 3)
                    toc.push({ id, text: raw.replace(/[`*_]/g, ""), level });
                return `<h${level} id="${id}"><a class="lesson-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${label}</h${level}>`;
            },
            code(code, infostring) {
                const text = typeof code === "string" ? code : code.text;
                const info = parseInfo(
                    typeof code === "string" ? infostring : code.lang
                );
                // fences render in document order, so the cursor tracks which one this is
                let index = fenceCursor;
                while (
                    index < fences.length &&
                    fences[index].code.replace(/\n+$/, "") !==
                        text.replace(/\n+$/, "")
                )
                    index += 1;
                if (index < fences.length) fenceCursor = index + 1;
                if (info.lang === "mermaid") {
                    stats.diagrams += 1;
                    const caption = info.attrs.caption || "";
                    return `<figure class="lesson-diagram"><div class="lesson-diagram__canvas" data-mermaid="${escapeHtml(
                        text
                    )}"><pre class="lesson-diagram__source">${escapeHtml(
                        text
                    )}</pre></div>${
                        caption
                            ? `<figcaption>${escapeHtml(caption)}</figcaption>`
                            : ""
                    }</figure>`;
                }
                if (info.lang === "html" && info.flags.has("preview")) {
                    stats.previews = (stats.previews || 0) + 1;
                    const height = Math.min(
                        640,
                        Math.max(80, Number(info.attrs.height) || 260)
                    );
                    return `<div class="lesson-cell">${codeFigure(
                        text,
                        "html",
                        info.attrs
                    )}<figure class="lesson-preview"><figcaption><span>Result</span></figcaption><iframe sandbox="allow-scripts" loading="lazy" title="${escapeHtml(
                        info.attrs.title
                            ? `Result of ${info.attrs.title}`
                            : "Result of the HTML above"
                    )}" style="height:${height}px" srcdoc="${escapeHtml(
                        previewDocument(text)
                    )}"></iframe></figure></div>`;
                }
                const result = results.get(index);
                let html = codeFigure(
                    text,
                    info.lang,
                    info.attrs,
                    result ? " lesson-code--runnable" : ""
                );
                if (result) {
                    const pieces = [html];
                    if (result.out.trim())
                        pieces.push(
                            codeFigure(result.out, "text", { title: "Output" })
                        );
                    if (result.error) {
                        pieces.push(
                            `<figure class="lesson-code lesson-code--output lesson-code--error"><figcaption><span>Error</span></figcaption><pre><code>${escapeHtml(
                                result.error
                            )}</code></pre></figure>`
                        );
                    }
                    result.figures.forEach((svg, number) => {
                        stats.charts += 1;
                        const fileName = `${key}-${sha(svg)}.svg`;
                        figuresWritten.add(fileName);
                        if (!CHECK) {
                            fs.mkdirSync(path.join(FIGURE_DIR, courseId), {
                                recursive: true,
                            });
                            fs.writeFileSync(
                                path.join(FIGURE_DIR, courseId, fileName),
                                svg
                            );
                        }
                        const { width, height } = svgSize(svg);
                        pieces.push(
                            `<figure class="lesson-chart"><img src="/lesson-media/${courseId}/${fileName}" alt="${escapeHtml(
                                info.attrs.alt || ""
                            )}" width="${width}" height="${height}" loading="lazy" decoding="async"/>${
                                info.attrs.caption
                                    ? `<figcaption>${escapeHtml(
                                          info.attrs.caption
                                      )}</figcaption>`
                                    : ""
                            }</figure>`
                        );
                        void number;
                    });
                    html = `<div class="lesson-cell">${pieces.join("")}</div>`;
                }
                return html;
            },
            image(href, title, text) {
                const url = typeof href === "string" ? href : href.href;
                const alt = typeof href === "string" ? text : href.text;
                const credit = typeof href === "string" ? title : href.title;
                stats.images += 1;
                if (!alt) fail(file, `image ${url} needs alt text`);
                return `<figure class="lesson-image"><img src="${escapeHtml(
                    url
                )}" alt="${escapeHtml(
                    alt || ""
                )}" loading="lazy" decoding="async"/>${
                    credit
                        ? `<figcaption>${escapeHtml(credit)}</figcaption>`
                        : ""
                }</figure>`;
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
            table(header, bodyHtml) {
                return `<div class="lesson-table"><table><thead>${header}</thead><tbody>${bodyHtml}</tbody></table></div>`;
            },
        },
    });
    const inline = (text) => marked.parseInline(text.trim());

    const renderVideo = (title, inner) => {
        const [id, ...options] = title.split(/\s+/);
        const startOption = options.find((option) => /^start=/.test(option));
        const start = parseStart(startOption ? startOption.slice(6) : "");
        const info = media.videos[id];
        if (!/^[\w-]{11}$/.test(id || "")) {
            fail(
                file,
                `":::video" needs an 11-character YouTube id, got "${id}"`
            );
            return "";
        }
        if (!info) return "";
        stats.videos += 1;
        // a long video counts as the ~15 minutes a learner is pointed to
        stats.videoSeconds += Math.min(
            900,
            Math.max(0, (info.seconds || 0) - start)
        );
        const watch = `https://www.youtube.com/watch?v=${id}${
            start ? `&t=${start}s` : ""
        }`;
        const length = formatLength(info.seconds);
        return `<figure class="lesson-video" data-video="${id}" data-start="${start}"><a class="lesson-video__frame" href="${watch}" target="_blank" rel="noopener noreferrer" aria-label="Play video: ${escapeHtml(
            info.title
        )}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async"/><span class="lesson-video__play" aria-hidden="true"></span>${
            length ? `<span class="lesson-video__length">${length}</span>` : ""
        }</a><figcaption><span class="lesson-video__kicker">Watch${
            start ? ` from ${formatLength(start)}` : ""
        }</span><span class="lesson-video__title">${escapeHtml(
            info.title
        )}</span><span class="lesson-video__author">${escapeHtml(
            info.author
        )} · YouTube</span>${
            inner.trim()
                ? `<span class="lesson-video__note">${inline(
                      inner.replace(/\n+/g, " ")
                  )}</span>`
                : ""
        }</figcaption></figure>`;
    };

    const renderQuiz = (title, inner) => {
        const questions = [];
        let current = null;
        let option = null;
        inner.split("\n").forEach((line) => {
            const question = line.match(/^Q:\s*(.*)$/);
            const choice = line.match(/^- \[( |x|X)\]\s+(.*)$/);
            if (question) {
                current = { prompt: question[1], options: [] };
                questions.push(current);
                option = null;
            } else if (choice && current) {
                option = {
                    correct: choice[1].toLowerCase() === "x",
                    text: choice[2],
                    why: "",
                };
                current.options.push(option);
            } else if (/^\s{2,}\S/.test(line) && option) {
                option.why += ` ${line.trim()}`;
            } else if (line.trim() && current && !option) {
                current.prompt += ` ${line.trim()}`;
            } else if (line.trim()) {
                fail(
                    file,
                    `quiz line not understood: "${line.trim().slice(0, 60)}"`
                );
            }
        });
        if (!questions.length)
            fail(file, "quiz has no questions (start each with Q:)");
        quizCount += 1;
        const quizId = `quiz-${quizCount}`;
        const body = questions
            .map((question, qIndex) => {
                questionCount += 1;
                const correct = question.options.filter(
                    (item) => item.correct
                ).length;
                if (question.options.length < 2 || correct !== 1) {
                    fail(
                        file,
                        `quiz question "${question.prompt.slice(
                            0,
                            50
                        )}" needs 2+ options and exactly one [x]`
                    );
                }
                question.options.forEach((item) => {
                    if (!item.why.trim())
                        fail(
                            file,
                            `quiz option "${item.text.slice(
                                0,
                                40
                            )}" needs an explanation line (indented two spaces)`
                        );
                });
                const answer = question.options.findIndex(
                    (item) => item.correct
                );
                const letters = "ABCDEF";
                return `<div class="lesson-quiz__q" data-question><p class="lesson-quiz__prompt"><span class="lesson-quiz__num">${
                    qIndex + 1
                }</span><span>${inline(
                    question.prompt
                )}</span></p><ul class="lesson-quiz__options">${question.options
                    .map(
                        (item, oIndex) =>
                            `<li><button type="button" class="lesson-quiz__option" data-correct="${
                                item.correct
                            }" aria-describedby="${quizId}-${qIndex}-${oIndex}"><span class="lesson-quiz__letter">${
                                letters[oIndex]
                            }</span><span class="lesson-quiz__text">${inline(
                                item.text
                            )}</span></button><p class="lesson-quiz__why" id="${quizId}-${qIndex}-${oIndex}" hidden>${inline(
                                item.why
                            )}</p></li>`
                    )
                    .join(
                        ""
                    )}</ul><details class="lesson-quiz__reveal"><summary>Show answer</summary><p><strong>${
                    letters[answer] || "?"
                }.</strong> ${
                    answer >= 0 ? inline(question.options[answer].why) : ""
                }</p></details></div>`;
            })
            .join("");
        return `<section class="lesson-quiz" data-quiz aria-label="${escapeHtml(
            title || "Check your understanding"
        )}"><div class="lesson-quiz__head"><p class="lesson-quiz__label">${escapeHtml(
            title || "Check your understanding"
        )}</p><p class="lesson-quiz__score" data-score aria-live="polite">${
            questions.length
        } question${
            questions.length === 1 ? "" : "s"
        }</p></div>${body}</section>`;
    };

    const renderTrace = (title, inner) => {
        const fence = fencesOf(inner)[0];
        if (!fence || fence.lang !== "python") {
            fail(file, '":::trace" must contain one ```python block');
            return "";
        }
        const { steps, error, truncated, crash } = traceProgram(
            fence.code,
            inputsOf(fence.attrs)
        );
        if (crash) {
            fail(file, `trace failed: ${crash}`);
            return "";
        }
        if (truncated)
            fail(
                file,
                "trace runs more than 150 steps; use a shorter program or smaller loop"
            );
        if (error && !fence.flags.has("raises"))
            fail(file, `trace program crashed: ${error}`);
        stats.traces += 1;
        const codeLines = fence.code.replace(/\n+$/, "").split("\n");
        const data = {
            lines: codeLines.map((line) => highlight(line, "python") || " "),
            steps: steps.map((step) => ({
                l: step.line,
                s: step.stack.map((frame) => ({
                    n: frame.name,
                    v: frame.vars,
                })),
                o: step.out,
                ...(step.ret !== undefined ? { r: step.ret } : {}),
                ...(step.error ? { e: step.error } : {}),
            })),
        };
        return `<figure class="lesson-trace" data-trace="${escapeHtml(
            JSON.stringify(data)
        )}"><figcaption><span class="lesson-trace__kicker">Step through the code</span><span class="lesson-trace__title">${inline(
            title || "Watch the program run"
        )}</span></figcaption>${codeFigure(
            fence.code,
            "python",
            {},
            " lesson-trace__static"
        )}</figure>`;
    };

    const renderTabs = (inner) => {
        const panels = [];
        let currentPanel = null;
        inner.split("\n").forEach((line) => {
            const tab = line.match(/^@tab\s+(.+)$/);
            if (tab) {
                currentPanel = { label: tab[1].trim(), lines: [] };
                panels.push(currentPanel);
            } else if (currentPanel) currentPanel.lines.push(line);
            else if (line.trim())
                fail(file, '":::tabs" content must start with "@tab Name"');
        });
        if (panels.length < 2)
            fail(file, '":::tabs" needs at least two "@tab Name" sections');
        return `<div class="lesson-tabs" data-tabs>${panels
            .map(
                (panel) =>
                    `<section class="lesson-tabs__panel" data-tab="${escapeHtml(
                        panel.label
                    )}"><p class="lesson-tabs__heading">${escapeHtml(
                        panel.label
                    )}</p>${marked.parse(panel.lines.join("\n"))}</section>`
            )
            .join("")}</div>`;
    };

    const lines = body.split("\n");
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
            if (!KNOWN.has(kind)) fail(file, `unknown block ":::${kind}"`);
            container = { kind, title: open[2].trim(), lines: [] };
            continue;
        }
        if (open && container) {
            fail(
                file,
                `":::${open[1]}" opened inside ":::${container.kind}" (blocks can't nest; close the first with :::)`
            );
        }
        if (!fence && container && /^:::\s*$/.test(line)) {
            const { kind, title } = container;
            const inner = container.lines.join("\n");
            if (kind === "video") {
                // Markdown inside a video block would be dropped, and the
                // fence cursor must still advance past nothing.
                html.push(renderVideo(title, inner));
            } else if (kind === "quiz") html.push(renderQuiz(title, inner));
            else if (kind === "trace") {
                html.push(renderTrace(title, inner));
                fenceCursor += 1;
            } else if (kind === "tabs") html.push(renderTabs(inner));
            else if (DISCLOSURES[kind]) {
                html.push(
                    `<details class="lesson-disclosure lesson-disclosure--${kind}"><summary>${escapeHtml(
                        title || DISCLOSURES[kind]
                    )}</summary><div>${marked.parse(inner)}</div></details>`
                );
            } else if (SECTIONS[kind]) {
                html.push(
                    `<section class="lesson-box lesson-box--${kind}"><p class="lesson-box__label">${escapeHtml(
                        title || SECTIONS[kind]
                    )}</p>${marked.parse(inner)}</section>`
                );
            } else {
                const meta = CALLOUTS[kind] || CALLOUTS.note;
                html.push(
                    `<aside class="lesson-callout lesson-callout--${kind}"><p class="lesson-callout__label"><span aria-hidden="true">${
                        meta.icon
                    }</span> ${escapeHtml(
                        title || meta.label
                    )}</p>${marked.parse(inner)}</aside>`
                );
            }
            container = null;
            continue;
        }
        if (container) container.lines.push(line);
        else buffer.push(line);
    }
    if (container) fail(file, `":::${container.kind}" is never closed`);
    flush();

    /* structure every lesson needs */
    const core = moduleOrder > 1 && moduleOrder < moduleCount;
    const visuals =
        stats.videos +
        stats.diagrams +
        stats.traces +
        stats.charts +
        stats.images +
        (stats.previews || 0);
    if (!/^:::objectives/m.test(body))
        fail(file, 'needs a ":::objectives" box near the top');
    if (visuals === 0)
        fail(
            file,
            "needs at least one video, diagram, trace, chart, image, or html preview"
        );
    if (core && lessonOrder < 3) {
        if (questionCount < 2)
            fail(
                file,
                `needs a ":::quiz" with at least 2 questions (has ${questionCount})`
            );
        if (!/^:::takeaways/m.test(body))
            fail(file, 'needs a ":::takeaways" box at the end');
    }
    if (core && lessonOrder === 3 && !/^:::solution/m.test(body))
        fail(file, "practice lessons need :::solution blocks");

    const codeBlocks = fences.filter(
        (item) => !["text", "mermaid"].includes(item.lang)
    ).length;
    const minutes = Math.max(
        10,
        Math.round(
            (words / 200 +
                codeBlocks * 1.2 +
                questionCount * 0.7 +
                stats.traces * 2 +
                stats.videoSeconds / 60) /
                5
        ) * 5
    );

    return {
        key,
        title: meta.title || key,
        summary: meta.summary || "",
        module: meta.module || undefined,
        words,
        minutes,
        html: html.join("\n"),
        toc,
        stats: { ...stats, quizzes: questionCount, code: codeBlocks },
        sentences: sentences(body),
    };
};

/* ---------- all courses ---------- */

const main = async () => {
    const courseDirs = fs
        .readdirSync(CONTENT_DIR)
        .filter((name) =>
            fs.statSync(path.join(CONTENT_DIR, name)).isDirectory()
        )
        .filter((name) => !ONLY.length || ONLY.includes(name))
        .sort();

    const indexFile = path.join(OUT_DIR, "index.json");
    const index =
        fs.existsSync(indexFile) && ONLY.length
            ? JSON.parse(fs.readFileSync(indexFile, "utf8"))
            : {};
    const coursesFile = path.join(OUT_DIR, "courses.json");
    const courseMeta =
        fs.existsSync(coursesFile) && ONLY.length
            ? JSON.parse(fs.readFileSync(coursesFile, "utf8"))
            : {};
    const seen = new Map();
    let compiled = 0;

    for (const courseId of courseDirs) {
        const dir = path.join(CONTENT_DIR, courseId);
        const names = fs
            .readdirSync(dir)
            .filter((item) => item.endsWith(".md"))
            .sort();
        const moduleCount = Math.max(
            0,
            ...names.map((item) =>
                Number((item.match(FILE_PATTERN) || [])[1] || 0)
            )
        );
        const lessons = {};
        const figuresWritten = new Set();
        for (const name of names) {
            const order = name.match(FILE_PATTERN);
            if (!order) {
                fail(`${courseId}/${name}`, "name must look like m2-l1.md");
                continue;
            }
            const raw = fs
                .readFileSync(path.join(dir, name), "utf8")
                .replace(/\r\n/g, "\n");
            const lesson = await compileLesson({
                courseId,
                name,
                raw,
                moduleOrder: Number(order[1]),
                lessonOrder: Number(order[2]),
                moduleCount,
                figuresWritten,
            });
            if (!lesson) continue;
            for (const sentence of lesson.sentences) {
                const first = seen.get(sentence);
                if (first && first !== `${courseId}/${name}`) {
                    fail(
                        `${courseId}/${name}`,
                        `repeats a sentence from ${first}: "${sentence.slice(
                            0,
                            70
                        )}…"`
                    );
                } else if (!first) seen.set(sentence, `${courseId}/${name}`);
            }
            lessons[lesson.key] = lesson;
            compiled += 1;
        }
        const metaFile = path.join(dir, "course.json");
        if (fs.existsSync(metaFile)) {
            try {
                const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
                const tool = meta.primaryTool || {};
                if (!meta.summary || !meta.description)
                    fail(
                        `${courseId}/course.json`,
                        "needs summary and description"
                    );
                if (!Array.isArray(meta.outcomes) || meta.outcomes.length < 3)
                    fail(`${courseId}/course.json`, "needs 3+ outcomes");
                if (
                    !tool.name ||
                    !tool.description ||
                    !Array.isArray(tool.setupSteps) ||
                    !tool.verification ||
                    !/^https:\/\//.test(tool.url || "")
                ) {
                    fail(
                        `${courseId}/course.json`,
                        "primaryTool needs name, description, setupSteps[], verification, and an https url"
                    );
                }
                const text = JSON.stringify(meta).toLowerCase();
                BANNED.forEach((phrase) => {
                    if (text.includes(phrase))
                        fail(
                            `${courseId}/course.json`,
                            `uses the filler phrase "${phrase}"`
                        );
                });
                courseMeta[courseId] = meta;
            } catch (error) {
                fail(
                    `${courseId}/course.json`,
                    `is not valid JSON (${error.message})`
                );
            }
        }
        if (!Object.keys(lessons).length) continue;
        index[courseId] = Object.fromEntries(
            Object.values(lessons).map((lesson) => [
                lesson.key,
                {
                    title: lesson.title,
                    summary: lesson.summary,
                    ...(lesson.module ? { module: lesson.module } : {}),
                    minutes: lesson.minutes,
                    stats: lesson.stats,
                },
            ])
        );
        if (!CHECK) {
            fs.writeFileSync(
                path.join(OUT_DIR, `${courseId}.json`),
                `${JSON.stringify(
                    Object.fromEntries(
                        Object.values(lessons).map((lesson) => [
                            lesson.key,
                            {
                                html: lesson.html,
                                toc: lesson.toc,
                                minutes: lesson.minutes,
                                stats: lesson.stats,
                            },
                        ])
                    )
                )}\n`
            );
            // Remove charts no lesson draws any more.
            const figureDir = path.join(FIGURE_DIR, courseId);
            if (fs.existsSync(figureDir)) {
                fs.readdirSync(figureDir)
                    .filter((item) => !figuresWritten.has(item))
                    .forEach((item) => fs.rmSync(path.join(figureDir, item)));
            }
        }
    }

    if (!CHECK) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        fs.writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`);
        fs.writeFileSync(
            coursesFile,
            `${JSON.stringify(courseMeta, null, 2)}\n`
        );
        const clean = {
            videos: Object.fromEntries(
                Object.entries(media.videos)
                    .filter(([id]) => !id.startsWith("!"))
                    .sort()
            ),
            images: Object.fromEntries(
                Object.entries(media.images)
                    .filter(([url]) => !url.startsWith("!"))
                    .sort()
            ),
        };
        fs.writeFileSync(MEDIA_FILE, `${JSON.stringify(clean, null, 2)}\n`);
    }

    if (errors.length) {
        console.error(`Lesson content has ${errors.length} problem(s):`);
        errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
    }
    console.log(
        `${CHECK ? "Checked" : "Compiled"} ${compiled} lessons across ${
            courseDirs.length
        } course(s).`
    );
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
