import Footer from "@components/Footer";
import CredentialsForm from "@components/Learning/CredentialsForm";
import Navbar from "@components/Navbar";
import { authProviderStatus, getSession } from "lib/auth";
import type { GetServerSideProps } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

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

export const GitHubButton: React.FC<{ callbackUrl: string }> = ({
    callbackUrl,
}) => (
    <button
        type="button"
        onClick={() => signIn("github", { callbackUrl })}
        className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-bold text-black outline-none transition hover:bg-[#e9e9ee] focus-visible:ring-2 focus-visible:ring-brand-purple-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-primary"
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
);

export const AuthDivider: React.FC = () => (
    <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/15" />
        <span className="text-xs uppercase tracking-wider text-medium-grey">
            or
        </span>
        <span className="h-px flex-1 bg-white/15" />
    </div>
);

const LoginPage: React.FC<LoginProps> = ({ providers, callbackUrl }) => {
    const router = useRouter();

    const errorKey =
        typeof router.query.error === "string" ? router.query.error : null;
    const errorMessage = errorKey
        ? errorMessages[errorKey] || errorMessages.Default
        : null;

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
                <h1 className="text-3xl font-bold text-white">Sign in</h1>
                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                    Your account saves lessons, submissions, and certificates so
                    you can pick up on any device. Courses stay free — we never
                    ask for payment details.
                </p>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm leading-6 text-red-100"
                    >
                        {errorMessage}
                    </p>
                )}

                <div className="mt-7">
                    {providers.github && (
                        <>
                            <GitHubButton callbackUrl={callbackUrl} />
                            <AuthDivider />
                        </>
                    )}

                    <CredentialsForm mode="sign-in" callbackUrl={callbackUrl} />
                </div>

                <p className="mt-6 text-sm text-[#C7C3CE]">
                    New to C4T?{" "}
                    <Link
                        href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                        className="font-semibold text-brand-purple-secondary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        Create an account
                    </Link>
                </p>

                <p className="mt-6 text-xs leading-5 text-medium-grey">
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

/** Only same-origin relative paths, so this cannot become an open redirect. */
export const safeCallbackUrl = (value: unknown) => {
    const candidate = typeof value === "string" ? value : "";
    return candidate.startsWith("/") && !candidate.startsWith("//")
        ? candidate
        : "/learn/dashboard";
};

export const getServerSideProps: GetServerSideProps<LoginProps> = async (
    context
) => {
    const session = await getSession(context.req, context.res);
    const callbackUrl = safeCallbackUrl(context.query.callbackUrl);

    if (session?.user) {
        return { redirect: { destination: callbackUrl, permanent: false } };
    }

    return { props: { providers: authProviderStatus, callbackUrl } };
};

export default LoginPage;
