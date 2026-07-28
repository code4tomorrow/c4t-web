import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Role } from "@prisma/client";
import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
} from "next";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import prisma from "./prisma";

const githubConfigured = Boolean(
    process.env.GITHUB_ID && process.env.GITHUB_SECRET
);

// Magic-link email needs an SMTP server. When one is not configured the
// provider is simply omitted rather than failing at runtime, so a deployment
// with only GitHub configured still works.
const emailConfigured = Boolean(
    process.env.EMAIL_SERVER_HOST &&
        process.env.EMAIL_SERVER_USER &&
        process.env.EMAIL_SERVER_PASSWORD &&
        process.env.EMAIL_FROM
);

export const authProviderStatus = {
    github: githubConfigured,
    email: emailConfigured,
};

const providers: NextAuthOptions["providers"] = [];

if (githubConfigured) {
    providers.push(
        GitHubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
            allowDangerousEmailAccountLinking: false,
        })
    );
}

if (emailConfigured) {
    providers.push(
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST as string,
                port: Number(process.env.EMAIL_SERVER_PORT || 587),
                auth: {
                    user: process.env.EMAIL_SERVER_USER as string,
                    pass: process.env.EMAIL_SERVER_PASSWORD as string,
                },
            },
            from: process.env.EMAIL_FROM as string,
            // Links are single-use and short-lived.
            maxAge: 15 * 60,
        })
    );
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers,
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    pages: {
        signIn: "/login",
        verifyRequest: "/login/check-email",
        error: "/login",
        newUser: "/learn/onboarding",
    },
    cookies: {
        sessionToken: {
            name:
                process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.session-token"
                    : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                session.user.role = (user as { role: Role }).role;
                session.user.displayName =
                    (user as { displayName: string | null }).displayName ??
                    user.name ??
                    null;
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            // Every new learner gets a profile and notification preferences so
            // later reads never have to handle a missing row.
            await prisma.$transaction([
                prisma.userProfile.create({ data: { userId: user.id } }),
                prisma.notificationPreference.create({
                    data: { userId: user.id },
                }),
            ]);
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: false,
};

/** Server-side session for API routes and getServerSideProps. */
export const getSession = (
    ...args:
        | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
): Promise<Session | null> => getServerSession(...args, authOptions);
