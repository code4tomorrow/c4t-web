import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const CheckEmailPage: React.FC = () => (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
        <Head>
            <title>Check your email | C4T Learning</title>
            <meta name="robots" content="noindex" />
        </Head>
        <Navbar />

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-14">
            <span aria-hidden="true" className="text-4xl">
                📬
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white">
                Check your email
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                If that address has an account or can create one, a sign-in link
                is on its way. The link works once and expires in 15 minutes.
            </p>
            <p className="mt-4 text-sm leading-6 text-medium-grey">
                Nothing after a minute or two? Check your spam folder, then
                request a new link.
            </p>

            <Link
                href="/login"
                className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
            >
                Back to sign in
            </Link>
        </main>
        <Footer />
    </div>
);

export default CheckEmailPage;
