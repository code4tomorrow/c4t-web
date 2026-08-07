import { ApiError, parseBody, route } from "lib/api";
import {
    createSessionForUser,
    verifyPassword,
} from "lib/password-auth";
import prisma from "lib/prisma";
import { enforceRateLimit } from "lib/rate-limit";
import { credentialsSchema } from "lib/schemas";

const clientKey = (req: { headers: Record<string, unknown>; socket?: unknown }) => {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return (
        (typeof first === "string" ? first.split(",")[0].trim() : "") ||
        (req.socket as { remoteAddress?: string })?.remoteAddress ||
        "unknown"
    );
};

/** One message for every failure, so this route cannot enumerate accounts. */
const invalid = () =>
    new ApiError(401, "Email or password is incorrect.", "invalid_credentials");

export default route(["POST"], async ({ req, res }) => {
    const ip = clientKey(req);
    const input = parseBody(credentialsSchema, req.body);
    const email = input.email.trim().toLowerCase();

    // Two limits: one per address being targeted, one per source. Together they
    // slow credential stuffing without letting an attacker lock out a victim
    // from every other client.
    enforceRateLimit({
        key: `login:ip:${ip}`,
        limit: 30,
        windowSeconds: 60 * 10,
    });
    enforceRateLimit({
        key: `login:email:${email}`,
        limit: 10,
        windowSeconds: 60 * 10,
    });

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, passwordHash: true },
    });

    // verifyPassword hashes against a dummy when passwordHash is null, so the
    // timing of "no such account" matches "wrong password".
    const ok = await verifyPassword(input.password, user?.passwordHash ?? null);

    if (!user || !ok) throw invalid();

    // No admin bootstrap here either — see the note in register.ts.
    await createSessionForUser(user.id, res);

    const profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { onboardedAt: true },
    });

    return {
        ok: true,
        redirectTo: profile?.onboardedAt ? null : "/learn/onboarding",
    };
});
