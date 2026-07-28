import { randomBytes } from "crypto";
import type { Certificate } from "@prisma/client";
import { getCourseById } from "./courses";
import { audit, getCourseSettings } from "./learner";
import prisma from "./prisma";
import {
    calculateCertificateEligibility,
    getCourseRequirements,
    POINT_VALUES,
    pointKey,
} from "./progress";

/** 80 bits of entropy — unguessable, still short enough to read aloud. */
export const newCertificateId = () =>
    `C4T-${randomBytes(10).toString("hex").toUpperCase()}`;

export const publicBaseUrl = () =>
    (
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000"
    ).replace(/\/$/, "");

export const verificationUrlFor = (certificateId: string) =>
    `${publicBaseUrl()}/certificate/verify/${certificateId}`;

export class NotEligibleError extends Error {
    constructor(public readonly unmet: string[]) {
        super("Certificate requirements are not met yet.");
        this.name = "NotEligibleError";
    }
}

/**
 * Issues a certificate after the server re-verifies every requirement.
 *
 * Idempotent: the unique (userId, courseId) index means a repeated request
 * returns the existing certificate instead of minting a second one.
 */
export const issueCertificate = async (
    userId: string,
    courseId: string
): Promise<{ certificate: Certificate; created: boolean }> => {
    const course = getCourseById(courseId);
    if (!course) throw new Error("Unknown course.");

    const existing = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return { certificate: existing, created: false };

    const settings = await getCourseSettings(courseId);
    if (settings && !settings.certificatesEnabled) {
        throw new NotEligibleError([
            "Certificates are disabled for this course.",
        ]);
    }

    const [user, enrollment, lessonProgress, submissions, safety] =
        await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { displayName: true, name: true, email: true },
            }),
            prisma.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId } },
            }),
            prisma.lessonProgress.findMany({ where: { userId, courseId } }),
            prisma.assignmentSubmission.findMany({
                where: { userId, courseId },
            }),
            prisma.safetyAcknowledgement.findUnique({
                where: { userId_courseId: { userId, courseId } },
            }),
        ]);

    if (!enrollment) throw new NotEligibleError(["You are not enrolled."]);

    const requirements = getCourseRequirements(course, {
        minimumQuizAverage: settings?.minimumQuizAverage,
        capstonePassingScore: settings?.capstonePassingScore,
    });

    const eligibility = calculateCertificateEligibility(requirements, {
        lessonProgress,
        submissions,
        safety,
    });

    if (!eligibility.eligible) {
        throw new NotEligibleError(
            eligibility.requirements
                .filter((requirement) => !requirement.met)
                .map((requirement) => requirement.label)
        );
    }

    // Name is frozen at issue time so the certificate stays truthful later.
    const learnerName =
        user?.displayName?.trim() || user?.name?.trim() || "C4T Learner";

    const certificate = await prisma.$transaction(async (tx) => {
        const created = await tx.certificate.create({
            data: {
                id: newCertificateId(),
                userId,
                courseId,
                learnerName,
                courseTitle: course.title,
                learningHours: course.estimatedTotalHours,
            },
        });

        await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { status: "COMPLETED", completedAt: new Date() },
        });

        await tx.pointTransaction.createMany({
            data: [
                {
                    userId,
                    courseId,
                    points: POINT_VALUES.courseCompleted,
                    reason: `Completed course: ${course.title}`,
                    idempotencyKey: pointKey("courseCompleted", courseId),
                },
            ],
            skipDuplicates: true,
        });

        await tx.userBadge.createMany({
            data: [
                {
                    userId,
                    badgeId: "course-complete",
                    courseId,
                    title: `${course.title} graduate`,
                    description: `Completed every requirement for ${course.title}.`,
                },
            ],
            skipDuplicates: true,
        });

        await tx.notification.create({
            data: {
                userId,
                type: "CERTIFICATE_AVAILABLE",
                title: "Your certificate is ready",
                body: `You completed ${course.title}. Your certificate is available to download and share.`,
                href: "/learn/certificates",
            },
        });

        return created;
    });

    await audit(userId, "certificate.issued", "Certificate", certificate.id, {
        courseId,
    });

    return { certificate, created: true };
};
