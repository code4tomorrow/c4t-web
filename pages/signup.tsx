import Footer from "@components/Footer";
import CredentialsForm from "@components/Learning/CredentialsForm";
import Navbar from "@components/Navbar";
import { authProviderStatus, getSession } from "lib/auth";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { AuthDivider, GitHubButton, safeCallbackUrl } from "./login";

interface SignupProps {
    providers: { github: boolean; email: boolean };
    callbackUrl: string;
}

const SignupPage: React.FC<SignupProps> = ({ providers, callbackUrl }) => (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
        <Head>
            <title>Create an account | C4T Learning</title>
            <meta
                name="description"
                content="Create a free Code 4 Tomorrow account to save your progress and earn certificates."
            />
            <meta name="robots" content="noindex" />
        </Head>
        <Navbar />

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-14">
            <h1 className="text-3xl font-bold text-white">Create an account</h1>
            <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                Free, and always will be. No payment method, ever. Your account
                keeps your lessons, submissions, and certificates in sync across
                devices.
            </p>

            <div className="mt-7">
                {providers.github && (
                    <>
                        <GitHubButton callbackUrl={callbackUrl} />
                        <AuthDivider />
                    </>
                )}

                <CredentialsForm mode="sign-up" callbackUrl={callbackUrl} />
            </div>

            <p className="mt-6 text-sm text-[#C7C3CE]">
                Already have an account?{" "}
                <Link
                    href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                    className="font-semibold text-brand-purple-secondary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                >
                    Sign in
                </Link>
            </p>

            <p className="mt-6 text-xs leading-5 text-medium-grey">
                We only ask for a name to put on your certificate and an email to
                sign you in. By creating an account you agree to our{" "}
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
                .
            </p>
        </main>
        <Footer />
    </div>
);

export const getServerSideProps: GetServerSideProps<SignupProps> = async (
    context
) => {
    const session = await getSession(context.req, context.res);
    const callbackUrl = safeCallbackUrl(context.query.callbackUrl);

    if (session?.user) {
        return { redirect: { destination: callbackUrl, permanent: false } };
    }

    return { props: { providers: authProviderStatus, callbackUrl } };
};

export default SignupPage;
