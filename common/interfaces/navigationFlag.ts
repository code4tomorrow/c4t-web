import type { TermPhase } from "@utils/sessionSchedule";

export interface INotificationFlag {
    type: string;
    notification?: {
        json?: any;
    };
    link?: string;
    /** Set on banners that change with a session schedule (utils/announcements). */
    schedule?: {
        term: string;
        /** Phase when the page was rendered; the client re-checks it. */
        phase: TermPhase;
    };
}
