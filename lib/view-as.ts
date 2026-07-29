import type { Role } from "@prisma/client";
import type { IncomingMessage } from "http";

export const VIEW_AS_COOKIE = "c4t-view-as";

/** Roles an administrator may preview. Never includes ADMIN. */
export const PREVIEWABLE_ROLES: Role[] = [
    "INSTRUCTOR",
    "CONTENT_EDITOR",
    "LEARNER",
];

export const ROLE_LABELS: Record<Role, string> = {
    LEARNER: "Learner",
    INSTRUCTOR: "Instructor",
    CONTENT_EDITOR: "Content editor",
    ADMIN: "Administrator",
};

const isPreviewable = (value: unknown): value is Role =>
    typeof value === "string" && PREVIEWABLE_ROLES.includes(value as Role);

const readCookie = (req: IncomingMessage, name: string): string | undefined => {
    const header = req.headers.cookie;
    if (!header) return undefined;

    for (const part of header.split(";")) {
        const index = part.indexOf("=");
        if (index === -1) continue;
        if (part.slice(0, index).trim() === name) {
            return decodeURIComponent(part.slice(index + 1).trim());
        }
    }
    return undefined;
};

export interface EffectiveRole {
    /** The role the request is evaluated against. */
    effectiveRole: Role;
    /** The account's actual role, from the database session. */
    realRole: Role;
    /** Set only while an administrator is previewing another role. */
    previewRole: Role | null;
}

/**
 * Resolves the role a request should be evaluated against.
 *
 * The preview is read from an ordinary cookie, which is safe because it can
 * only ever *narrow* access: the preview is honoured solely when the account's
 * real role — read from the database-backed session, not the cookie — is ADMIN,
 * and the requested role is one of PREVIEWABLE_ROLES (never ADMIN). A learner
 * who forges this cookie gains nothing, because their real role is not ADMIN.
 */
export const resolveEffectiveRole = (
    realRole: Role,
    req: IncomingMessage
): EffectiveRole => {
    if (realRole !== "ADMIN") {
        return { effectiveRole: realRole, realRole, previewRole: null };
    }

    const requested = readCookie(req, VIEW_AS_COOKIE);
    if (!isPreviewable(requested)) {
        return { effectiveRole: realRole, realRole, previewRole: null };
    }

    return {
        effectiveRole: requested,
        realRole,
        previewRole: requested,
    };
};

export const buildViewAsCookie = (role: Role | null, secure: boolean) => {
    const base = `${VIEW_AS_COOKIE}=`;
    const flags = [
        "Path=/",
        "SameSite=Lax",
        secure ? "Secure" : "",
        // Deliberately readable by scripts so the "exit preview" banner can
        // render on any page without a server round trip. It carries no
        // authority of its own.
    ].filter(Boolean);

    if (!role) {
        return `${base}; Max-Age=0; ${flags.join("; ")}`;
    }
    return `${base}${encodeURIComponent(role)}; Max-Age=${60 * 60 * 4}; ${flags.join(
        "; "
    )}`;
};
