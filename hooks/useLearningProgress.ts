"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { toCourseCompletionPolicy } from "learning/course-policies";
import { courseRegistry } from "learning/course-registry";
import {
    calculateCertificateEligibility,
    calculateCourseProgress,
    getLearningSummary,
} from "@utils/learning/state";
import {
    getLearningServerSnapshot,
    getLearningStoreSnapshot,
    learningStoreActions,
    subscribeToLearningStore,
} from "@utils/learning/store";
import { CourseCompletionPolicy } from "@utils/learning/types";

const courseCompletionPolicies = courseRegistry.map(toCourseCompletionPolicy);

export const useLearningProgress = () => {
    const snapshot = useSyncExternalStore(
        subscribeToLearningStore,
        getLearningStoreSnapshot,
        getLearningServerSnapshot
    );

    const summary = useMemo(
        () => getLearningSummary(snapshot.state),
        [snapshot.state]
    );

    useEffect(() => {
        if (!snapshot.hydrated) return;
        const needsReconciliation = courseCompletionPolicies.some((policy) => {
            const enrollment = snapshot.state.enrollments[policy.courseId];
            if (!enrollment || enrollment.status === "completed") return false;
            return (
                Boolean(snapshot.state.certificates[policy.courseId]) ||
                calculateCertificateEligibility(snapshot.state, policy).eligible
            );
        });
        if (needsReconciliation) {
            learningStoreActions.reconcileCourseCompletions(
                courseCompletionPolicies
            );
        }
    }, [snapshot.hydrated, snapshot.state]);

    return {
        ...snapshot,
        summary,
        actions: learningStoreActions,
    };
};

export const useCourseProgress = (policy: CourseCompletionPolicy) => {
    const learning = useLearningProgress();
    const progress = useMemo(
        () => calculateCourseProgress(learning.state, policy),
        [learning.state, policy]
    );
    const certificateEligibility = useMemo(
        () => calculateCertificateEligibility(learning.state, policy),
        [learning.state, policy]
    );

    return {
        ...learning,
        progress,
        certificateEligibility,
    };
};
