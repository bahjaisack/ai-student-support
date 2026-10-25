"use client";

import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      window.location.href = "/admin";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101114] px-4 py-10 text-[#f5f5f5]">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#17181d] p-6 shadow-2xl shadow-black/20 sm:p-8">
       
         

        {/* Heading */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-6 w-6 text-emerald-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2Zm12-11V7a5 5 0 0 0-10 0v4"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Admin Sign In
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to manage Dugsiiye student support requests.
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Admin password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              placeholder="Enter your admin password"
              className="w-full rounded-xl border border-white/10 bg-[#202127] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 font-semibold text-[#08130d] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            )}
            {loading ? "Signing in..." : "Sign in to dashboard"}
          </button>
        </form>

        {/* Back to website */}
        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <a
            href="/"
            className="text-sm text-slate-400 transition hover:text-emerald-400"
          >
            ← Back to Dugsiiye
          </a>
        </div>
      </section>
    </main>
  );
}