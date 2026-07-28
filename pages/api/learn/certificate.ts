import { authedRoute, badRequest, parseBody } from "lib/api";
import {
    issueCertificate,
    NotEligibleError,
    verificationUrlFor,
} from "lib/certificates";
import { certificateRateLimit } from "lib/limits";
import { certificateIssueSchema } from "lib/schemas";

export default authedRoute(["POST"], async ({ req, userId }) => {
    certificateRateLimit(userId);

    const input = parseBody(certificateIssueSchema, req.body);

    try {
        const { certificate, created } = await issueCertificate(
            userId,
            input.courseId
        );

        return {
            created,
            certificate: {
                id: certificate.id,
                courseTitle: certificate.courseTitle,
                learnerName: certificate.learnerName,
                issuedAt: certificate.issuedAt,
                verificationUrl: verificationUrlFor(certificate.id),
                downloadUrl: `/api/certificates/${certificate.id}/download`,
            },
        };
    } catch (error) {
        if (error instanceof NotEligibleError) {
            throw badRequest(
                `Not eligible yet: ${error.unmet.join("; ")}`,
                "not_eligible"
            );
        }
        throw error;
    }
});
