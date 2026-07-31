import type { EnrollmentStatus, PacingType, Prisma } from "@prisma/client";
import { allCourses, getCourseById } from "./courses";
import prisma from "./prisma";
import {
    calculateCourseProgress,
    calculateCertificateEligibility,
    calculatePacing,
    calculateStreak,
    getCourseRequirements,
    type CertificateEligibility,
    type CourseProgress,
    type PacingSnapshot,
} from "./progress";

export const localDateKey = (date: Date = new Date(), timeZone = "UTC") => {
    try {
        // en-CA gives YYYY-MM-DD.
        return new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    } catch {
        return date.toISOString().slice(0, 10);
    }
};

/**
 * Publication status and threshold overrides for one course.
 *
 * Deliberately uncached: this is a single indexed lookup, and staff expect a
 * publish/unpublish from /admin/courses to take effect immediately. (A
 * module-scope cache used to sit here, but nothing ever wrote to it — and
 * making it write would have pinned stale statuses for the life of the server
 * process.)
 */
export const getCourseSettings = async (courseId: string) =>
    prisma.courseSettings.findUnique({ where: { courseId } });

export const getAllCourseSettings = async () => {
    const rows = await prisma.courseSettings.findMany();
    return new Map(rows.map((row) => [row.courseId, row]));
};

/** Courses a learner may enroll in. Draft and archived courses are hidden. */
export const listPublishedCourseIds = async (): Promise<Set<string>> => {
    const settings = await getAllCourseSettings();
    return new Set(
        allCourses()
            .filter(
                (course) =>
                    (settings.get(course.id)?.status ?? "REVIEW") ===
                    "PUBLISHED"
            )
            .map((course) => course.id)
    );
};

export interface CourseSnapshot {
    courseId: string;
    slug: string;
    title: string;
    summary: string;
    progress: CourseProgress;
    pacing: PacingSnapshot;
    eligibility: CertificateEligibility;
    enrollment: {
        status: EnrollmentStatus;
        pacing: PacingType;
        startedAt: string;
        targetDate: string | null;
        completedAt: string | null;
        resumeLessonId: string | null;
    };
    certificateId: string | null;
}

/**
 * One round trip for everything the learner dashboard needs. Reads are scoped
 * by userId so a learner can never see another learner's rows.
 */
export const getLearnerSnapshot = async (userId: string) => {
    const [
        enrollments,
        lessonProgress,
        submissions,
        certificates,
        safety,
        badges,
        points,
        daily,
        settings,
        profile,
    ] = await Promise.all([
        prisma.enrollment.findMany({ where: { userId } }),
        prisma.lessonProgress.findMany({ where: { userId } }),
        prisma.assignmentSubmission.findMany({ where: { userId } }),
        prisma.certificate.findMany({ where: { userId } }),
        prisma.safetyAcknowledgement.findMany({ where: { userId } }),
        prisma.userBadge.findMany({
            where: { userId },
            orderBy: { awardedAt: "desc" },
        }),
        prisma.pointTransaction.aggregate({
            where: { userId },
            _sum: { points: true },
        }),
        prisma.dailyActivity.findMany({
            where: { userId },
            orderBy: { date: "asc" },
        }),
        getAllCourseSettings(),
        prisma.userProfile.findUnique({ where: { userId } }),
    ]);

    const timeZone = profile?.timeZone || "UTC";
    const today = localDateKey(new Date(), timeZone);
    const streak = calculateStreak(
        daily.filter((row) => row.seconds > 0).map((row) => row.date),
        today
    );

    const courses: CourseSnapshot[] = enrollments
        .map((enrollment): CourseSnapshot | null => {
            const course = getCourseById(enrollment.courseId);
            if (!course) return null;

            const override = settings.get(course.id);
            const requirements = getCourseRequirements(course, {
                minimumQuizAverage: override?.minimumQuizAverage,
                capstonePassingScore: override?.capstonePassingScore,
            });

            const courseLessons = lessonProgress.filter(
                (row) => row.courseId === course.id
            );
            const courseSubmissions = submissions.filter(
                (row) => row.courseId === course.id
            );
            const courseSafety =
                safety.find((row) => row.courseId === course.id) ?? null;

            const input = {
                lessonProgress: courseLessons,
                submissions: courseSubmissions,
                safety: courseSafety,
                activeSeconds: courseLessons.reduce(
                    (total, row) => total + row.activeSeconds,
                    0
                ),
            };

            const progress = calculateCourseProgress(
                requirements,
                input,
                course.id
            );

            return {
                courseId: course.id,
                slug: course.slug,
                title: course.title,
                summary: course.summary,
                progress,
                pacing: calculatePacing(
                    enrollment,
                    requirements,
                    progress.percentage
                ),
                eligibility: calculateCertificateEligibility(
                    requirements,
                    input
                ),
                enrollment: {
                    status: enrollment.status,
                    pacing: enrollment.pacing,
                    startedAt: enrollment.startedAt.toISOString(),
                    targetDate: enrollment.targetDate?.toISOString() ?? null,
                    completedAt: enrollment.completedAt?.toISOString() ?? null,
                    resumeLessonId: enrollment.resumeLessonId,
                },
                certificateId:
                    certificates.find((row) => row.courseId === course.id)
                        ?.id ?? null,
            };
        })
        .filter((value): value is CourseSnapshot => value !== null);

    const totalSeconds = daily.reduce((total, row) => total + row.seconds, 0);

    return {
        courses,
        badges: badges.map((badge) => ({
            id: badge.badgeId,
            title: badge.title,
            description: badge.description,
            courseId: badge.courseId,
            awardedAt: badge.awardedAt.toISOString(),
        })),
        certificates: certificates.map((certificate) => ({
            id: certificate.id,
            courseId: certificate.courseId,
            courseTitle: certificate.courseTitle,
            issuedAt: certificate.issuedAt.toISOString(),
            revokedAt: certificate.revokedAt?.toISOString() ?? null,
        })),
        summary: {
            activeCourses: courses.filter(
                (course) => course.enrollment.status === "ACTIVE"
            ).length,
            completedCourses: courses.filter(
                (course) => course.enrollment.status === "COMPLETED"
            ).length,
            completedLessons: lessonProgress.filter((row) => row.completedAt)
                .length,
            points: points._sum.points ?? 0,
            badgeCount: badges.length,
            activeSeconds: totalSeconds,
            currentStreak: streak.current,
            longestStreak: streak.longest,
        },
        weeklyActivity: daily.slice(-56).map((row) => ({
            date: row.date,
            seconds: row.seconds,
        })),
        profile: profile
            ? {
                  timeZone: profile.timeZone,
                  reduceMotion: profile.reduceMotion,
                  reduceGamification: profile.reduceGamification,
                  highContrast: profile.highContrast,
                  onboardedAt: profile.onboardedAt?.toISOString() ?? null,
                  weeklyGoalHours: profile.weeklyGoalHours,
                  experienceLevel: profile.experienceLevel,
                  interests: profile.interests,
              }
            : null,
    };
};

export type LearnerSnapshot = Awaited<ReturnType<typeof getLearnerSnapshot>>;

/** Single-course view used by the course player and assignment pages. */
export const getCourseSnapshot = async (userId: string, courseId: string) => {
    const course = getCourseById(courseId);
    if (!course) return null;

    const [
        enrollment,
        lessonProgress,
        submissions,
        safety,
        override,
        certificate,
    ] = await Promise.all([
        prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        }),
        prisma.lessonProgress.findMany({ where: { userId, courseId } }),
        prisma.assignmentSubmission.findMany({
            where: { userId, courseId },
            orderBy: { attemptNumber: "desc" },
            include: {
                feedback: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        author: { select: { displayName: true, name: true } },
                    },
                },
            },
        }),
        prisma.safetyAcknowledgement.findUnique({
            where: { userId_courseId: { userId, courseId } },
        }),
        getCourseSettings(courseId),
        prisma.certificate.findUnique({
            where: { userId_courseId: { userId, courseId } },
        }),
    ]);

    const requirements = getCourseRequirements(course, {
        minimumQuizAverage: override?.minimumQuizAverage,
        capstonePassingScore: override?.capstonePassingScore,
    });

    const input = {
        lessonProgress,
        submissions,
        safety,
        activeSeconds: lessonProgress.reduce(
            (total, row) => total + row.activeSeconds,
            0
        ),
    };

    return {
        course,
        enrollment,
        requirements,
        lessonProgress,
        submissions,
        safety,
        certificate,
        progress: calculateCourseProgress(requirements, input, courseId),
        eligibility: calculateCertificateEligibility(requirements, input),
        pacing: enrollment
            ? calculatePacing(
                  enrollment,
                  requirements,
                  calculateCourseProgress(requirements, input, courseId)
                      .percentage
              )
            : null,
    };
};

/** Records an audit entry. Never throws into the caller's transaction path. */
export const audit = async (
    actorId: string | null,
    action: string,
    targetType: string,
    targetId: string,
    metadata?: Prisma.InputJsonValue
) => {
    try {
        await prisma.auditLog.create({
            data: { actorId, action, targetType, targetId, metadata },
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
    }
};
