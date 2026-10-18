/**
 * Development seed.
 *
 * Creates course settings for every course, publishes them, and —
 * only outside production — creates demo accounts so the full learner →
 * instructor → certificate flow can be exercised locally.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { courseRegistry } from "../learning/build-course-registry";

const prisma = new PrismaClient();

/**
 * Every course ships fully authored and passes `npm run validate:curriculum`,
 * so all of them are published by default — a catalog that lists every course but
 * only lets you enroll in 5 is just a wall of dead buttons. Unpublish any you
 * are not ready for at /admin/courses.
 */
const PUBLISH_ON_SEED = courseRegistry.map((course) => course.id);

const isProduction = process.env.NODE_ENV === "production";

const seedCourseSettings = async () => {
    for (const course of courseRegistry) {
        await prisma.courseSettings.upsert({
            where: { courseId: course.id },
            create: {
                courseId: course.id,
                status: PUBLISH_ON_SEED.includes(course.id)
                    ? "PUBLISHED"
                    : "REVIEW",
            },
            // Never clobber a status an admin has already chosen.
            update: {},
        });
    }
    console.log(
        `✓ Course settings ready for ${courseRegistry.length} courses (${PUBLISH_ON_SEED.length} published).`
    );
};

const seedDemoAccounts = async () => {
    if (isProduction) {
        console.log("• Skipping demo accounts (NODE_ENV=production).");
        return;
    }

    // Demo accounts have no password and no linked OAuth account. They exist so
    // the data model can be inspected locally; sign-in still requires a real
    // provider. Promote your own account with `npm run db:make-admin`.
    const learner = await prisma.user.upsert({
        where: { email: "demo.learner@example.invalid" },
        create: {
            email: "demo.learner@example.invalid",
            name: "Demo Learner",
            displayName: "Demo Learner",
            role: "LEARNER",
            profile: { create: { onboardedAt: new Date() } },
            notificationPreference: { create: {} },
        },
        update: {},
    });

    const instructor = await prisma.user.upsert({
        where: { email: "demo.instructor@example.invalid" },
        create: {
            email: "demo.instructor@example.invalid",
            name: "Demo Instructor",
            displayName: "Demo Instructor",
            role: "INSTRUCTOR",
            profile: { create: { onboardedAt: new Date() } },
            notificationPreference: { create: {} },
        },
        update: {},
    });

    const course = courseRegistry.find((item) => item.id === "course-01");
    if (!course) return;

    await prisma.enrollment.upsert({
        where: {
            userId_courseId: { userId: learner.id, courseId: course.id },
        },
        create: {
            userId: learner.id,
            courseId: course.id,
            pacing: "SELF_PACED",
            resumeLessonId: course.modules[0].lessons[0].id,
        },
        update: {},
    });

    // A couple of finished lessons and one submission awaiting review, so the
    // dashboard and grading queue are not empty on a fresh database.
    const firstModule = course.modules[0];
    for (const lesson of firstModule.lessons.slice(0, 2)) {
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: { userId: learner.id, lessonId: lesson.id },
            },
            create: {
                userId: learner.id,
                courseId: course.id,
                moduleId: firstModule.id,
                lessonId: lesson.id,
                completedInteractionIds: [lesson.interaction.id],
                completedAt: new Date(),
                activeSeconds: 20 * 60,
            },
            update: {},
        });
    }

    const existingSubmission = await prisma.assignmentSubmission.findFirst({
        where: {
            userId: learner.id,
            assignmentId: firstModule.checkpoint.id,
        },
    });

    if (!existingSubmission) {
        await prisma.assignmentSubmission.create({
            data: {
                userId: learner.id,
                courseId: course.id,
                assignmentId: firstModule.checkpoint.id,
                attemptNumber: 1,
                status: "SUBMITTED",
                responseText:
                    "Demo submission: traced the algorithm through a normal case and an edge case, then explained the difference.",
                submittedAt: new Date(),
            },
        });
    }

    await prisma.dailyActivity.upsert({
        where: {
            userId_date: {
                userId: learner.id,
                date: new Date().toISOString().slice(0, 10),
            },
        },
        create: {
            userId: learner.id,
            date: new Date().toISOString().slice(0, 10),
            seconds: 40 * 60,
        },
        update: {},
    });

    console.log(
        `✓ Demo accounts: ${learner.email} (learner), ${instructor.email} (instructor).`
    );
    console.log(
        "  These are placeholders for inspecting data — sign in with your own GitHub or email account."
    );
};

const main = async () => {
    await seedCourseSettings();
    await seedDemoAccounts();
};

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
