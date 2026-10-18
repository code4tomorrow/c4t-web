"use client";

import clsx from "clsx";
import React, { useEffect, useId, useMemo, useState } from "react";
import type { FreeLabMode } from "./types";

type CanonicalLabMode =
    | "logic-code"
    | "android"
    | "ml-evaluation"
    | "web"
    | "git"
    | "circuits"
    | "microbit"
    | "gpio-iot"
    | "tinyml"
    | "data-ml"
    | "unity-physics"
    | "agent-tools";

interface LabControl {
    id: string;
    label: string;
    help: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    unit?: string;
}

interface PredictionOption {
    value: string;
    label: string;
}

interface LabMetric {
    label: string;
    value: string;
}

interface LabResult {
    outcome: string;
    explanation: string;
    answer: string;
    tone: "success" | "warning" | "neutral";
    metrics: LabMetric[];
    trace: string[];
}

interface LabPreset {
    label: string;
    title: string;
    description: string;
    challenge: string;
    safetyNote?: string;
    controls: LabControl[];
    predictions: PredictionOption[];
    evaluate: (values: Record<string, number>) => LabResult;
}

export interface FreeLabCompletion {
    mode: FreeLabMode;
    predictionCorrect?: boolean;
    outcome: string;
    values: Record<string, number>;
}

export interface FreeLabSimulatorProps {
    mode: FreeLabMode;
    title?: string;
    description?: string;
    initialValues?: Record<string, number>;
    onComplete?: (completion: FreeLabCompletion) => void;
    className?: string;
}

const getValue = (values: Record<string, number>, key: string, fallback = 0) =>
    values[key] ?? fallback;

const round = (value: number, digits = 1) => {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
};

const canonicalMode: Record<FreeLabMode, CanonicalLabMode> = {
    "logic-code": "logic-code",
    android: "android",
    "ml-evaluation": "ml-evaluation",
    web: "web",
    git: "git",
    hardware: "circuits",
    circuits: "circuits",
    microbit: "microbit",
    gpio: "gpio-iot",
    iot: "gpio-iot",
    "gpio-iot": "gpio-iot",
    tinyml: "tinyml",
    data: "data-ml",
    ml: "data-ml",
    "data-ml": "data-ml",
    unity: "unity-physics",
    "game-physics": "unity-physics",
    "unity-physics": "unity-physics",
    agent: "agent-tools",
    "tool-workflow": "agent-tools",
    "agent-tools": "agent-tools",
};

const presets: Record<CanonicalLabMode, LabPreset> = {
    "logic-code": {
        label: "Logic & code",
        title: "Branch and loop tracer",
        description:
            "Change an input and loop count, predict the path, then inspect a step-by-step conceptual trace. This is not a code runtime.",
        challenge:
            "Will the program take the low, even, or odd branch for this input?",
        controls: [
            {
                id: "input",
                label: "Program input",
                help: "The value tested by the conditional.",
                min: 0,
                max: 20,
                step: 1,
                initial: 8,
            },
            {
                id: "loops",
                label: "Loop repetitions",
                help: "How many times the selected value is added.",
                min: 1,
                max: 8,
                step: 1,
                initial: 3,
            },
        ],
        predictions: [
            { value: "low", label: "Low branch" },
            { value: "even", label: "Even branch" },
            { value: "odd", label: "Odd branch" },
        ],
        evaluate: (values) => {
            const input = getValue(values, "input");
            const loops = getValue(values, "loops", 1);
            const answer = input < 5 ? "low" : input % 2 === 0 ? "even" : "odd";
            const increment = answer === "low" ? 1 : answer === "even" ? 2 : 3;
            const total = increment * loops;
            return {
                answer,
                outcome: `${answer[0].toUpperCase()}${answer.slice(
                    1
                )} branch selected`,
                explanation: `The input is ${
                    input < 5
                        ? "below 5"
                        : `${input % 2 === 0 ? "even" : "odd"} and at least 5`
                }. The loop adds ${increment} on each repetition.`,
                tone: "success",
                metrics: [
                    { label: "Branch", value: answer },
                    { label: "Final total", value: String(total) },
                    { label: "Iterations", value: String(loops) },
                ],
                trace: Array.from(
                    { length: loops },
                    (_, index) =>
                        `Modeled iteration ${index + 1}: total = ${
                            (index + 1) * increment
                        }`
                ),
            };
        },
    },
    android: {
        label: "Android",
        title: "Screen rotation state lab",
        description:
            "Tap a counter, rotate the virtual phone, and see which Jetpack Compose state holders keep their value when Android recreates the Activity. This models the lifecycle; it does not run Android Studio or an emulator.",
        challenge:
            "After the rotations, will the counter still show your taps, or reset to 0?",
        controls: [
            {
                id: "taps",
                label: "Taps before rotating",
                help: "How many times the learner pressed the + button.",
                min: 0,
                max: 10,
                step: 1,
                initial: 3,
            },
            {
                id: "rotations",
                label: "Screen rotations",
                help: "Each rotation is a configuration change that destroys and recreates the Activity.",
                min: 0,
                max: 3,
                step: 1,
                initial: 1,
            },
            {
                id: "holder",
                label: "Where the count is stored",
                help: "0 = remember { mutableStateOf(0) }, 1 = rememberSaveable { mutableStateOf(0) }, 2 = a ViewModel property.",
                min: 0,
                max: 2,
                step: 1,
                initial: 0,
            },
        ],
        predictions: [
            { value: "keeps", label: "Keeps the tap count" },
            { value: "resets", label: "Resets to 0" },
        ],
        evaluate: (values) => {
            const taps = getValue(values, "taps");
            const rotations = getValue(values, "rotations");
            const holder = getValue(values, "holder");
            const holderLabel =
                holder === 0
                    ? "remember { mutableStateOf(0) }"
                    : holder === 1
                    ? "rememberSaveable { mutableStateOf(0) }"
                    : "ViewModel property";
            const answer = rotations > 0 && holder === 0 ? "resets" : "keeps";
            const shown = answer === "resets" ? 0 : taps;
            const rotationTrace = Array.from(
                { length: rotations },
                (_, index) =>
                    `Rotation ${
                        index + 1
                    }: onPause → onStop → onDestroy, then a new Activity runs onCreate → onStart → onResume`
            );
            return {
                answer,
                outcome:
                    answer === "resets"
                        ? "Counter reset to 0"
                        : `Counter still shows ${taps}`,
                explanation:
                    rotations === 0
                        ? "Without a configuration change the Activity is never recreated, so every state holder keeps its value. Rotate at least once to see the difference."
                        : holder === 0
                        ? "remember keeps a value across recompositions, but rotating the screen destroys the Activity and its composition. The new composition starts from mutableStateOf(0) again."
                        : holder === 1
                        ? "rememberSaveable writes the value into the saved instance state before the Activity is destroyed and restores it in the new one."
                        : "A ViewModel lives outside the Activity and is kept across configuration changes, so the new Activity reconnects to the same ViewModel and its count.",
                tone: answer === "resets" ? "warning" : "success",
                metrics: [
                    { label: "Counter shown", value: String(shown) },
                    {
                        label: "Activities created",
                        value: String(1 + rotations),
                    },
                    { label: "State holder", value: holderLabel },
                ],
                trace: [
                    "App launch: onCreate → setContent { CounterScreen() }",
                    `Learner tapped + ${taps} time${
                        taps === 1 ? "" : "s"
                    }: count = ${taps}`,
                    ...rotationTrace,
                    rotations === 0
                        ? `No configuration change: count stays ${taps}`
                        : `${holderLabel} → count = ${shown}`,
                ],
            };
        },
    },
    "ml-evaluation": {
        label: "ML evaluation",
        title: "Threshold and imbalance lab",
        description:
            "Change how rare the positive class is and where the decision threshold sits, then compare the modeled classifier with a baseline that always predicts 'no'. The classifier's behavior is a fixed teaching formula; this page does not train or run a model.",
        challenge:
            "Will the modeled classifier's accuracy beat a baseline that always predicts 'no'?",
        controls: [
            {
                id: "positives",
                label: "Positive cases per 100",
                help: "How common the class you care about is, for example sick patients or fraud.",
                min: 1,
                max: 50,
                step: 1,
                initial: 10,
            },
            {
                id: "threshold",
                label: "Decision threshold",
                help: "Predict 'yes' when the modeled score is at or above this value. Lower thresholds catch more positives and raise more false alarms.",
                min: 10,
                max: 90,
                step: 5,
                initial: 50,
                unit: "%",
            },
        ],
        predictions: [
            { value: "beats", label: "Beats the baseline" },
            { value: "loses", label: "Baseline wins on accuracy" },
        ],
        evaluate: (values) => {
            const total = 1000;
            const positives = Math.round(
                (getValue(values, "positives", 10) / 100) * total
            );
            const negatives = total - positives;
            const threshold = getValue(values, "threshold", 50) / 100;
            // Teaching formula: recall falls and false alarms fall as the
            // threshold rises.
            const recallRate = Math.min(Math.max(1.1 - threshold, 0), 1);
            const falseAlarmRate = Math.min(
                Math.max((1 - threshold) * 0.4, 0),
                1
            );
            const tp = Math.round(recallRate * positives);
            const fn = positives - tp;
            const fp = Math.round(falseAlarmRate * negatives);
            const tn = negatives - fp;
            const accuracy = (tp + tn) / total;
            const baseline = negatives / total;
            const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
            const recall = positives === 0 ? 0 : tp / positives;
            const f1 =
                precision + recall === 0
                    ? 0
                    : (2 * precision * recall) / (precision + recall);
            const pct = (value: number) => `${round(value * 100)}%`;
            const answer = accuracy > baseline ? "beats" : "loses";
            return {
                answer,
                outcome:
                    answer === "beats"
                        ? `Accuracy ${pct(accuracy)} beats the ${pct(
                              baseline
                          )} baseline`
                        : `Baseline ${pct(baseline)} beats accuracy ${pct(
                              accuracy
                          )}`,
                explanation:
                    answer === "beats"
                        ? `The classifier is more accurate than always saying 'no', and it finds ${pct(
                              recall
                          )} of the positives, which the baseline never does. Check precision too: ${fp} of its ${
                              tp + fp
                          } 'yes' predictions are false alarms.`
                        : `When positives are rare, always saying 'no' is already ${pct(
                              baseline
                          )} accurate while catching none of them. Accuracy alone hides that; precision (${pct(
                              precision
                          )}), recall (${pct(
                              recall
                          )}), and F1 show what the classifier actually does.`,
                tone: answer === "beats" ? "success" : "warning",
                metrics: [
                    { label: "Accuracy", value: pct(accuracy) },
                    { label: "Always-'no' baseline", value: pct(baseline) },
                    { label: "Precision", value: pct(precision) },
                    { label: "Recall", value: pct(recall) },
                    { label: "F1", value: pct(f1) },
                ],
                trace: [
                    `Modeled ${total} cases: ${positives} positive, ${negatives} negative`,
                    `Threshold ${pct(threshold)}: predicted 'yes' for ${
                        tp + fp
                    } cases`,
                    `Confusion matrix: TP ${tp}, FN ${fn}, FP ${fp}, TN ${tn}`,
                    `Accuracy (TP + TN) / ${total} = ${pct(accuracy)}`,
                    `Baseline always predicts 'no': ${negatives} / ${total} = ${pct(
                        baseline
                    )}`,
                ],
            };
        },
    },
    web: {
        label: "Web",
        title: "Responsive layout lab",
        description:
            "Resize a virtual browser and vary the content to see a responsive grid adapt without installing an editor.",
        challenge:
            "How many columns will the card grid use at this viewport width?",
        controls: [
            {
                id: "viewport",
                label: "Viewport width",
                help: "The simulated browser width.",
                min: 320,
                max: 1440,
                step: 10,
                initial: 760,
                unit: " px",
            },
            {
                id: "cards",
                label: "Number of cards",
                help: "Items placed into the responsive grid.",
                min: 1,
                max: 12,
                step: 1,
                initial: 6,
            },
        ],
        predictions: [
            { value: "1", label: "1 column" },
            { value: "2", label: "2 columns" },
            { value: "3", label: "3 columns" },
        ],
        evaluate: (values) => {
            const viewport = getValue(values, "viewport");
            const cards = getValue(values, "cards", 1);
            const columns = viewport < 600 ? 1 : viewport < 1000 ? 2 : 3;
            const rows = Math.ceil(cards / columns);
            return {
                answer: String(columns),
                outcome: `${columns}-column layout`,
                explanation: `The responsive rules use one column below 600 px, two from 600–999 px, and three at 1000 px or wider.`,
                tone: "success",
                metrics: [
                    { label: "Columns", value: String(columns) },
                    { label: "Rows", value: String(rows) },
                    { label: "Viewport", value: `${viewport} px` },
                ],
                trace: [
                    `Read viewport width: ${viewport} px`,
                    `Matched the ${columns}-column breakpoint`,
                    `Placed ${cards} cards across ${rows} row${
                        rows === 1 ? "" : "s"
                    }`,
                ],
            };
        },
    },
    git: {
        label: "Git",
        title: "Branch and merge simulator",
        description:
            "Practice version-control decisions in a disposable visual workflow—no GitHub account or repository needed.",
        challenge:
            "What result will this modeled branch situation produce when the feature is merged?",
        controls: [
            {
                id: "mainCommits",
                label: "New commits on main",
                help: "Commits made after the feature branch was created.",
                min: 0,
                max: 5,
                step: 1,
                initial: 1,
            },
            {
                id: "featureCommits",
                label: "Commits on feature",
                help: "The changes waiting to be merged.",
                min: 1,
                max: 6,
                step: 1,
                initial: 3,
            },
            {
                id: "overlap",
                label: "Overlapping edit level",
                help: "0 = unrelated content, 1 = different parts of one file, 2 = different edits to the same lines.",
                min: 0,
                max: 2,
                step: 1,
                initial: 0,
            },
        ],
        predictions: [
            { value: "fast-forward", label: "Fast-forward" },
            { value: "three-way", label: "Three-way merge" },
            { value: "conflict", label: "Conflict requires resolution" },
        ],
        evaluate: (values) => {
            const main = getValue(values, "mainCommits");
            const feature = getValue(values, "featureCommits", 1);
            const overlap = getValue(values, "overlap");
            const effectiveOverlap = main === 0 ? 0 : overlap;
            const answer =
                main === 0
                    ? "fast-forward"
                    : effectiveOverlap === 2
                    ? "conflict"
                    : "three-way";
            const overlapLabel =
                main === 0
                    ? "not applicable because main has no new edits"
                    : effectiveOverlap === 0
                    ? "unrelated content"
                    : effectiveOverlap === 1
                    ? "different parts of the same file"
                    : "different edits to the same lines";
            return {
                answer,
                outcome:
                    answer === "fast-forward"
                        ? "Fast-forward merge"
                        : answer === "three-way"
                        ? "Three-way merge"
                        : "Merge conflict requires resolution",
                explanation:
                    answer === "fast-forward"
                        ? "Main did not move, so its pointer can advance directly to the feature tip."
                        : answer === "three-way"
                        ? `Both branches moved, so Git uses their common base and two tips. The modeled edits affect ${overlapLabel}, so this example can be combined automatically.`
                        : "In this simplified case, both branches made different changes to the same modeled lines. Git cannot infer which content to keep, so a person must resolve the conflict. Commit count alone does not determine whether a conflict occurs.",
                tone: answer === "conflict" ? "warning" : "success",
                metrics: [
                    { label: "Main commits", value: String(main) },
                    { label: "Feature commits", value: String(feature) },
                    { label: "Edit overlap", value: overlapLabel },
                    { label: "Strategy", value: answer },
                ],
                trace: [
                    "Created branch feature from a shared base",
                    `Advanced main by ${main} commit${main === 1 ? "" : "s"}`,
                    `Advanced feature by ${feature} commit${
                        feature === 1 ? "" : "s"
                    }`,
                    `Compared edits: ${overlapLabel}`,
                    `Selected ${answer} workflow`,
                ],
            };
        },
    },
    circuits: {
        label: "Hardware & circuits",
        title: "Specified virtual LED model",
        description:
            "Explore a simplified voltage, resistance, and current model for one specified virtual LED. No parts or purchase required.",
        challenge:
            "Will this specified virtual LED be off, within its modeled operating range, or above that modeled range?",
        safetyNote:
            "This toy calculation assumes one virtual LED with a 2 V forward-voltage estimate and a modeled 1–20 mA operating band. It is not a component rating, GPIO-pin limit, wiring guide, or guarantee of safety. For physical work, use the exact LED and board datasheets, disconnect power before rewiring, use appropriate current limiting and driver circuitry, never connect to household or mains voltage, and work with qualified instructor or adult supervision.",
        controls: [
            {
                id: "voltage",
                label: "Supply voltage",
                help: "Virtual battery or controller voltage.",
                min: 0,
                max: 9,
                step: 0.5,
                initial: 5,
                unit: " V",
            },
            {
                id: "resistance",
                label: "Series resistance",
                help: "The resistor limiting LED current.",
                min: 100,
                max: 1000,
                step: 10,
                initial: 330,
                unit: " Ω",
            },
        ],
        predictions: [
            { value: "off", label: "LED off" },
            { value: "modeled", label: "Within modeled range" },
            { value: "over-current", label: "Above modeled range" },
        ],
        evaluate: (values) => {
            const voltage = getValue(values, "voltage");
            const resistance = Math.max(getValue(values, "resistance"), 1);
            const current = Math.max(((voltage - 2) / resistance) * 1000, 0);
            const answer =
                current < 1
                    ? "off"
                    : current <= 20
                    ? "modeled"
                    : "over-current";
            return {
                answer,
                outcome:
                    answer === "modeled"
                        ? "Specified virtual LED is within its modeled range"
                        : answer === "off"
                        ? "Specified virtual LED is modeled as off"
                        : "Specified virtual LED is above its modeled range",
                explanation: `Using a 2 V LED estimate, Ohm’s law gives about ${round(
                    current
                )} mA. For this teaching example only, 1–20 mA is the modeled operating band; it is not a generic LED rating or GPIO safety limit.`,
                tone: answer === "over-current" ? "warning" : "success",
                metrics: [
                    { label: "LED current", value: `${round(current)} mA` },
                    { label: "Voltage", value: `${voltage} V` },
                    { label: "Resistance", value: `${resistance} Ω` },
                ],
                trace: [
                    `Subtract estimated LED drop: ${voltage} V − 2 V`,
                    `Divide by ${resistance} Ω`,
                    `Convert current to ${round(current)} mA`,
                    `Compare the result with this virtual LED’s modeled band: ${answer}`,
                ],
            };
        },
    },
    microbit: {
        label: "micro:bit",
        title: "micro:bit event concept lab",
        description:
            "Explore a simplified relationship between button counts, a display pattern, and a radio-group value. This page does not run MakeCode or MicroPython or emulate a micro:bit.",
        challenge:
            "Will the modeled event produce a small, medium, or full display pattern?",
        safetyNote:
            "No device is connected. Physical projects should use approved low-voltage accessories and follow classroom safety guidance.",
        controls: [
            {
                id: "presses",
                label: "Button A presses",
                help: "How many button events the program receives.",
                min: 0,
                max: 10,
                step: 1,
                initial: 4,
            },
            {
                id: "radio",
                label: "Radio group",
                help: "A virtual channel shared by communicating devices.",
                min: 1,
                max: 20,
                step: 1,
                initial: 7,
            },
        ],
        predictions: [
            { value: "small", label: "Small signal" },
            { value: "medium", label: "Medium signal" },
            { value: "full", label: "Full signal" },
        ],
        evaluate: (values) => {
            const presses = getValue(values, "presses");
            const group = getValue(values, "radio", 1);
            const answer =
                presses <= 2 ? "small" : presses <= 6 ? "medium" : "full";
            const leds =
                answer === "small"
                    ? presses * 2
                    : answer === "medium"
                    ? 15
                    : 25;
            return {
                answer,
                outcome: `${answer} modeled display pattern`,
                explanation: `This teaching rule maps the button-count value to a display pattern and shows the payload that a program could send to radio group ${group}. No radio message is transmitted.`,
                tone: "success",
                metrics: [
                    { label: "LEDs lit", value: `${leds}/25` },
                    { label: "Button events", value: String(presses) },
                    { label: "Radio group", value: String(group) },
                ],
                trace: [
                    `Read ${presses} modeled button A event${
                        presses === 1 ? "" : "s"
                    }`,
                    `Mapped the count to a ${answer} display pattern`,
                    `Formed example radio payload {"presses":${presses}} for group ${group}`,
                ],
            };
        },
    },
    "gpio-iot": {
        label: "GPIO & IoT",
        title: "Sensor and MQTT concept lab",
        description:
            "Compare a modeled sensor value with a threshold, calculate an example GPIO state, and form an MQTT-style payload. No GPIO or broker is connected.",
        challenge:
            "Will the modeled controller leave the fan off or turn it on?",
        safetyNote:
            "The GPIO and sensor are simulated. Physical motors require a suitable driver and separate low-voltage power plan.",
        controls: [
            {
                id: "sensor",
                label: "Temperature reading",
                help: "Sample data from the virtual sensor.",
                min: 10,
                max: 45,
                step: 1,
                initial: 27,
                unit: " °C",
            },
            {
                id: "threshold",
                label: "Fan threshold",
                help: "The temperature at which the output turns on.",
                min: 15,
                max: 40,
                step: 1,
                initial: 30,
                unit: " °C",
            },
        ],
        predictions: [
            { value: "off", label: "Fan off" },
            { value: "on", label: "Fan on" },
            { value: "equal", label: "Exactly at threshold" },
        ],
        evaluate: (values) => {
            const sensor = getValue(values, "sensor");
            const threshold = getValue(values, "threshold");
            const answer =
                sensor === threshold
                    ? "equal"
                    : sensor > threshold
                    ? "on"
                    : "off";
            const gpioHigh = sensor >= threshold;
            return {
                answer,
                outcome: `Modeled GPIO state ${gpioHigh ? "HIGH" : "LOW"}`,
                explanation: `The teaching rule compares ${sensor} °C with the ${threshold} °C threshold. It forms an example message and models the output as ${
                    gpioHigh ? "high" : "low"
                }; nothing is published or electrically driven.`,
                tone: "success",
                metrics: [
                    { label: "Sensor", value: `${sensor} °C` },
                    { label: "GPIO", value: gpioHigh ? "HIGH" : "LOW" },
                    {
                        label: "MQTT topic",
                        value: "lab/temperature",
                    },
                ],
                trace: [
                    `Read virtual sensor: ${sensor} °C`,
                    `Compared reading with threshold: ${threshold} °C`,
                    `Modeled GPIO 17 as ${gpioHigh ? "HIGH" : "LOW"}`,
                    `Formed example payload {"temperature":${sensor},"fan":"${
                        gpioHigh ? "on" : "off"
                    }"}`,
                ],
            };
        },
    },
    tinyml: {
        label: "TinyML",
        title: "Edge model budget concept lab",
        description:
            "Compare learner-selected size, confidence, memory, and latency estimates without loading or running a model, board, cloud service, or GPU.",
        challenge:
            "Will this modeled decision be rejected, accepted, or blocked by the device budget?",
        controls: [
            {
                id: "confidence",
                label: "Confidence estimate",
                help: "A learner-selected estimate for the strongest modeled class.",
                min: 0,
                max: 100,
                step: 1,
                initial: 76,
                unit: "%",
            },
            {
                id: "modelSize",
                label: "Model-size estimate",
                help: "An entered estimate of flash memory a model might use.",
                min: 32,
                max: 512,
                step: 16,
                initial: 128,
                unit: " KB",
            },
            {
                id: "memoryBudget",
                label: "Device memory budget",
                help: "Flash available for the model.",
                min: 64,
                max: 384,
                step: 16,
                initial: 192,
                unit: " KB",
            },
        ],
        predictions: [
            { value: "reject", label: "Reject as uncertain" },
            { value: "classify", label: "Accept modeled classification" },
            { value: "budget", label: "Blocked by memory" },
        ],
        evaluate: (values) => {
            const confidence = getValue(values, "confidence");
            const modelSize = getValue(values, "modelSize");
            const budget = getValue(values, "memoryBudget");
            const answer =
                modelSize > budget
                    ? "budget"
                    : confidence < 65
                    ? "reject"
                    : "classify";
            const latency = round(modelSize / 18, 0);
            return {
                answer,
                outcome:
                    answer === "budget"
                        ? "Model does not fit the device budget"
                        : answer === "reject"
                        ? "Prediction rejected as uncertain"
                        : "Modeled classification accepted",
                explanation:
                    answer === "budget"
                        ? `The entered ${modelSize} KB size exceeds the ${budget} KB budget. A real project would need evidence for a smaller or quantized model.`
                        : `The entered size fits the modeled budget. The provided confidence value is ${confidence}%, compared with a 65% teaching threshold; no model inference occurs.`,
                tone: answer === "classify" ? "success" : "warning",
                metrics: [
                    { label: "Size estimate", value: `${modelSize} KB` },
                    { label: "Budget", value: `${budget} KB` },
                    { label: "Modeled latency", value: `${latency} ms` },
                ],
                trace: [
                    `Checked model size: ${modelSize} KB`,
                    `Checked available budget: ${budget} KB`,
                    modelSize <= budget
                        ? `Compared confidence ${confidence}% with 65% threshold`
                        : "Marked the entered size as over budget",
                    `Returned modeled result: ${answer}`,
                ],
            };
        },
    },
    "data-ml": {
        label: "Data & ML",
        title: "Classification boundary concept explorer",
        description:
            "Move a sample and specified boundary to explore a simplified class and uncertainty rule. This page does not train or run an ML model.",
        challenge:
            "Which result will this simplified boundary rule produce for the sample?",
        controls: [
            {
                id: "feature",
                label: "Sample feature",
                help: "The sample’s position on a one-dimensional feature axis.",
                min: 0,
                max: 100,
                step: 1,
                initial: 62,
            },
            {
                id: "boundary",
                label: "Decision boundary",
                help: "Where the simple classifier changes classes.",
                min: 20,
                max: 80,
                step: 1,
                initial: 50,
            },
            {
                id: "sampleSize",
                label: "Modeled example count",
                help: "A conceptual value used only in the displayed confidence formula.",
                min: 20,
                max: 500,
                step: 20,
                initial: 100,
            },
        ],
        predictions: [
            { value: "class-a", label: "Class A" },
            { value: "uncertain", label: "Uncertain" },
            { value: "class-b", label: "Class B" },
        ],
        evaluate: (values) => {
            const feature = getValue(values, "feature");
            const boundary = getValue(values, "boundary", 50);
            const sampleSize = getValue(values, "sampleSize", 20);
            const distance = feature - boundary;
            const confidence = Math.min(
                98,
                50 + Math.abs(distance) * 2 + Math.log10(sampleSize) * 3
            );
            const answer =
                Math.abs(distance) <= 3
                    ? "uncertain"
                    : distance < 0
                    ? "class-a"
                    : "class-b";
            return {
                answer,
                outcome:
                    answer === "uncertain"
                        ? "Modeled sample is near the boundary"
                        : `Modeled result: ${
                              answer === "class-a" ? "Class A" : "Class B"
                          }`,
                explanation: `The entered sample is ${Math.abs(
                    distance
                )} units from the specified boundary. This teaching formula illustrates how distance can relate to a score; it is not trained-model confidence and does not establish correctness or fairness.`,
                tone: answer === "uncertain" ? "warning" : "neutral",
                metrics: [
                    { label: "Modeled result", value: answer },
                    {
                        label: "Conceptual score",
                        value: `${round(confidence)}%`,
                    },
                    {
                        label: "Example-count input",
                        value: String(sampleSize),
                    },
                ],
                trace: [
                    `Read feature value: ${feature}`,
                    `Compare with boundary: ${boundary}`,
                    `Distance from boundary: ${distance}`,
                    `Return ${answer} with conceptual score ${round(
                        confidence
                    )}%`,
                ],
            };
        },
    },
    "unity-physics": {
        label: "Unity & game physics",
        title: "Movement formula concept lab",
        description:
            "Explore a simplified force, mass, velocity, and distance formula. This page does not run Unity or a physics engine; local Unity use is optional.",
        challenge: "Will the object accelerate slowly, moderately, or quickly?",
        controls: [
            {
                id: "force",
                label: "Applied force",
                help: "The virtual force applied to the object.",
                min: 1,
                max: 30,
                step: 1,
                initial: 10,
                unit: " N",
            },
            {
                id: "mass",
                label: "Object mass",
                help: "A heavier object accelerates less under the same force.",
                min: 1,
                max: 10,
                step: 0.5,
                initial: 2,
                unit: " kg",
            },
            {
                id: "time",
                label: "Simulation time",
                help: "How long the force acts from rest.",
                min: 1,
                max: 8,
                step: 0.5,
                initial: 3,
                unit: " s",
            },
        ],
        predictions: [
            { value: "slow", label: "Slow acceleration" },
            { value: "moderate", label: "Moderate acceleration" },
            { value: "fast", label: "Fast acceleration" },
        ],
        evaluate: (values) => {
            const force = getValue(values, "force", 1);
            const mass = Math.max(getValue(values, "mass", 1), 0.1);
            const time = getValue(values, "time", 1);
            const acceleration = force / mass;
            const velocity = acceleration * time;
            const distance = 0.5 * acceleration * time ** 2;
            const answer =
                acceleration < 3
                    ? "slow"
                    : acceleration < 8
                    ? "moderate"
                    : "fast";
            return {
                answer,
                outcome: `${answer} virtual acceleration`,
                explanation: `Using F = ma, ${force} N ÷ ${mass} kg gives ${round(
                    acceleration
                )} m/s². This simplified lab ignores drag and collision losses.`,
                tone: "success",
                metrics: [
                    {
                        label: "Acceleration",
                        value: `${round(acceleration)} m/s²`,
                    },
                    {
                        label: "Final velocity",
                        value: `${round(velocity)} m/s`,
                    },
                    { label: "Distance", value: `${round(distance)} m` },
                ],
                trace: [
                    `Calculate acceleration: ${force} ÷ ${mass}`,
                    `Calculate velocity after ${time} s`,
                    "Calculate distance from rest",
                    `Classify acceleration as ${answer}`,
                ],
            };
        },
    },
    "agent-tools": {
        label: "Agent & tool workflows",
        title: "Tool-permission policy simulator",
        description:
            "Explore an observe–plan–act–verify policy with deterministic values. No model, tool, repository, test suite, paid key, or cloud account is connected.",
        challenge:
            "Will this simplified policy recommend allowing the proposed action, requiring approval, or blocking it?",
        safetyNote:
            "All outputs are deterministic course simulations. Never give a learning agent unrestricted production credentials.",
        controls: [
            {
                id: "risk",
                label: "Action risk",
                help: "0 is read-only; higher values represent broader mutations.",
                min: 0,
                max: 10,
                step: 1,
                initial: 4,
            },
            {
                id: "permission",
                label: "Granted permission",
                help: "The maximum action risk authorized by the user.",
                min: 0,
                max: 10,
                step: 1,
                initial: 5,
            },
            {
                id: "confidence",
                label: "Verification confidence",
                help: "An entered evidence score for this simplified policy.",
                min: 0,
                max: 100,
                step: 5,
                initial: 80,
                unit: "%",
            },
        ],
        predictions: [
            { value: "run", label: "Allow in this model" },
            { value: "approval", label: "Ask for approval" },
            { value: "blocked", label: "Block action" },
        ],
        evaluate: (values) => {
            const risk = getValue(values, "risk");
            const permission = getValue(values, "permission");
            const confidence = getValue(values, "confidence");
            const answer =
                risk > permission + 2 || confidence < 50
                    ? "blocked"
                    : risk > permission || confidence < 75
                    ? "approval"
                    : "run";
            return {
                answer,
                outcome:
                    answer === "run"
                        ? "Policy model would allow the action"
                        : answer === "approval"
                        ? "Human approval required"
                        : "Action blocked by policy",
                explanation: `The policy compares action risk (${risk}) with granted permission (${permission}) and verification confidence (${confidence}%). Ambiguous or over-broad actions stop safely.`,
                tone: answer === "run" ? "success" : "warning",
                metrics: [
                    { label: "Decision", value: answer },
                    { label: "Risk", value: `${risk}/10` },
                    { label: "Verification", value: `${confidence}%` },
                ],
                trace: [
                    "Observe: read the provided task-state values",
                    `Plan: propose action with risk score ${risk}`,
                    `Act gate: compare against permission ${permission}`,
                    `Verify: compare the provided evidence score ${confidence}%`,
                    `Policy decision: ${answer}`,
                ],
            };
        },
    },
};

const resultToneClasses: Record<LabResult["tone"], string> = {
    success: "border-emerald-500/40 bg-emerald-500/[0.08]",
    warning: "border-amber-500/40 bg-amber-500/[0.08]",
    neutral:
        "border-brand-purple-secondary/40 bg-brand-purple-secondary/[0.08]",
};

const FreeLabSimulator: React.FC<FreeLabSimulatorProps> = ({
    mode,
    title,
    description,
    initialValues,
    onComplete,
    className,
}) => {
    const baseId = useId();
    const preset = presets[canonicalMode[mode]];
    const defaults = useMemo(
        () =>
            preset.controls.reduce<Record<string, number>>(
                (accumulator, control) => {
                    const supplied = initialValues?.[control.id];
                    accumulator[control.id] =
                        supplied === undefined
                            ? control.initial
                            : Math.min(
                                  Math.max(supplied, control.min),
                                  control.max
                              );
                    return accumulator;
                },
                {}
            ),
        [initialValues, preset]
    );
    const [values, setValues] = useState<Record<string, number>>(defaults);
    const [prediction, setPrediction] = useState<string>();
    const [result, setResult] = useState<LabResult>();
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        setValues(defaults);
        setPrediction(undefined);
        setResult(undefined);
        setAttempt(0);
    }, [defaults]);

    const handleRun = () => {
        const nextResult = preset.evaluate(values);
        setResult(nextResult);
        setAttempt((current) => current + 1);
        onComplete?.({
            mode,
            predictionCorrect:
                prediction === undefined
                    ? undefined
                    : prediction === nextResult.answer,
            outcome: nextResult.outcome,
            values: { ...values },
        });
    };

    const handleReset = () => {
        setValues(defaults);
        setPrediction(undefined);
        setResult(undefined);
        setAttempt(0);
    };

    const predictionCorrect =
        result && prediction !== undefined
            ? prediction === result.answer
            : undefined;

    return (
        <section
            aria-labelledby={`${baseId}-title`}
            className={clsx(
                "w-full overflow-hidden rounded-2xl border border-white/10 bg-dark-grey-secondary text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]",
                className
            )}
        >
            <header className="border-b border-white/10 bg-gradient-to-br from-brand-purple-primary/25 via-dark-grey-secondary to-dark-grey-secondary p-4 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-brand-purple-secondary/60 bg-brand-purple-secondary/15 px-2.5 py-1 text-xs font-bold text-[#DCE4FF]">
                                {preset.label}
                            </span>
                            <span className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
                                Free · no account
                            </span>
                            <span className="rounded-full border border-white/10 bg-dark-grey-primary/50 px-2.5 py-1 text-xs font-semibold text-[#D6D3DC]">
                                No special hardware
                            </span>
                        </div>
                        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                            Free concept simulator
                        </p>
                        <h2
                            id={`${baseId}-title`}
                            className="mt-1 text-2xl font-bold sm:text-3xl"
                        >
                            {title || preset.title}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#C7C3CE] sm:text-base">
                            {description || preset.description}
                        </p>
                    </div>
                    {attempt > 0 && (
                        <span
                            aria-live="polite"
                            className="self-start whitespace-nowrap rounded-full bg-dark-grey-primary/60 px-3 py-1.5 text-xs font-semibold text-medium-grey"
                        >
                            Attempts: {attempt}
                        </span>
                    )}
                </div>
                {preset.safetyNote && (
                    <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3 text-sm leading-6 text-amber-100">
                        <strong>Safety note:</strong> {preset.safetyNote}
                    </p>
                )}
            </header>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="border-b border-white/10 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-medium-grey">
                            1 · Predict
                        </p>
                        <p className="mt-2 font-semibold leading-6 text-white">
                            {preset.challenge}
                        </p>
                        <div
                            role="group"
                            aria-label="Choose a prediction"
                            className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
                        >
                            {preset.predictions.map((option) => {
                                const selected = prediction === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            setPrediction(option.value)
                                        }
                                        className={clsx(
                                            "min-h-[44px] rounded-xl border px-3 py-2 text-sm font-semibold outline-none motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-brand-purple-secondary",
                                            selected
                                                ? "border-brand-purple-secondary bg-brand-purple-secondary/20 text-white"
                                                : "border-white/10 bg-dark-grey-primary/30 text-[#C7C3CE] hover:border-brand-purple-secondary/50 hover:text-white"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-medium-grey">
                            2 · Explore
                        </p>
                        <div className="mt-4 space-y-5">
                            {preset.controls.map((control, index) => {
                                const inputId = `${baseId}-control-${index}`;
                                const value = values[control.id];
                                return (
                                    <div key={control.id}>
                                        <div className="flex items-end justify-between gap-4">
                                            <label
                                                htmlFor={inputId}
                                                className="text-sm font-semibold text-white"
                                            >
                                                {control.label}
                                            </label>
                                            <output
                                                htmlFor={inputId}
                                                className="rounded-lg bg-dark-grey-primary px-2 py-1 text-sm font-bold tabular-nums text-brand-purple-secondary"
                                            >
                                                {value}
                                                {control.unit}
                                            </output>
                                        </div>
                                        <p
                                            id={`${inputId}-help`}
                                            className="mt-1 text-xs leading-5 text-medium-grey"
                                        >
                                            {control.help}
                                        </p>
                                        <input
                                            id={inputId}
                                            aria-describedby={`${inputId}-help`}
                                            type="range"
                                            min={control.min}
                                            max={control.max}
                                            step={control.step}
                                            value={value}
                                            onChange={(event) => {
                                                const nextValue = Number(
                                                    event.target.value
                                                );
                                                setValues((current) => ({
                                                    ...current,
                                                    [control.id]: nextValue,
                                                }));
                                                setResult(undefined);
                                            }}
                                            className="mt-2 h-11 w-full cursor-pointer accent-[#7892EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple-secondary"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="flex justify-between text-[11px] text-dim-grey"
                                        >
                                            <span>
                                                {control.min}
                                                {control.unit}
                                            </span>
                                            <span>
                                                {control.max}
                                                {control.unit}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleRun}
                            className="min-h-[46px] flex-1 rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-2.5 text-sm font-bold text-white outline-none motion-safe:transition-[filter,transform] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-secondary active:translate-y-px"
                        >
                            Run simulation
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="min-h-[46px] rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#D6D3DC] outline-none motion-safe:transition-colors hover:border-brand-purple-secondary/60 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="min-w-0 bg-dark-grey-primary/20 p-4 sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-medium-grey">
                        3 · Inspect the result
                    </p>
                    {!result ? (
                        <div className="mt-4 flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-dim-grey/50 bg-dark-grey-primary/30 p-6 text-center">
                            <div>
                                <span
                                    aria-hidden="true"
                                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple-primary/20 text-xl text-brand-purple-secondary"
                                >
                                    ▶
                                </span>
                                <h3 className="mt-3 font-bold text-white">
                                    Ready to simulate
                                </h3>
                                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-medium-grey">
                                    Choose a prediction, adjust the controls,
                                    and run the lab. The displayed result comes
                                    from the simplified values and rules on this
                                    page.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mt-4 space-y-4"
                        >
                            <section
                                className={clsx(
                                    "rounded-2xl border p-4",
                                    resultToneClasses[result.tone]
                                )}
                            >
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-medium-grey">
                                    Outcome
                                </p>
                                <h3 className="mt-1 text-xl font-bold text-white">
                                    {result.outcome}
                                </h3>
                                {predictionCorrect !== undefined && (
                                    <p
                                        className={clsx(
                                            "mt-2 text-sm font-semibold",
                                            predictionCorrect
                                                ? "text-emerald-200"
                                                : "text-amber-200"
                                        )}
                                    >
                                        {predictionCorrect
                                            ? "Your prediction matched the simulation."
                                            : "Your prediction differed—use the trace to find the decision point."}
                                    </p>
                                )}
                                <p className="mt-2 text-sm leading-6 text-[#D4D1D9]">
                                    {result.explanation}
                                </p>
                            </section>

                            <dl className="grid gap-2 sm:grid-cols-3">
                                {result.metrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="min-w-0 rounded-xl border border-white/10 bg-dark-grey-secondary p-3"
                                    >
                                        <dt className="text-xs font-medium text-medium-grey">
                                            {metric.label}
                                        </dt>
                                        <dd className="mt-1 break-words text-sm font-bold text-white">
                                            {metric.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-4">
                                <h3 className="font-bold text-white">
                                    Conceptual trace
                                </h3>
                                <ol className="mt-3 space-y-2">
                                    {result.trace.map((step, index) => (
                                        <li
                                            key={`${step}-${index}`}
                                            className="flex gap-3 text-sm leading-6 text-[#C7C3CE]"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple-primary/25 text-[10px] font-bold text-[#D8D3FF]"
                                            >
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FreeLabSimulator;
