import { authedRoute, badRequest, notFound, parseBody } from "lib/api";
import { isInitialAdminEmail } from "lib/auth";
import { audit } from "lib/learner";
import prisma from "lib/prisma";
import { roleChangeSchema } from "lib/schemas";

/** Changes a user's role. ADMIN only. */
export default authedRoute(
    ["POST"],
    async ({ req, userId }) => {
        const input = parseBody(roleChangeSchema, req.body);

        if (input.userId === userId && input.role !== "ADMIN") {
            // Prevents an administrator locking themselves — and possibly the
            // whole organisation — out of the admin area.
            throw badRequest(
                "You cannot remove your own admin role.",
                "self_demotion"
            );
        }

        const target = await prisma.user.findUnique({
            where: { id: input.userId },
            select: { id: true, role: true, email: true },
        });
        if (!target) throw notFound("User not found.");

        if (input.role !== "ADMIN" && isInitialAdminEmail(target.email)) {
            throw badRequest(
                "This is a founding admin listed in INITIAL_ADMIN_EMAILS, so their admin role can't be removed here.",
                "founding_admin"
            );
        }

        const updated = await prisma.user.update({
            where: { id: target.id },
            data: { role: input.role },
            select: { id: true, email: true, displayName: true, role: true },
        });

        await audit(userId, "user.role_changed", "User", target.id, {
            from: target.role,
            to: input.role,
        });

        return { user: updated };
    },
    ["ADMIN"]
);
