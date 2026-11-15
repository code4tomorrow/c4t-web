import { describe, expect, it } from "vitest";
import { courseRegistry } from "learning/course-registry";
import { learningPaths } from "learning/learning-paths";

const liveCourses = courseRegistry.filter((course) => course.liveSession);
const byId = (id: string) => {
    const course = courseRegistry.find((item) => item.id === id);
    if (!course) throw new Error(`missing ${id}`);
    return course;
};

describe("Fall 2026 live classes", () => {
    it("are the four classes on the flyer, in one term", () => {
        expect(liveCourses.map((course) => course.title)).toEqual([
            "Intro to Python",
            "Android Studio App Development",
            "Programming with Scratch",
            "Intermediate ML & Model Evaluation",
        ]);
        expect(
            new Set(liveCourses.map((course) => course.liveSession?.term))
        ).toEqual(new Set(["fall-2026"]));
    });

    it("map each of the six weeks to one 90-minute core module", () => {
        liveCourses.forEach((course) => {
            const core = course.modules.filter(
                (module) => module.kind === "core"
            );
            expect(core).toHaveLength(6);
            expect(course.liveSession?.weeks).toBe(6);
            core.forEach((module) => {
                const minutes = module.lessons.reduce(
                    (total, lesson) => total + lesson.estimatedMinutes,
                    0
                );
                expect(minutes).toBe(course.liveSession?.minutesPerClass);
            });
        });
    });

    it("publish a week-by-week plan with setup first and the capstone last", () => {
        liveCourses.forEach((course) => {
            const weekly = course.pacing.find((plan) => plan.type === "weekly");
            expect(weekly?.releasePlan[0]).toMatch(/^Before week 1:/);
            expect(weekly?.releasePlan[1]).toMatch(/^Week 1 live class:/);
            expect(weekly?.releasePlan.at(-1)).toMatch(/^After week 6:/);
        });
    });

    it("stay out of the self-paced learning paths", () => {
        const pathCourseIds = new Set(
            learningPaths.flatMap((path) =>
                path.courses.map((item) => item.course.id)
            )
        );
        liveCourses.forEach((course) =>
            expect(pathCourseIds.has(course.id)).toBe(false)
        );
    });

    it("continue into an existing self-paced course", () => {
        liveCourses.forEach((course) => {
            const next = byId(course.liveSession!.continueWith);
            expect(next.liveSession).toBeNull();
        });
    });

    it("leave every self-paced course without a live session", () => {
        courseRegistry
            .filter((course) => Number(course.id.slice(-2)) <= 25)
            .forEach((course) => expect(course.liveSession).toBeNull());
    });
});
