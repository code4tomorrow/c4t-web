import {
    ActiveTimeInput,
    AssignmentAttemptInput,
    AwardBadgeInput,
    AwardPointsInput,
    CompleteInteractionInput,
    CourseCompletionPolicy,
    EnrollCourseInput,
    ImportLearningDataResult,
    LearningImportMode,
    LearningState,
    LocalCertificate,
    QuizAttemptInput,
    ResumePosition,
    SetLessonCompletionInput,
} from "./types";
import {
    acknowledgeSafety,
    applyBuiltInBadges,
    awardBadge,
    awardPoints,
    calculateCertificateEligibility,
    canUseLearningStorage,
    completeLessonInteraction,
    createEmptyLearningState,
    enrollInCourse,
    issueLocalCertificate,
    markCourseCompleted,
    mergeLearningStates,
    parseLearningData,
    recordActiveTime,
    recordAssignmentAttempt,
    recordQuizAttempt,
    serializeLearningData,
    setLessonCompletion,
    setResumePosition,
    updateEnrollmentStatus,
} from "./state";

export const LEARNING_STORAGE_KEY = "c4t:learning-progress:v1";

export interface LearningStoreSnapshot {
    state: LearningState;
    hydrated: boolean;
    storageAvailable: boolean;
    error?: string;
}

export interface IssueCertificateResult {
    ok: boolean;
    certificate?: LocalCertificate;
    error?: string;
}

const serverState = createEmptyLearningState({
    deviceId: "server",
    now: "1970-01-01T00:00:00.000Z",
});

const serverSnapshot: LearningStoreSnapshot = {
    state: serverState,
    hydrated: false,
    storageAvailable: false,
};

let snapshot: LearningStoreSnapshot = serverSnapshot;
let storageListenerAttached = false;
const listeners = new Set<() => void>();

const emit = () => {
    listeners.forEach((listener) => listener());
};

const replaceSnapshot = (next: LearningStoreSnapshot) => {
    snapshot = next;
    emit();
};

const readStoredState = (): {
    state: LearningState;
    error?: string;
} => {
    const empty = createEmptyLearningState();
    const serialized = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!serialized) return { state: empty };

    const parsed = parseLearningData(serialized);
    if (!parsed.ok || !parsed.state) {
        return {
            state: empty,
            error:
                parsed.error ||
                "Saved learning progress could not be loaded on this device.",
        };
    }
    return { state: applyBuiltInBadges(parsed.state) };
};

const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return;
    if (event.key !== LEARNING_STORAGE_KEY && event.key !== null) return;

    if (!event.newValue) {
        replaceSnapshot({
            state: createEmptyLearningState(),
            hydrated: true,
            storageAvailable: true,
        });
        return;
    }

    const parsed = parseLearningData(event.newValue);
    if (!parsed.ok || !parsed.state) {
        replaceSnapshot({
            ...snapshot,
            hydrated: true,
            error:
                parsed.error ||
                "Learning progress changed in another tab but could not be read.",
        });
        return;
    }

    replaceSnapshot({
        state: applyBuiltInBadges(parsed.state),
        hydrated: true,
        storageAvailable: true,
    });
};

const ensureInitialized = () => {
    if (typeof window === "undefined" || snapshot.hydrated) return;

    if (!storageListenerAttached) {
        window.addEventListener("storage", handleStorage);
        storageListenerAttached = true;
    }

    if (!canUseLearningStorage()) {
        replaceSnapshot({
            state: createEmptyLearningState(),
            hydrated: true,
            storageAvailable: false,
            error: "Browser storage is unavailable. Progress will last only until this tab closes.",
        });
        return;
    }

    try {
        const stored = readStoredState();
        replaceSnapshot({
            state: stored.state,
            hydrated: true,
            storageAvailable: true,
            error: stored.error,
        });
    } catch {
        replaceSnapshot({
            state: createEmptyLearningState(),
            hydrated: true,
            storageAvailable: false,
            error: "Browser storage could not be opened. Progress will last only until this tab closes.",
        });
    }
};

const persist = (state: LearningState) => {
    ensureInitialized();
    const nextState = applyBuiltInBadges(state);
    let error: string | undefined;
    let storageAvailable = snapshot.storageAvailable;

    if (typeof window !== "undefined" && storageAvailable) {
        try {
            window.localStorage.setItem(
                LEARNING_STORAGE_KEY,
                serializeLearningData(nextState)
            );
        } catch {
            storageAvailable = false;
            error =
                "Progress changed in this tab, but this browser could not save it.";
        }
    }

    replaceSnapshot({
        state: nextState,
        hydrated: typeof window !== "undefined",
        storageAvailable,
        error,
    });
    return nextState;
};

const update = (updater: (state: LearningState) => LearningState) => {
    ensureInitialized();
    return persist(updater(snapshot.state));
};

export const subscribeToLearningStore = (listener: () => void) => {
    listeners.add(listener);
    ensureInitialized();
    return () => listeners.delete(listener);
};

export const getLearningStoreSnapshot = () => {
    ensureInitialized();
    return snapshot;
};

export const getLearningServerSnapshot = () => serverSnapshot;

export const learningStoreActions = {
    enroll(input: EnrollCourseInput) {
        return update((state) => enrollInCourse(state, input));
    },

    setEnrollmentStatus(
        courseId: string,
        status: "active" | "paused" | "completed"
    ) {
        return update((state) =>
            updateEnrollmentStatus(state, courseId, status)
        );
    },

    reconcileCourseCompletions(policies: CourseCompletionPolicy[]) {
        return update((state) => {
            let updated = state;
            policies.forEach((policy) => {
                const enrollment = updated.enrollments[policy.courseId];
                if (!enrollment || enrollment.status === "completed") return;

                const isComplete =
                    Boolean(updated.certificates[policy.courseId]) ||
                    calculateCertificateEligibility(updated, policy).eligible;
                if (isComplete) {
                    updated = markCourseCompleted(updated, policy);
                }
            });
            return updated;
        });
    },

    setLessonCompletion(input: SetLessonCompletionInput) {
        return update((state) => setLessonCompletion(state, input));
    },

    completeInteraction(input: CompleteInteractionInput) {
        return update((state) => completeLessonInteraction(state, input));
    },

    recordQuizAttempt(input: QuizAttemptInput) {
        return update((state) => recordQuizAttempt(state, input));
    },

    recordAssignmentAttempt(input: AssignmentAttemptInput) {
        return update((state) => recordAssignmentAttempt(state, input));
    },

    setResumePosition(
        position: Omit<ResumePosition, "updatedAt"> & { updatedAt?: string }
    ) {
        return update((state) => setResumePosition(state, position));
    },

    recordActiveTime(input: ActiveTimeInput) {
        return update((state) => recordActiveTime(state, input));
    },

    awardPoints(input: AwardPointsInput) {
        return update((state) => awardPoints(state, input));
    },

    awardBadge(input: AwardBadgeInput) {
        return update((state) => awardBadge(state, input));
    },

    acknowledgeSafety(courseId: string, acknowledgementId: string) {
        return update((state) =>
            acknowledgeSafety(state, courseId, acknowledgementId)
        );
    },

    issueCertificate(
        policy: CourseCompletionPolicy,
        learnerName: string
    ): IssueCertificateResult {
        try {
            let certificate: LocalCertificate | undefined;
            update((state) => {
                const result = issueLocalCertificate(
                    state,
                    policy,
                    learnerName
                );
                certificate = result.certificate;
                return result.state;
            });
            return { ok: true, certificate };
        } catch (error) {
            return {
                ok: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "The certificate could not be created.",
            };
        }
    },

    exportData() {
        ensureInitialized();
        return serializeLearningData(snapshot.state);
    },

    importData(
        serialized: string,
        mode: LearningImportMode = "replace"
    ): ImportLearningDataResult {
        ensureInitialized();
        const parsed = parseLearningData(serialized);
        if (!parsed.ok || !parsed.state) return parsed;

        const state =
            mode === "merge"
                ? mergeLearningStates(snapshot.state, parsed.state)
                : {
                      ...parsed.state,
                      deviceId: snapshot.state.deviceId,
                      updatedAt: new Date().toISOString(),
                  };
        return {
            ok: true,
            state: persist(state),
        };
    },

    reset() {
        ensureInitialized();
        if (typeof window !== "undefined" && snapshot.storageAvailable) {
            try {
                window.localStorage.removeItem(LEARNING_STORAGE_KEY);
            } catch {
                // The in-memory reset below still gives the learner a usable
                // session even when browser storage becomes unavailable.
            }
        }
        return persist(createEmptyLearningState());
    },
};
