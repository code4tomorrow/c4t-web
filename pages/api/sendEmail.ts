import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import config from "config";
import { enforceRateLimit } from "lib/rate-limit";
import { ApiError } from "lib/api";

const sendgridConfigured = Boolean(process.env.SENDGRID_API_KEY);

if (sendgridConfigured) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
}

export interface ISendEmailBody {
    to: string;
    email: string;
    message: string;
    fullName: string;
}

const DEFAULT_SENGRID_TEMPLATE_ID = config.sendgrid.defaultTemplateId;

/** Longest values we will forward. Anything larger is abuse, not a message. */
const LIMITS = { email: 320, fullName: 200, message: 5000 };

const clientIp = (req: NextApiRequest) => {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return (
        (typeof first === "string" ? first.split(",")[0].trim() : "") ||
        req.socket?.remoteAddress ||
        "unknown"
    );
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res
            .status(405)
            .json({ message: "Invalid HTTP Method", error: false });
    }

    // This forwards mail to a real C4T inbox, so it is throttled per sender.
    // Without it the endpoint is an open relay to any @code4tomorrow.org
    // address for anyone who finds it.
    try {
        enforceRateLimit({
            key: `contact:${clientIp(req)}`,
            limit: 5,
            windowSeconds: 60 * 10,
        });
    } catch (error) {
        const status = error instanceof ApiError ? error.status : 429;
        return res.status(status).json({
            message: "Too many messages. Please try again later.",
            error: true,
        });
    }

    const body = (req.body ?? {}) as Partial<ISendEmailBody>;

    // Every field was previously read without checking it existed, so a
    // request missing `to` threw and returned a bare "Internal Server Error".
    const isString = (value: unknown): value is string =>
        typeof value === "string" && value.trim().length > 0;

    if (
        !isString(body.to) ||
        !isString(body.email) ||
        !isString(body.fullName) ||
        !isString(body.message)
    ) {
        return res.status(400).json({
            message: "Missing `to`, `email`, `fullName`, or `message`.",
            error: true,
        });
    }

    if (
        body.email.length > LIMITS.email ||
        body.fullName.length > LIMITS.fullName ||
        body.message.length > LIMITS.message
    ) {
        return res
            .status(400)
            .json({ message: "That message is too long.", error: true });
    }

    if (!body.to.endsWith("@code4tomorrow.org")) {
        return res.status(400).json({
            message: "Invalid `to` parameter",
            error: true,
        });
    }

    if (!sendgridConfigured) {
        console.error(
            "SENDGRID_API_KEY is not set — the contact form cannot send mail."
        );
        return res.status(503).json({
            message:
                "Email is not configured on this deployment. Please email us directly.",
            error: true,
        });
    }

    try {
        await sgMail.send({
            to:
                process.env.NODE_ENV === "production"
                    ? body.to
                    : "mahitm@code4tomorrow.org",
            from: "mahitm@code4tomorrow.org",
            subject: "C4T Web Contact Message",
            templateId: DEFAULT_SENGRID_TEMPLATE_ID,
            dynamicTemplateData: {
                email: body.email,
                fullName: body.fullName,
                message: body.message,
            },
        });
        return res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error("Contact form send failed:", error);
        return res.status(500).json({ message: "Failed to Send Email!" });
    }
}
