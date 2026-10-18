import {
    assertAccountsEnabled,
    badRequest,
    conflict,
    parseBody,
    route,
} from "lib/api";
import { audit } from "lib/learner";
import { createSessionForUser, hashPassword } from "lib/password-auth";
import prisma from "lib/prisma";
import { enforceRateLimit } from "lib/rate-limit";
import { registerSchema } from "lib/schemas";

const clientKey = (req: {
    headers: Record<string, unknown>;
    socket?: unknown;
}) => {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return (
        (typeof first === "string" ? first.split(",")[0].trim() : "") ||
        (req.socket as { remoteAddress?: string })?.remoteAddress ||
        "unknown"
    );
};

/** Creates an email + password account and signs the person straight in. */
export default route(["POST"], async ({ req, res }) => {
    assertAccountsEnabled();
    enforceRateLimit({
        key: `register:${clientKey(req)}`,
        limit: 10,
        windowSeconds: 60 * 15,
    });

    const input = parseBody(registerSchema, req.body);
    const email = input.email.trim().toLowerCase();

    // Reject a few obviously weak choices regardless of length.
    const lowered = input.password.toLowerCase();
    if (lowered.includes("password") || lowered.includes(email.split("@")[0])) {
        throw badRequest(
            "Choose a password that does not contain your email or the word 'password'.",
            "weak_password"
        );
    }

    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true },
    });

    if (existing) {
        // Signup necessarily reveals that an address is taken; there is no
        // usable alternative. Sign-in stays deliberately generic.
        throw conflict(
            existing.passwordHash
                ? "An account with this email already exists. Sign in instead."
                : "This email is already registered through GitHub. Use 'Continue with GitHub'.",
            "email_taken"
        );
    }

    const user = await prisma.user.create({
        data: {
            email,
            name: input.displayName.trim(),
            displayName: input.displayName.trim(),
            passwordHash: await hashPassword(input.password),
            // Email/password accounts are not email-verified. They can learn and
            // earn certificates; verification can be layered on later.
            profile: { create: {} },
            notificationPreference: { create: {} },
        },
        select: { id: true, email: true },
    });

    // Deliberately no INITIAL_ADMIN_EMAILS bootstrap here. Password signup does
    // not verify that the person owns the address, so honouring the allowlist
    // would let anyone who guessed an admin email claim it by registering first.
    // The allowlist is applied only on provider-verified sign-in (lib/auth.ts).
    await createSessionForUser(user.id, res);
    await audit(user.id, "user.registered", "User", user.id, {
        method: "password",
    });

    return { ok: true, redirectTo: "/learn/onboarding" };
});
