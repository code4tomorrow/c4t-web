/**
 * Dates that make the site change by itself as a live-class session moves
 * from registration to classes to finished. Edit the dates here and every
 * banner, card, and register button follows.
 *
 * All times are midnight Eastern, at the *start* of the day after the stated
 * date. Daylight saving ends on November 1, 2026, so dates before then use
 * -04:00 (EDT) and dates after use -05:00 (EST).
 */
export interface TermSchedule {
    term: string;
    termLabel: string;
    /** "Sign up by October 25" stops showing after this moment. */
    earlyDeadline: string;
    earlyDeadlineLabel: string;
    /** First week of classes begins. */
    classesStart: string;
    /** Registration stays open until this moment, then shows as closed. */
    registrationCloses: string;
    registrationClosesLabel: string;
    /** After the last class; the session's homepage card disappears. */
    ends: string;
    lastClassLabel: string;
    /** Where sign-ups point once this term's registration closes. */
    nextSession: { label: string; starts: string };
}

export const FALL_2026: TermSchedule = {
    term: "fall-2026",
    termLabel: "Fall 2026",
    earlyDeadline: "2026-10-26T00:00:00-04:00",
    earlyDeadlineLabel: "October 25",
    classesStart: "2026-11-01T00:00:00-04:00",
    // Open through the first three weeks of November (Nov 1–21).
    registrationCloses: "2026-11-22T00:00:00-05:00",
    registrationClosesLabel: "November 21",
    // Six weekly classes starting the week of November 1: the last one is
    // Sunday, December 13. Move this a week later if a holiday week is skipped.
    ends: "2026-12-14T00:00:00-05:00",
    lastClassLabel: "December 13",
    nextSession: { label: "Winter 2027", starts: "February 2027" },
};

export const TERM_SCHEDULES: TermSchedule[] = [FALL_2026];

/**
 * - early:   sign-ups open, before the early "sign up by" date
 * - open:    sign-ups open, classes not started yet
 * - started: classes have begun, sign-ups still open
 * - closed:  sign-ups closed, classes in session
 * - ended:   the session is over
 */
export type TermPhase = "early" | "open" | "started" | "closed" | "ended";

export const isRegistrationOpen = (phase: TermPhase) =>
    phase === "early" || phase === "open" || phase === "started";

export const scheduleFor = (term: string) =>
    TERM_SCHEDULES.find((schedule) => schedule.term === term);

const boundaries = (schedule: TermSchedule) =>
    [
        schedule.earlyDeadline,
        schedule.classesStart,
        schedule.registrationCloses,
        schedule.ends,
    ].map((value) => Date.parse(value));

/** The phase of a term at a moment. Unknown terms are treated as open. */
export const getTermPhase = (term: string, now = Date.now()): TermPhase => {
    const schedule = scheduleFor(term);
    if (!schedule) return "open";
    const [early, start, closes, ends] = boundaries(schedule);
    if (now < early) return "early";
    if (now < start) return "open";
    if (now < closes) return "started";
    if (now < ends) return "closed";
    return "ended";
};

/** The next moment this term's phase changes, or null once it has ended. */
export const nextTermChange = (term: string, now = Date.now()) => {
    const schedule = scheduleFor(term);
    if (!schedule) return null;
    return boundaries(schedule).find((moment) => moment > now) ?? null;
};

/**
 * `?asOf=2026-11-25` on any page previews the site as of that date, so the
 * schedule can be checked before it happens. It only changes what that
 * viewer sees.
 */
export const readPreviewDate = (search: string): number | null => {
    const value = new URLSearchParams(search).get("asOf");
    if (!value) return null;
    const parsed = Date.parse(
        /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00-05:00` : value
    );
    return Number.isNaN(parsed) ? null : parsed;
};
