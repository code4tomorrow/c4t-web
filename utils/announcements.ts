import config from "config";
import type { INotificationFlag } from "common/interfaces/navigationFlag";
import {
    FALL_2026,
    getTermPhase,
    isRegistrationOpen,
    type TermPhase,
} from "./sessionSchedule";

/**
 * The banner under the navbar.
 *
 * Banners come from Contentful, but the student-registration banner is now
 * owned here so it opens and closes on the session schedule by itself (and
 * points at the current sign-up form). Contentful entries about student
 * registration are dropped so they can't contradict it, and so are entries
 * that name a past year ("Summer 2023 ...").
 */

const textDocument = (text: string) => ({
    nodeType: "document",
    data: {},
    content: [
        {
            nodeType: "paragraph",
            data: {},
            content: [{ nodeType: "text", value: text, marks: [], data: {} }],
        },
    ],
});

export const buildRegistrationFlag = (phase: TermPhase): INotificationFlag => {
    const schedule = { term: FALL_2026.term, phase };
    return isRegistrationOpen(phase)
        ? {
              type: "default",
              link: config.links.studentRegistrationLink,
              notification: {
                  json: textDocument("Student Registration 📋 Open!"),
              },
              schedule,
          }
        : {
              type: "default",
              notification: {
                  json: textDocument("Student Registration 📋 Closed"),
              },
              schedule,
          };
};

const plainText = (node: any): string =>
    typeof node?.value === "string"
        ? node.value
        : (node?.content || []).map(plainText).join("");

const easternYear = (now: number) =>
    Number(
        new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            timeZone: "America/New_York",
        }).format(now)
    );

const mentionsPastYear = (text: string, now: number) => {
    const years = text.match(/\b20\d{2}\b/g)?.map(Number) ?? [];
    return years.length > 0 && Math.max(...years) < easternYear(now);
};

const isStudentRegistrationNotice = (text: string) =>
    /\bregistration\b/i.test(text) && !/\bteacher/i.test(text);

export const withSiteAnnouncements = (
    flags: INotificationFlag[],
    { page, now = Date.now() }: { page: string; now?: number }
): INotificationFlag[] => {
    const kept = flags.filter((flag) => {
        const text = plainText(flag.notification?.json);
        return (
            !isStudentRegistrationNotice(text) && !mentionsPastYear(text, now)
        );
    });
    // The registration banner has always been the homepage's.
    return page === "/"
        ? [buildRegistrationFlag(getTermPhase(FALL_2026.term, now)), ...kept]
        : kept;
};
