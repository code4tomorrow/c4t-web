import { buildCertificatePdf } from "lib/certificate-pdf";
import { verificationUrlFor } from "lib/certificates";
import { forbidden, notFound, route } from "lib/api";
import { getSession } from "lib/auth";
import { isStaff } from "lib/api";
import prisma from "lib/prisma";

/**
 * Streams the certificate PDF.
 *
 * Only the owner or staff may download it. The public verification page shows
 * validity without exposing the file or the learner's account details.
 */
export default route(["GET"], async ({ req, res }) => {
    const certificateId = String(req.query.certificateId || "");

    const certificate = await prisma.certificate.findUnique({
        where: { id: certificateId },
    });

    if (!certificate) throw notFound("Certificate not found.");

    const session = await getSession(req, res);
    const isOwner = session?.user?.id === certificate.userId;

    if (!isOwner && !isStaff(session?.user?.role)) {
        throw forbidden("This certificate belongs to another learner.");
    }

    if (certificate.revokedAt) {
        throw forbidden("This certificate has been revoked.");
    }

    const pdf = await buildCertificatePdf({
        certificateId: certificate.id,
        learnerName: certificate.learnerName,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.issuedAt,
        learningHours: certificate.learningHours,
        verificationUrl: verificationUrlFor(certificate.id),
    });

    const safeTitle = certificate.courseTitle
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="c4t-${safeTitle}-certificate.pdf"`
    );
    res.setHeader("Cache-Control", "private, no-store");
    res.send(Buffer.from(pdf));

    return undefined;
});
