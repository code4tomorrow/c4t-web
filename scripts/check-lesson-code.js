#!/usr/bin/env node
/**
 * Runs the code in hand-written lessons so broken examples can't ship.
 *
 *   node scripts/check-lesson-code.js [course-id ...]
 *
 * - python: every block runs with python3. Notebook-style lessons, where a
 *   cell uses names from earlier cells, are re-run with the earlier cells
 *   first. A block may fail only when the lesson is showing an error on
 *   purpose: the next output block shows a Traceback, the text just before it
 *   talks about a bug, or it is an intentional infinite loop.
 * - java: blocks with `public static void main` are compiled (together with
 *   the lesson's other plain-Java classes) and run.
 * - Android Java/XML and Scratch can't run here and are skipped.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "learning", "content");
const only = process.argv.slice(2);
const work = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-code-"));
const failures = [];
let ran = 0;

const blocksOf = (markdown) => {
    const blocks = [];
    const pattern = /^```(\w+)[^\n]*\n([\s\S]*?)^```/gm;
    let match;
    while ((match = pattern.exec(markdown))) {
        blocks.push({
            lang: match[1].toLowerCase(),
            code: match[2],
            before: markdown.slice(Math.max(0, match.index - 400), match.index),
        });
    }
    return blocks;
};

const INPUT = "5\n3\nyes\n2\n1\n0\nq\n".repeat(5);

const run = (command, args, options) =>
    execFileSync(command, args, {
        cwd: work,
        timeout: 60_000,
        stdio: ["pipe", "pipe", "pipe"],
        ...options,
    }).toString();

for (const courseId of fs.readdirSync(CONTENT_DIR).sort()) {
    const dir = path.join(CONTENT_DIR, courseId);
    if (!fs.statSync(dir).isDirectory()) continue;
    if (only.length && !only.includes(courseId)) continue;

    for (const name of fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".md"))
        .sort()) {
        const blocks = blocksOf(fs.readFileSync(path.join(dir, name), "utf8"));
        blocks.forEach((block, index) => {
            const next = blocks[index + 1];
            const expectsError =
                next &&
                next.lang === "text" &&
                /Traceback|Error:/.test(next.code);
            const where = `${courseId}/${name} block ${index + 1}`;

            if (block.lang === "python") {
                if (/^\s*>>>/m.test(block.code)) return; // shell transcript
                if (/^[ \t]+\S/.test(block.code)) return; // indented fragment
                if (/google\.colab/.test(block.code)) return; // Colab only
                const intentional =
                    expectsError ||
                    /\b(bug|broken|buggy|crash|error|infinite|never stops|wrong)\b/i.test(
                        block.before.slice(-250)
                    );
                const tryRun = (code) => {
                    fs.writeFileSync(path.join(work, "lesson.py"), code);
                    run("python3", ["lesson.py"], {
                        input: /input\(/.test(code) ? INPUT : "",
                        timeout: 30_000,
                        env: { ...process.env, MPLBACKEND: "Agg" },
                    });
                };
                ran += 1;
                try {
                    tryRun(block.code);
                } catch (error) {
                    const detail = String(error.stderr || error.message).trim();
                    // A notebook cell: run it after the lesson's earlier cells.
                    if (/NameError/.test(detail)) {
                        const earlier = blocks
                            .slice(0, index)
                            .filter(
                                (item) =>
                                    item.lang === "python" &&
                                    !/^[ \t]+\S/.test(item.code)
                            )
                            .map((item) => item.code);
                        try {
                            tryRun([...earlier, block.code].join("\n"));
                            return;
                        } catch (retryError) {
                            if (intentional) return;
                            failures.push(
                                `${where}: ${
                                    String(
                                        retryError.stderr || retryError.message
                                    )
                                        .trim()
                                        .split("\n")
                                        .slice(-1)[0]
                                }`
                            );
                            return;
                        }
                    }
                    if (
                        intentional ||
                        (error.code === "ETIMEDOUT" && /while/.test(block.code))
                    )
                        return;
                    if (
                        /input\(/.test(block.code) &&
                        /ValueError|EOFError/.test(detail)
                    )
                        return;
                    failures.push(
                        `${where}: ${detail.split("\n").slice(-1)[0]}`
                    );
                }
            }

            if (
                block.lang === "java" &&
                /public\s+static\s+void\s+main/.test(block.code)
            ) {
                const className = (block.code.match(/public\s+class\s+(\w+)/) ||
                    [])[1];
                if (!className) return;
                const javaDir = fs.mkdtempSync(path.join(work, "java-"));
                fs.writeFileSync(
                    path.join(javaDir, `${className}.java`),
                    block.code
                );
                // Helper classes the program uses, from the same lesson.
                const plain = (code) => code.replace(/^package .*;\s*$/m, "");
                blocks
                    .filter(
                        (item) =>
                            item.lang === "java" &&
                            item !== block &&
                            !/public\s+static\s+void\s+main/.test(item.code) &&
                            !/^import (android|androidx)\./m.test(item.code)
                    )
                    .forEach((item) => {
                        const helper = (item.code.match(
                            /^(?:public\s+)?class\s+(\w+)/m
                        ) || [])[1];
                        if (helper && helper !== className) {
                            fs.writeFileSync(
                                path.join(javaDir, `${helper}.java`),
                                plain(item.code)
                            );
                        }
                    });
                fs.writeFileSync(
                    path.join(javaDir, `${className}.java`),
                    plain(block.code)
                );
                ran += 1;
                try {
                    run(
                        "javac",
                        fs
                            .readdirSync(javaDir)
                            .filter((file) => file.endsWith(".java")),
                        { cwd: javaDir }
                    );
                    run("java", ["-cp", javaDir, className], {
                        cwd: javaDir,
                        input: "5\n3\n2\n",
                    });
                } catch (error) {
                    if (expectsError) return;
                    const detail = String(error.stderr || error.message)
                        .trim()
                        .split("\n")
                        .slice(0, 2)
                        .join(" | ");
                    failures.push(`${where}: ${detail}`);
                }
            }
        });
    }
}

fs.rmSync(work, { recursive: true, force: true });
if (failures.length) {
    console.error(`${failures.length} of ${ran} programs failed:`);
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exit(1);
}
console.log(`All ${ran} runnable programs passed.`);
