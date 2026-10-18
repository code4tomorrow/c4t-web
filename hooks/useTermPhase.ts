import { useEffect, useState } from "react";
import {
    getTermPhase,
    nextTermChange,
    readPreviewDate,
    type TermPhase,
} from "@utils/sessionSchedule";

// setTimeout overflows above ~24.8 days; longer waits are re-armed.
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * The live phase of a term, kept current while the page is open.
 *
 * `initial` is the phase the server rendered (static pages can be hours old),
 * so the first render matches the HTML. After mount the phase is recomputed
 * from the visitor's clock, and a timer flips it at the next scheduled change
 * — so a page left open overnight updates on its own.
 */
export const useTermPhase = (term: string, initial: TermPhase): TermPhase => {
    const [phase, setPhase] = useState<TermPhase>(initial);

    useEffect(() => {
        const preview = readPreviewDate(window.location.search);
        if (preview !== null) {
            setPhase(getTermPhase(term, preview));
            return;
        }

        let timer: ReturnType<typeof setTimeout> | undefined;
        const update = () => {
            const now = Date.now();
            setPhase(getTermPhase(term, now));
            if (timer) clearTimeout(timer);
            const next = nextTermChange(term, now);
            if (next !== null) {
                timer = setTimeout(
                    update,
                    Math.min(next - now + 1000, MAX_TIMEOUT)
                );
            }
        };
        // Timers pause while a laptop sleeps; re-check when the tab returns.
        const onVisible = () => {
            if (document.visibilityState === "visible") update();
        };

        update();
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            if (timer) clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [term]);

    return phase;
};
