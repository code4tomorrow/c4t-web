import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import config from "config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface ISendEmailBody {
    to: string;
    email: string;
    message: string;
    fullName: string;
}

const DEFAULT_SENGRID_TEMPLATE_ID = config.sendgrid.defaultTemplateId;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res
            .status(405)
            .json({ message: "Invalid HTTP Method", error: false });
    }

    const body: ISendEmailBody = req.body;

    if (!body.to.endsWith("@code4tomorrow.org")) {
        return res.status(400).json({
            message: "Invalid `to` parameter",
            error: true,
        });
    }

    sgMail
        .send({
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
        })
        .then(() => {
            res.status(200).json({ message: "OK" });
        })
        .catch(() => {
            res.status(500).json({ message: "Failed to Send Email!" });
        });
}
