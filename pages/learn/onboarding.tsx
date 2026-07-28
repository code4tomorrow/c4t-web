import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { requireAuth } from "lib/guards";
import prisma from "lib/prisma";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

const INTERESTS = [
    "Python",
    "Web development",
    "JavaScript",
    "Games",
    "Hardware & robotics",
    "Data science",
    "AI & machine learning",
    "Agents & tooling",
];

const LEVELS = [
    {
        value: "NEW_TO_CODING",
        label: "New to coding",
        hint: "I have not written code before.",
    },
    {
        value: "SOME_BASICS",
        label: "Some basics",
        hint: "I know variables, loops, and conditions.",
    },
    {
        value: "COMFORTABLE",
        label: "Comfortable",
        hint: "I have built small programs on my own.",
    },
    {
        value: "EXPERIENCED",
        label: "Experienced",
        hint: "I code regularly and want advanced material.",
    },
] as const;

interface OnboardingProps {
    initialDisplayName: string;
    callbackUrl: string;
}

const OnboardingPage: React.FC<OnboardingProps> = ({
    initialDisplayName,
    callbackUrl,
}) => {
    const router = useRouter();
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [experienceLevel, setExperienceLevel] =
        useState<(typeof LEVELS)[number]["value"]>("NEW_TO_CODING");
    const [interests, setInterests] = useState<string[]>([]);
    const [weeklyGoalHours, setWeeklyGoalHours] = useState(3);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [reduceGamification, setReduceGamification] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleInterest = (value: string) =>
        setInterests((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (displayName.trim().length < 2) {
            setError("Enter a display name of at least 2 characters.");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/learn/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: displayName.trim(),
                    experienceLevel,
                    interests,
                    weeklyGoalHours,
                    reduceMotion,
                    reduceGamification,
                    timeZone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone ||
                        "UTC",
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || "Could not save your answers.");
            }

            router.push(callbackUrl);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Something went wrong."
            );
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>Welcome | C4T Learning</title>
                <meta name="robots" content="noindex" />
            </Head>
            <Navbar />

            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
                <h1 className="text-3xl font-bold text-white">
                    Welcome to C4T Learning
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                    Four quick questions so we can recommend the right starting
                    point. You can change any of this later in settings.
                </p>

                <form onSubmit={submit} className="mt-8 space-y-8" noValidate>
                    <div>
                        <label
                            htmlFor="displayName"
                            className="block text-sm font-bold text-white"
                        >
                            What should we call you?
                        </label>
                        <p className="mt-1 text-xs text-medium-grey">
                            This name appears on your certificates. It does not
                            have to be your legal name.
                        </p>
                        <input
                            id="displayName"
                            value={displayName}
                            onChange={(event) =>
                                setDisplayName(event.target.value)
                            }
                            maxLength={60}
                            required
                            className="mt-2 min-h-[48px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-4 py-3 text-white outline-none focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                        />
                    </div>

                    <fieldset>
                        <legend className="text-sm font-bold text-white">
                            How much coding have you done?
                        </legend>
                        <div className="mt-3 space-y-2">
                            {LEVELS.map((level) => (
                                <label
                                    key={level.value}
                                    className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-dark-grey-secondary p-3 text-sm hover:border-white/25"
                                >
                                    <input
                                        type="radio"
                                        name="experienceLevel"
                                        value={level.value}
                                        checked={
                                            experienceLevel === level.value
                                        }
                                        onChange={() =>
                                            setExperienceLevel(level.value)
                                        }
                                        className="mt-1 h-4 w-4 accent-[#7892EE]"
                                    />
                                    <span>
                                        <span className="font-semibold text-white">
                                            {level.label}
                                        </span>
                                        <span className="block text-xs text-medium-grey">
                                            {level.hint}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="text-sm font-bold text-white">
                            What are you interested in?{" "}
                            <span className="font-normal text-medium-grey">
                                (optional)
                            </span>
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {INTERESTS.map((interest) => {
                                const selected = interests.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleInterest(interest)}
                                        className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary ${
                                            selected
                                                ? "border-brand-purple-secondary bg-brand-purple-primary text-white"
                                                : "border-white/15 text-medium-grey hover:text-white"
                                        }`}
                                    >
                                        {interest}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div>
                        <label
                            htmlFor="weeklyGoal"
                            className="block text-sm font-bold text-white"
                        >
                            Weekly learning goal: {weeklyGoalHours} hours
                        </label>
                        <input
                            id="weeklyGoal"
                            type="range"
                            min={1}
                            max={20}
                            value={weeklyGoalHours}
                            onChange={(event) =>
                                setWeeklyGoalHours(Number(event.target.value))
                            }
                            className="mt-3 w-full accent-[#7892EE]"
                        />
                    </div>

                    <fieldset>
                        <legend className="text-sm font-bold text-white">
                            Accessibility preferences
                        </legend>
                        <label className="mt-3 flex min-h-[44px] items-center gap-3 text-sm text-[#D6D3DC]">
                            <input
                                type="checkbox"
                                checked={reduceMotion}
                                onChange={(event) =>
                                    setReduceMotion(event.target.checked)
                                }
                                className="h-5 w-5 accent-[#7892EE]"
                            />
                            Reduce animation and motion
                        </label>
                        <label className="flex min-h-[44px] items-center gap-3 text-sm text-[#D6D3DC]">
                            <input
                                type="checkbox"
                                checked={reduceGamification}
                                onChange={(event) =>
                                    setReduceGamification(event.target.checked)
                                }
                                className="h-5 w-5 accent-[#7892EE]"
                            />
                            Hide points, badges, and streaks
                        </label>
                    </fieldset>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="min-h-[48px] w-full rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Start learning"}
                    </button>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export const getServerSideProps = requireAuth<OnboardingProps>(
    async ({ session, userId, query }) => {
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        const rawCallback = query.callbackUrl;
        const candidate = typeof rawCallback === "string" ? rawCallback : "";
        const callbackUrl =
            candidate.startsWith("/") && !candidate.startsWith("//")
                ? candidate
                : "/learn/dashboard";

        // Already onboarded learners skip straight through.
        if (profile?.onboardedAt) {
            return {
                redirect: { destination: callbackUrl, permanent: false },
            };
        }

        return {
            props: {
                initialDisplayName:
                    session.user.displayName || session.user.name || "",
                callbackUrl,
            },
        };
    }
);

export default OnboardingPage;
