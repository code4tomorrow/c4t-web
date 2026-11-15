# Writing lesson content

Lessons are Markdown files in `learning/content/<course-id>/`. Each course has
8 modules × 3 lessons = 24 files, named `m<module>-l<lesson>.md`:

-   `m1` — Get set up (before week 1)
-   `m2`–`m7` — Weeks 1–6 (one module per week of class)
-   `m8` — Capstone project

Lesson roles inside a module:

-   **Setup (m1):** `l1` what you need and how to install it, step by step ·
    `l2` your first run, and proof it works · `l3` how the class works, saving
    and organizing your work, and fixing common setup problems.
-   **Weeks (m2–m7):** `l1` **Notes** — the week's concepts explained clearly
    with real code · `l2` **Code-along** — build one small program/app/project
    step by step · `l3` **Practice** — 4–6 exercises of rising difficulty, each
    with a solution, plus one stretch challenge.
-   **Capstone (m8):** `l1` the project brief, ideas, and planning · `l2`
    building it in milestones, with a starter skeleton · `l3` testing,
    polishing, presenting, and the grading checklist.

## File format

```
---
title: Variables and input
summary: One sentence for the course outline (what the learner will do).
---

Markdown body…
```

Only `title` and `summary` go in the front matter.

## Quality bar (every lesson)

-   **Teach for real.** Explain like a good teacher: why it matters, how it
    works, a concrete example, what usually goes wrong. 600–1,200 words.
-   **Show real code** in every lesson of a coding course: complete, correct,
    copy-pasteable programs, each followed by the exact output it prints.
-   **No repetition.** Never reuse an intro, paragraph, or sentence pattern
    from another lesson. Each lesson starts with its own specific hook.
-   **Further reading.** End Notes and Code-along lessons with
    `## Further reading`: 2–3 links to official documentation or well-known,
    reputable articles. Check every URL with `curl -sIL -o /dev/null -w
    "%{http_code}" URL` and use it only if it returns 200.
-   **Practice lessons** use numbered `### Exercise N: Title` headings and put
    each answer in a solution block.
-   Use `##`/`###` headings, short paragraphs, and lists. No emojis spam, no
    filler ("In this lesson we will…"), no mention of simulators or labs.
-   No raw HTML and no images.

## Special blocks

```
:::tip
Short helpful hint.
:::

:::warning
A common mistake and how to avoid it.
:::

:::solution
The worked answer, usually with a code block.
:::
```

## Code blocks

Always tag the language: `python`, `java`, `xml`, `javascript`, `bash`,
`text` (for printed output), `scratch` (Scratch blocks written in
scratchblocks text, e.g. `when green flag clicked` / `move (10) steps`).

Test your code before you publish it:

-   **Python:** run every program with `python3`. Programs that use `input()`
    must be run with sample input piped in. scikit-learn/pandas code must use
    datasets bundled with scikit-learn (`load_breast_cancer`, `load_wine`,
    `make_classification`, …) so it runs offline.
-   **Plain Java** (with `public static void main`): compile and run with
    `javac`/`java` in a temp folder.
-   **Android Java and XML** can't be run here — write it exactly as it
    appears in a current Android Studio "Empty Views Activity" Java project and
    double-check every class, method, and import name.
