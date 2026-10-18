import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "lib/auth";
import { accountsEnabled } from "lib/platform";

const handler = NextAuth(authOptions);

export default function auth(req: NextApiRequest, res: NextApiResponse) {
    // Without a database or secret, NextAuth would throw on every request
    // (including the session check course pages make).
    if (!accountsEnabled()) {
        return res.status(503).json({
            error: "Student accounts aren't available on this site yet.",
        });
    }
    return handler(req, res);
}
