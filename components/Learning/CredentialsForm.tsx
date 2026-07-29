"use client";

import React, { useState } from "react";

export interface CredentialsFormProps {
    mode: "sign-in" | "sign-up";
    callbackUrl: string;
}

/** Email + password sign-in and registration. Requires no email service. */
const CredentialsForm: React.FC<CredentialsFormProps> = ({
    mode,
    callbackUrl,
}) => {
    const isSignUp = mode === "sign-up";

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (isSignUp && displayName.trim().length < 2) {
            setError("Enter the name you would like to be called.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        if (password.length < 10) {
            setError("Your password must be at least 10 characters.");
            return;
        }

        setBusy(true);
        try {
            const response = await fetch(
                isSignUp ? "/api/auth/register" : "/api/auth/password-login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                        ...(isSignUp && { displayName: displayName.trim() }),
                    }),
                }
            );
            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(body.error || "Something went wrong.");
            }

            // Full navigation so the new session cookie is picked up by the
            // server on the next render.
            window.location.href = body.redirectTo || callbackUrl;
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Something went wrong."
            );
            setBusy(false);
        }
    };

    const field =
        "mt-2 min-h-[48px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-4 py-3 text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40";

    return (
        <form onSubmit={submit} noValidate>
            {isSignUp && (
                <div className="mb-4">
                    <label
                        htmlFor="displayName"
                        className="block text-sm font-semibold text-[#D6D3DC]"
                    >
                        What should we call you?
                    </label>
                    <input
                        id="displayName"
                        name="name"
                        autoComplete="name"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        maxLength={60}
                        required
                        className={field}
                        placeholder="Zafir"
                    />
                </div>
            )}

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
                className={field}
                placeholder="you@example.com"
            />

            <div className="mt-4 flex items-baseline justify-between gap-3">
                <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#D6D3DC]"
                >
                    Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-xs font-semibold text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>
            <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={10}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={isSignUp ? "password-help" : undefined}
                className={field}
                placeholder={isSignUp ? "At least 10 characters" : ""}
            />
            {isSignUp && (
                <p id="password-help" className="mt-2 text-xs text-medium-grey">
                    At least 10 characters. A short phrase you will remember
                    beats a short complicated word.
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100"
                >
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={busy}
                className="mt-5 min-h-[48px] w-full rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold text-white outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                {busy
                    ? isSignUp
                        ? "Creating account…"
                        : "Signing in…"
                    : isSignUp
                      ? "Create account"
                      : "Sign in"}
            </button>
        </form>
    );
};

export default CredentialsForm;
