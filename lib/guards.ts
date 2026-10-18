import type { Role } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { Session } from "next-auth";
import { STAFF_ROLES } from "./api";
import { getSession } from "./auth";
import { ACCOUNTS_UNAVAILABLE_PATH, accountsEnabled } from "./platform";
import { resolveEffectiveRole } from "./view-as";

export interface AuthedContext extends GetServerSidePropsContext {
    session: Session;
    userId: string;
    /** The role this request is evaluated against (respects admin preview). */
    role: Role;
    /** The account's actual role. */
    realRole: Role;
    /** Set while an administrator is previewing another role. */
    previewRole: Role | null;
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
        if (!accountsEnabled()) {
            return {
                redirect: {
                    destination: ACCOUNTS_UNAVAILABLE_PATH,
                    permanent: false,
                },
            };
        }

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

        const { effectiveRole, realRole, previewRole } = resolveEffectiveRole(
            session.user.role,
            context.req
        );

        if (options.roles && !options.roles.includes(effectiveRole)) {
            // Someone whose real role *would* pass is only here because they
            // are previewing a lower role. A bare 404 strands them with no
            // navigation and no way back, so send them to a page that explains
            // what happened and offers a one-click exit.
            if (previewRole && options.roles.includes(realRole)) {
                return {
                    redirect: {
                        destination: `/learn/preview-blocked?next=${encodeURIComponent(
                            context.resolvedUrl
                        )}`,
                        permanent: false,
                    },
                };
            }
            return { notFound: true };
        }

        // Learner pages must never be cached by a shared proxy.
        context.res.setHeader("Cache-Control", "no-store");

        return handler({
            ...context,
            session,
            userId: session.user.id,
            role: effectiveRole,
            realRole,
            previewRole,
        });
    };

export const requireStaff = <P extends object>(
    handler: (context: AuthedContext) => Promise<GetServerSidePropsResult<P>>
) => requireAuth(handler, { roles: STAFF_ROLES });

export const requireAdmin = <P extends object>(
    handler: (context: AuthedContext) => Promise<GetServerSidePropsResult<P>>
) => requireAuth(handler, { roles: ["ADMIN"] });
