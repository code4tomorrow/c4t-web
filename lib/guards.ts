import type { Role } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { Session } from "next-auth";
import { getSession } from "./auth";
import { STAFF_ROLES } from "./api";

export interface AuthedContext extends GetServerSidePropsContext {
    session: Session;
    userId: string;
    role: Role;
}

/**
 * Server-side page guard. Protected routes are enforced here, before any HTML
 * is produced — a client-side redirect is never the access control.
 */
export const requireAuth =
    <P extends object>(
        handler: (
            context: AuthedContext
        ) => Promise<GetServerSidePropsResult<P>>,
        options: { roles?: Role[] } = {}
    ) =>
    async (
        context: GetServerSidePropsContext
    ): Promise<GetServerSidePropsResult<P>> => {
        const session = await getSession(context.req, context.res);

        if (!session?.user?.id) {
            // Preserve where they were heading so sign-in returns them there.
            const callbackUrl = encodeURIComponent(context.resolvedUrl);
            return {
                redirect: {
                    destination: `/login?callbackUrl=${callbackUrl}`,
                    permanent: false,
                },
            };
        }

        if (options.roles && !options.roles.includes(session.user.role)) {
            return { notFound: true };
        }

        // Learner pages must never be cached by a shared proxy.
        context.res.setHeader("Cache-Control", "no-store");

        return handler({
            ...context,
            session,
            userId: session.user.id,
            role: session.user.role,
        });
    };

export const requireStaff = <P extends object>(
    handler: (context: AuthedContext) => Promise<GetServerSidePropsResult<P>>
) => requireAuth(handler, { roles: STAFF_ROLES });

export const requireAdmin = <P extends object>(
    handler: (context: AuthedContext) => Promise<GetServerSidePropsResult<P>>
) => requireAuth(handler, { roles: ["ADMIN"] });
