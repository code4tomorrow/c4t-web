import React, { useCallback, useEffect, useMemo, useState } from "react";

/** Recorded by scripts/lesson-runtime/trace.py at build time. */
export interface TraceFrame {
    n: string;
    v: Record<string, string>;
}
export interface TraceStep {
    /** Line about to run (1-based); null once the program has finished. */
    l: number | null;
    s: TraceFrame[];
    o: string;
    r?: string;
    e?: string;
}
export interface TraceData {
    /** Highlighted HTML, one entry per source line. */
    lines: string[];
    steps: TraceStep[];
}

const SPEEDS = [
    { label: "Slow", ms: 1400 },
    { label: "Normal", ms: 850 },
    { label: "Fast", ms: 400 },
];

/**
 * Step-through player for a short Python program: the line about to run,
 * every variable in every active call, and the output so far.
 */
const TracePlayer: React.FC<{ data: TraceData }> = ({ data }) => {
    const last = data.steps.length - 1;
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const step = data.steps[index];
    const previous = index > 0 ? data.steps[index - 1] : null;

    useEffect(() => {
        if (!playing) return undefined;
        if (index >= last) {
            setPlaying(false);
            return undefined;
        }
        const timer = window.setTimeout(
            () => setIndex((value) => Math.min(last, value + 1)),
            SPEEDS[speed].ms
        );
        return () => window.clearTimeout(timer);
    }, [playing, index, last, speed]);

    const go = useCallback(
        (value: number) => {
            setPlaying(false);
            setIndex(Math.max(0, Math.min(last, value)));
        },
        [last]
    );

    const changed = useMemo(() => {
        const result = new Set<string>();
        if (!previous) return result;
        step.s.forEach((frame, depth) => {
            const before = previous.s[depth];
            Object.entries(frame.v).forEach(([name, value]) => {
                if (
                    !before ||
                    before.n !== frame.n ||
                    before.v[name] !== value
                ) {
                    result.add(`${depth}:${name}`);
                }
            });
        });
        return result;
    }, [step, previous]);

    const previousLine = previous?.l ?? null;
    const newOutput =
        previous && step.o.length > previous.o.length
            ? step.o.slice(previous.o.length)
            : "";
    const status =
        step.l === null
            ? step.e
                ? `The program stopped with an error: ${step.e}`
                : "The program has finished."
            : step.r !== undefined
            ? `Returning ${step.r} from ${
                  step.s[step.s.length - 1]?.n ?? "the function"
              }.`
            : `Next, Python runs line ${step.l}.`;

    return (
        <div
            className="trace"
            onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    go(index + 1);
                } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    go(index - 1);
                }
            }}
        >
            <div className="trace__body">
                <ol className="trace__code" aria-label="Program">
                    {data.lines.map((html, lineIndex) => {
                        const number = lineIndex + 1;
                        const current = step.l === number;
                        const justRan = !current && previousLine === number;
                        return (
                            <li
                                key={number}
                                className={`trace__line${
                                    current ? " is-current" : ""
                                }${justRan ? " is-previous" : ""}`}
                                aria-current={current ? "step" : undefined}
                            >
                                <span
                                    className="trace__marker"
                                    aria-hidden="true"
                                >
                                    {current ? "➜" : justRan ? "•" : ""}
                                </span>
                                <span
                                    className="trace__number"
                                    aria-hidden="true"
                                >
                                    {number}
                                </span>
                                <code
                                    className="hljs language-python"
                                    // Highlighted at build time from the lesson's own code.
                                    dangerouslySetInnerHTML={{ __html: html }}
                                />
                            </li>
                        );
                    })}
                </ol>

                <div className="trace__state">
                    <p className="trace__heading">Variables</p>
                    {step.s.map((frame, depth) => {
                        const entries = Object.entries(frame.v);
                        return (
                            <div
                                key={`${depth}-${frame.n}`}
                                className={`trace__frame${
                                    depth === step.s.length - 1
                                        ? " is-active"
                                        : ""
                                }`}
                            >
                                <p className="trace__frame-name">{frame.n}</p>
                                {entries.length ? (
                                    <dl>
                                        {entries.map(([name, value]) => (
                                            <div
                                                key={`${name}-${
                                                    changed.has(
                                                        `${depth}:${name}`
                                                    )
                                                        ? index
                                                        : "same"
                                                }`}
                                                className={`trace__var${
                                                    changed.has(
                                                        `${depth}:${name}`
                                                    )
                                                        ? " is-changed"
                                                        : ""
                                                }`}
                                            >
                                                <dt>{name}</dt>
                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : (
                                    <p className="trace__empty">
                                        No variables yet
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    <p className="trace__heading">Output</p>
                    <pre className="trace__output">
                        {step.o.slice(0, step.o.length - newOutput.length)}
                        {newOutput && <mark>{newOutput}</mark>}
                        {!step.o && (
                            <span className="trace__empty">
                                Nothing printed yet
                            </span>
                        )}
                    </pre>
                </div>
            </div>

            <p className="trace__status" aria-live="polite">
                {status}
            </p>

            <div className="trace__controls">
                <button
                    type="button"
                    onClick={() => go(0)}
                    disabled={index === 0}
                    aria-label="Back to the start"
                >
                    ⏮
                </button>
                <button
                    type="button"
                    onClick={() => go(index - 1)}
                    disabled={index === 0}
                >
                    ‹ Back
                </button>
                <button
                    type="button"
                    className="trace__play"
                    onClick={() => {
                        if (index >= last) setIndex(0);
                        setPlaying((value) => !value);
                    }}
                >
                    {playing
                        ? "❚❚ Pause"
                        : index >= last
                        ? "↻ Replay"
                        : "▶ Play"}
                </button>
                <button
                    type="button"
                    onClick={() => go(index + 1)}
                    disabled={index >= last}
                >
                    Next ›
                </button>
                <input
                    type="range"
                    min={0}
                    max={last}
                    value={index}
                    onChange={(event) => go(Number(event.target.value))}
                    aria-label="Step"
                    className="trace__slider"
                />
                <span className="trace__count">
                    Step {index + 1} of {last + 1}
                </span>
                <button
                    type="button"
                    className="trace__speed"
                    onClick={() =>
                        setSpeed((value) => (value + 1) % SPEEDS.length)
                    }
                    aria-label={`Playback speed: ${SPEEDS[speed].label}`}
                >
                    {SPEEDS[speed].label}
                </button>
            </div>
        </div>
    );
};

export default TracePlayer;
