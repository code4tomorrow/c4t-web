import { afterEach, describe, expect, it } from "vitest";
import config from "config";
import {
    buildRegistrationFlag,
    withSiteAnnouncements,
} from "@utils/announcements";
import {
    FALL_2026,
    getTermPhase,
    isRegistrationOpen,
    nextTermChange,
    readPreviewDate,
} from "@utils/sessionSchedule";
import { accountsEnabled } from "lib/platform";
import type { INotificationFlag } from "common/interfaces/navigationFlag";

const at = (iso: string) => Date.parse(iso);
const phaseAt = (iso: string) => getTermPhase(FALL_2026.term, at(iso));

describe("Fall 2026 schedule", () => {
    it("moves through each phase on the right Eastern-time day", () => {
        expect(phaseAt("2026-10-17T12:00:00-04:00")).toBe("early");
        expect(phaseAt("2026-10-25T23:59:00-04:00")).toBe("early");
        expect(phaseAt("2026-10-26T00:01:00-04:00")).toBe("open");
        expect(phaseAt("2026-10-31T23:59:00-04:00")).toBe("open");
        expect(phaseAt("2026-11-01T09:00:00-05:00")).toBe("started");
        // Registration stays open through the first three weeks of November.
        expect(phaseAt("2026-11-21T23:59:00-05:00")).toBe("started");
        expect(phaseAt("2026-11-22T00:00:01-05:00")).toBe("closed");
        expect(phaseAt("2026-12-13T21:00:00-05:00")).toBe("closed");
        expect(phaseAt("2026-12-14T00:00:01-05:00")).toBe("ended");
    });

    it("only counts registration as open before November 22", () => {
        expect(isRegistrationOpen(phaseAt("2026-11-21T12:00:00-05:00"))).toBe(
            true
        );
        expect(isRegistrationOpen(phaseAt("2026-11-22T12:00:00-05:00"))).toBe(
            false
        );
    });

    it("knows when it next changes, and stops once the session ends", () => {
        expect(
            nextTermChange(FALL_2026.term, at("2026-11-10T12:00:00-05:00"))
        ).toBe(at(FALL_2026.registrationCloses));
        expect(
            nextTermChange(FALL_2026.term, at("2027-01-01T00:00:00-05:00"))
        ).toBeNull();
    });

    it("treats a term with no schedule as open", () => {
        expect(
            getTermPhase("winter-2027", at("2027-03-01T00:00:00-05:00"))
        ).toBe("open");
    });

    it("reads ?asOf= previews and ignores junk", () => {
        expect(
            getTermPhase(FALL_2026.term, readPreviewDate("?asOf=2026-11-25")!)
        ).toBe("closed");
        expect(readPreviewDate("?asOf=not-a-date")).toBeNull();
        expect(readPreviewDate("")).toBeNull();
    });
});

const flag = (text: string, link?: string): INotificationFlag => ({
    type: "default",
    link,
    notification: {
        json: {
            nodeType: "document",
            content: [
                {
                    nodeType: "paragraph",
                    content: [{ nodeType: "text", value: text }],
                },
            ],
        },
    },
});

const textOf = (item: INotificationFlag) =>
    item.notification?.json.content[0].content
        .map((node: { value: string }) => node.value)
        .join("");

describe("site banner", () => {
    const contentful = [
        flag("Student Registration 📋 Open!", "https://tally.so/r/old"),
        flag("Fall Session Teacher Signups are Open Now."),
        flag("Winter Session Registration is now open!", "https://old-form"),
        flag("Summer 2023 Teacher Applications are Open Now!"),
        flag("Check out the Brand New Marketing Internship!", "/internships"),
    ];

    it("replaces Contentful's registration notices and drops past-year ones", () => {
        const now = at("2026-10-17T12:00:00-04:00");
        const home = withSiteAnnouncements(contentful, { page: "/", now });
        expect(home.map(textOf)).toEqual([
            "Student Registration 📋 Open!",
            "Fall Session Teacher Signups are Open Now.",
            "Check out the Brand New Marketing Internship!",
        ]);
        expect(home[0].link).toBe(config.links.studentRegistrationLink);
        expect(home[0].schedule).toEqual({ term: "fall-2026", phase: "early" });
    });

    it("says registration is closed after the first three weeks of November", () => {
        const now = at("2026-11-22T10:00:00-05:00");
        const [first] = withSiteAnnouncements(contentful, { page: "/", now });
        expect(textOf(first)).toBe("Student Registration 📋 Closed");
        expect(first.link).toBeUndefined();
        expect(textOf(buildRegistrationFlag("closed"))).toBe(
            "Student Registration 📋 Closed"
        );
    });

    it("keeps the registration banner on the homepage only", () => {
        const about = withSiteAnnouncements(contentful, { page: "/about" });
        expect(about.some((item) => item.schedule)).toBe(false);
    });
});

describe("accounts switch", () => {
    const saved = { ...process.env };
    afterEach(() => {
        process.env = { ...saved };
    });

    it("is off without a database", () => {
        delete process.env.DATABASE_URL;
        expect(accountsEnabled()).toBe(false);
    });

    it("needs NEXTAUTH_SECRET in production", () => {
        process.env.DATABASE_URL = "postgresql://example";
        (process.env as Record<string, string>).NODE_ENV = "production";
        delete process.env.NEXTAUTH_SECRET;
        expect(accountsEnabled()).toBe(false);
        process.env.NEXTAUTH_SECRET = "secret";
        expect(accountsEnabled()).toBe(true);
    });
});
