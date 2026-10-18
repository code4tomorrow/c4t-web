import { authedRoute, forbidden, parseBody } from "lib/api";
import { audit } from "lib/learner";
import { buildViewAsCookie, PREVIEWABLE_ROLES } from "lib/view-as";
import { z } from "zod";

const schema = z.object({
    /** null exits the preview and restores full administrator access. */
    role: z.enum(["INSTRUCTOR", "CONTENT_EDITOR", "LEARNER"]).nullable(),
});

/**
 * Starts or ends a role preview.
 *
 * Authorised against `realRole`, not the effective role — otherwise an
 * administrator previewing as a learner could not switch back. The preview can
 * only ever narrow permissions: ADMIN is not an allowed target, and
 * resolveEffectiveRole ignores the cookie unless the account is genuinely an
 * administrator.
 */
export default authedRoute(["POST"], async ({ req, res, userId, realRole }) => {
    if (realRole !== "ADMIN") {
        throw forbidden("Only administrators can preview other roles.");
    }

    const { role } = parseBody(schema, req.body);

    if (role && !PREVIEWABLE_ROLES.includes(role)) {
        throw forbidden("That role cannot be previewed.");
    }

    res.setHeader(
        "Set-Cookie",
        buildViewAsCookie(role, process.env.NODE_ENV === "production")
    );

    await audit(
        userId,
        role ? "admin.preview_started" : "admin.preview_ended",
        "User",
        userId,
        {
            role,
        }
    );

    return { previewRole: role };
});
