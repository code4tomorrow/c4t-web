import { authedRoute, parseBody } from "lib/api";
import { lessonBelongsToCourse } from "lib/courses";
import { activityRateLimit } from "lib/limits";
import prisma from "lib/prisma";
import { activitySchema } from "lib/schemas";

/** Hard ceiling per day, so a scripted client cannot inflate learning time. */
const MAX_SECONDS_PER_DAY = 12 * 60 * 60;

/**
 * Records a flush of *active* learning time. The client only counts time while
 * the page is visible, focused, and recently interacted with; this endpoint
 * additionally caps each flush (schema) and each day (below).
 */
export default authedRoute(["POST"], async ({ req, userId }) => {
    activityRateLimit(userId);

    const input = parseBody(activitySchema, req.body);

    if (
        input.courseId &&
        input.lessonId &&
        !lessonBelongsToCourse(input.lessonId, input.courseId)
    ) {
        // Mismatched ids are dropped rather than rejected loudly — this is a
        // background beacon and should never interrupt a learner.
        return { recorded: 0 };
    }

    const startedAt = new Date(input.startedAt);
    const endedAt = new Date(startedAt.getTime() + input.seconds * 1000);

    const existing = await prisma.dailyActivity.findUnique({
        where: { userId_date: { userId, date: input.localDate } },
    });

    const alreadyToday = existing?.seconds ?? 0;
    const grantable = Math.max(
        0,
        Math.min(input.seconds, MAX_SECONDS_PER_DAY - alreadyToday)
    );

    if (grantable === 0) return { recorded: 0, dailyTotal: alreadyToday };

    const [, daily] = await prisma.$transaction([
        prisma.activitySession.create({
            data: {
                userId,
                courseId: input.courseId ?? null,
                lessonId: input.lessonId ?? null,
                seconds: grantable,
                startedAt,
                endedAt,
            },
        }),
        prisma.dailyActivity.upsert({
            where: { userId_date: { userId, date: input.localDate } },
            create: {
                userId,
                date: input.localDate,
                seconds: grantable,
            },
            update: { seconds: { increment: grantable } },
        }),
    ]);

    // Mirror onto the lesson row so per-lesson time is a single cheap read.
    if (input.lessonId) {
        await prisma.lessonProgress
            .update({
                where: {
                    userId_lessonId: { userId, lessonId: input.lessonId },
                },
                data: { activeSeconds: { increment: grantable } },
            })
            .catch(() => undefined);
    }

    return { recorded: grantable, dailyTotal: daily.seconds };
});
