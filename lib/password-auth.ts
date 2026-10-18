import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import type { NextApiResponse } from "next";
import prisma from "./prisma";

const BCRYPT_ROUNDS = 12;
const SESSION_DAYS = 30;

/**
 * A dummy hash of a random value, used to spend the same CPU time when an
 * account does not exist. Without this, a failed lookup returns noticeably
 * faster than a wrong password and leaks which emails are registered.
 */
const DUMMY_HASH = bcrypt.hashSync(
    randomBytes(16).toString("hex"),
    BCRYPT_ROUNDS
);

export const hashPassword = (password: string) =>
    bcrypt.hash(password, BCRYPT_ROUNDS);

export const verifyPassword = async (
    password: string,
    hash: string | null
): Promise<boolean> => {
    if (!hash) {
        // Still spend the time, then fail.
        await bcrypt.compare(password, DUMMY_HASH);
        return false;
    }
    return bcrypt.compare(password, hash);
};

export const sessionCookieName = () =>
    process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

/**
 * Issues a NextAuth database session.
 *
 * With the database session strategy the cookie value *is* the session token,
 * so creating the row and setting the cookie is all that sign-in requires. The
 * rest of NextAuth (getServerSession, signOut) reads and revokes it through the
 * Prisma adapter exactly as it does for OAuth sign-ins.
 */
export const createSessionForUser = async (
    userId: string,
    res: NextApiResponse
) => {
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    await prisma.session.create({ data: { sessionToken, userId, expires } });

    const secure = process.env.NODE_ENV === "production";
    const cookie = [
        `${sessionCookieName()}=${sessionToken}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`,
        secure ? "Secure" : "",
    ]
        .filter(Boolean)
        .join("; ");

    res.setHeader("Set-Cookie", cookie);
    return { sessionToken, expires };
};
