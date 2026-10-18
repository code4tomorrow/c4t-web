import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import config from "config";
import Head from "next/head";
import Link from "next/link";
import React from "react";

/**
 * Where account pages send visitors on a deployment without a database (see
 * lib/platform.ts), instead of an error page.
 */
const AccountsUnavailablePage: React.FC = () => {
    const accountsLive = process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED !== "false";

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>Account access coming soon | C4T</title>
                <meta name="robots" content="noindex" />
            </Head>
            <Navbar />

            <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-14">
                <span aria-hidden="true" className="text-4xl">
                    🛠️
                </span>
                <h1 className="mt-4 text-3xl font-bold text-white">
                    Account access is coming soon
                </h1>
                {accountsLive ? (
                    <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                        Accounts are available now.{" "}
                        <Link
                            href="/login"
                            className="font-bold text-brand-purple-secondary underline-offset-4 hover:underline"
                        >
                            Sign in
                        </Link>{" "}
                        to pick up where you left off.
                    </p>
                ) : (
                    <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                        Until then you can&apos;t sign in, save progress, or
                        earn certificates, but everything else is open: read
                        every lesson of every course, try the free browser labs,
                        and sign up for a live class.
                    </p>
                )}
                <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                        href="/courses"
                        className="inline-flex min-h-[44px] items-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Browse courses
                    </Link>
                    <a
                        href={config.links.studentRegistrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        Sign up for a live class
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AccountsUnavailablePage;
