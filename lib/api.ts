import type { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import type { ZodType } from "zod";
import { getSession } from "./auth";

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const badRequest = (message: string, code?: string) =>
    new ApiError(400, message, code);
export const unauthorized = (message = "You must be signed in.") =>
    new ApiError(401, message, "unauthorized");
export const forbidden = (message = "You do not have access to this.") =>
    new ApiError(403, message, "forbidden");
export const notFound = (message = "Not found.") =>
    new ApiError(404, message, "not_found");
export const conflict = (message: string, code?: string) =>
    new ApiError(409, message, code);
export const tooManyRequests = (message = "Too many requests. Slow down.") =>
    new ApiError(429, message, "rate_limited");

/** Roles that may use the admin area. Checked on the server, every time. */
export const STAFF_ROLES: Role[] = ["INSTRUCTOR", "CONTENT_EDITOR", "ADMIN"];

export const isStaff = (role?: Role) =>
    Boolean(role && STAFF_ROLES.includes(role));

export const canGrade = (role?: Role) =>
    role === "INSTRUCTOR" || role === "ADMIN";

export const canPublish = (role?: Role) =>
    role === "CONTENT_EDITOR" || role === "ADMIN";

export const isAdmin = (role?: Role) => role === "ADMIN";

type Handler = (context: {
    req: NextApiRequest;
    res: NextApiResponse;
}) => Promise<unknown>;

type AuthedHandler = (context: {
    req: NextApiRequest;
    res: NextApiResponse;
    session: Session;
    userId: string;
    role: Role;
}) => Promise<unknown>;

const send = (res: NextApiResponse, status: number, body: unknown) => {
    if (!res.writableEnded) res.status(status).json(body);
};

const handleError = (res: NextApiResponse, error: unknown) => {
    if (error instanceof ApiError) {
        return send(res, error.status, {
            error: error.message,
            code: error.code,
        });
    }

    // Never leak stack traces or driver messages to the client.
    console.error("Unhandled API error:", error);
    return send(res, 500, {
        error: "Something went wrong. Please try again.",
        code: "internal_error",
    });
};

/** Wraps a public route with method checking and structured error handling. */
export const route = (
    methods: Array<"GET" | "POST" | "PATCH" | "PUT" | "DELETE">,
    handler: Handler
) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (!methods.includes(req.method as (typeof methods)[number])) {
            res.setHeader("Allow", methods.join(", "));
            return send(res, 405, { error: `Use ${methods.join(" or ")}.` });
        }
        try {
            const body = await handler({ req, res });
            if (body !== undefined) send(res, 200, body);
        } catch (error) {
            handleError(res, error);
        }
    };
};

/**
 * Wraps a route that requires a signed-in user. `requiredRoles` is enforced
 * here on the server — client-side redirects are never the access control.
 */
export const authedRoute = (
    methods: Array<"GET" | "POST" | "PATCH" | "PUT" | "DELETE">,
    handler: AuthedHandler,
    requiredRoles?: Role[]
) => {
    return route(methods, async ({ req, res }) => {
        const session = await getSession(req, res);

        if (!session?.user?.id) throw unauthorized();

        const role = session.user.role;
        if (requiredRoles && !requiredRoles.includes(role)) {
            throw forbidden();
        }

        return handler({
            req,
            res,
            session,
            userId: session.user.id,
            role,
        });
    });
};

/** Validates and returns the request body, or throws a 400 with field detail. */
export const parseBody = <T>(schema: ZodType<T>, body: unknown): T => {
    const result = schema.safeParse(body);
    if (!result.success) {
        const first = result.error.issues[0];
        const path = first?.path.join(".");
        throw badRequest(
            path ? `${path}: ${first.message}` : first.message,
            "validation_error"
        );
    }
    return result.data;
};
