import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { authProviderStatus, getSession } from "lib/auth";
import type { GetServerSideProps } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface LoginProps {
    providers: { github: boolean; email: boolean };
    callbackUrl: string;
}

const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
        "That email is already registered with a different sign-in method. Use the method you signed up with.",
    OAuthSignin: "We could not start the sign-in. Please try again.",
    OAuthCallback: "We could not complete the sign-in. Please try again.",
    EmailSignin: "We could not send that email. Check the address and retry.",
    SessionRequired: "Please sign in to continue.",
    Verification:
        "That sign-in link has expired or was already used. Request a new one.",
    Default: "Something went wrong signing you in. Please try again.",
};

const LoginPage: React.FC<LoginProps> = ({ providers, callbackUrl }) => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const errorKey =
        typeof router.query.error === "string" ? router.query.error : null;
    const errorMessage = errorKey
        ? errorMessages[errorKey] || errorMessages.Default
        : null;

    const handleEmailSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        setEmailError(null);

        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setEmailError("Enter a valid email address.");
            return;
        }

        setSubmitting(true);
        // Always routes to the same confirmation screen, so this page never
        // reveals whether an address already has an account.
        await signIn("email", { email: trimmed, callbackUrl });
        setSubmitting(false);
    };

    const noProviders = !providers.github && !providers.email;

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>Sign in | C4T Learning</title>
                <meta
                    name="description"
                    content="Sign in to track your progress through Code 4 Tomorrow's free courses."
                />
                <meta name="robots" content="noindex" />
            </Head>
            <Navbar />

            <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-14">
                <h1 className="text-3xl font-bold text-white">
                    Sign in to keep your progress
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                    An account saves your lessons, submissions, and certificates
                    so you can pick up on any device. Courses stay free — we
                    never ask for payment details.
                </p>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm leading-6 text-red-100"
                    >
                        {errorMessage}
                    </p>
                )}

                {noProviders && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100"
                    >
                        No sign-in method is configured on this deployment. Set
                        the GitHub or email environment variables described in
                        SETUP.md.
                    </p>
                )}

                {providers.github && (
                    <button
                        type="button"
                        onClick={() => signIn("github", { callbackUrl })}
                        className="mt-7 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black outline-none transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-primary"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            width="18"
                            height="18"
                            fill="currentColor"
                        >
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                        </svg>
                        Continue with GitHub
                    </button>
                )}

                {providers.github && providers.email && (
                    <div className="my-6 flex items-center gap-3">
                        <span className="h-px flex-1 bg-white/15" />
                        <span className="text-xs uppercase tracking-wider text-medium-grey">
                            or
                        </span>
                        <span className="h-px flex-1 bg-white/15" />
                    </div>
                )}

                {providers.email && (
                    <form onSubmit={handleEmailSignIn} noValidate>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-[#D6D3DC]"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            aria-invalid={Boolean(emailError)}
                            aria-describedby={
                                emailError ? "email-error" : "email-help"
                            }
                            className="mt-2 min-h-[48px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-4 py-3 text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                            placeholder="you@example.com"
                        />
                        {emailError ? (
                            <p
                                id="email-error"
                                role="alert"
                                className="mt-2 text-sm text-red-300"
                            >
                                {emailError}
                            </p>
                        ) : (
                            <p
                                id="email-help"
                                className="mt-2 text-xs text-medium-grey"
                            >
                                We email you a one-time sign-in link. No
                                password to remember.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-4 min-h-[48px] w-full rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold text-white outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting
                                ? "Sending link…"
                                : "Email me a sign-in link"}
                        </button>
                    </form>
                )}

                <p className="mt-8 text-xs leading-5 text-medium-grey">
                    By signing in you agree to our{" "}
                    <Link
                        href="/terms"
                        className="text-brand-purple-secondary underline-offset-4 hover:underline"
                    >
                        terms
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy"
                        className="text-brand-purple-secondary underline-offset-4 hover:underline"
                    >
                        privacy notice
                    </Link>
                    . You can browse every course without an account.
                </p>
            </main>
            <Footer />
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<LoginProps> = async (
    context
) => {
    const session = await getSession(context.req, context.res);

    const rawCallback = context.query.callbackUrl;
    // Only same-origin relative paths, so the callback cannot be used as an
    // open redirect to an attacker's site.
    const candidate = typeof rawCallback === "string" ? rawCallback : "";
    const callbackUrl =
        candidate.startsWith("/") && !candidate.startsWith("//")
            ? candidate
            : "/learn/dashboard";

    if (session?.user) {
        return { redirect: { destination: callbackUrl, permanent: false } };
    }

    return {
        props: {
            providers: authProviderStatus,
            callbackUrl,
        },
    };
};

export default LoginPage;
