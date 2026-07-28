import { authedRoute, badRequest, notFound, parseBody } from "lib/api";
import { audit } from "lib/learner";
import prisma from "lib/prisma";
import { revokeCertificateSchema } from "lib/schemas";

/** Revokes a certificate. ADMIN only, always with a recorded reason. */
export default authedRoute(
    ["POST"],
    async ({ req, userId }) => {
        const input = parseBody(revokeCertificateSchema, req.body);

        const certificate = await prisma.certificate.findUnique({
            where: { id: input.certificateId },
        });
        if (!certificate) throw notFound("Certificate not found.");
        if (certificate.revokedAt) {
            throw badRequest("Already revoked.", "already_revoked");
        }

        const revoked = await prisma.certificate.update({
            where: { id: certificate.id },
            data: {
                revokedAt: new Date(),
                revokedReason: input.reason,
                revokedById: userId,
            },
        });

        await prisma.notification.create({
            data: {
                userId: certificate.userId,
                type: "CERTIFICATE_AVAILABLE",
                title: "A certificate was revoked",
                body: `Your certificate for ${certificate.courseTitle} was revoked. Reason: ${input.reason}`,
                href: "/learn/certificates",
            },
        });

        await audit(
            userId,
            "certificate.revoked",
            "Certificate",
            certificate.id,
            {
                reason: input.reason,
                learnerId: certificate.userId,
            }
        );

        return { certificate: revoked };
    },
    ["ADMIN"]
);
