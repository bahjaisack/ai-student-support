"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";

export default function SupportPage() {
  const pathname = usePathname();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("technical");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setReference("");

    try {
      const response = await fetch("/api/support-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          category,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit your request.");
      }

      setReference(data.reference);
      setName("");
      setEmail("");
      setCategory("technical");
      setDescription("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const navClass = (path: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 sm:px-4 ${
      pathname === path
        ? "bg-[#292d38] text-white shadow-sm ring-1 ring-white/10"
        : "text-[#a3a6b0] hover:bg-white/5 hover:text-white"
    }`;

  return (
    <main className="min-h-screen bg-[#101114] px-4 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col sm:px-2">
        {/* Header and navigation */}
        <header className="border-b bg-[#101114] sticky top-0 z-50 border-white/10 py-5">
          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center justify-between gap-4"
          >
             <a href="/" className="flex items-center">
  <img
    src="/dugsiiye-logo.webp"
    alt="Dugsiiye"
    className="h-10 w-auto object-contain"
  />
</a>

            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#17181d] p-1">
              <a
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={navClass("/")}
              >
                AI Assistant
              </a>

              <a
                href="/support"
                aria-current={pathname === "/support" ? "page" : undefined}
                className={navClass("/support")}
              >
                Support
              </a>

              <a
                href="/track-request"
                aria-current={
                  pathname === "/track-request" ? "page" : undefined
                }
                className={navClass("/track-request")}
              >
                Track Request
              </a>
            </div>
          </nav>
        </header>

        {/* Support form */}
        <section className="mx-auto w-full max-w-2xl flex-1 py-10 sm:py-14">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a3a6b0]">
              Student Services
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Student Support
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#a3a6b0] sm:text-base">
              Tell us about your issue and submit a support request.
              We’ll provide a reference number you can use to track it.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#17181d] p-5 sm:p-8">
            {reference ? (
              <div
                role="status"
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-emerald-300">
                  Request submitted successfully!
                </h2>

                <p className="mt-2 text-sm text-[#a3a6b0]">
                  Your reference number:
                </p>

                <p className="mt-2 break-all rounded-lg border border-white/10 bg-[#101114] px-4 py-3 font-mono text-lg font-bold text-white">
                  {reference}
                </p>

                <p className="mt-3 text-sm leading-6 text-[#a3a6b0]">
                  Save this number so you can track your request later.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="/track-request"
                    className="rounded-lg bg-[#e5e7eb] px-4 py-2.5 text-sm font-semibold text-[#17181d] transition hover:bg-white"
                  >
                    Track my request
                  </a>

                  <button
                    type="button"
                    onClick={() => setReference("")}
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[#e5e7eb]"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-[#101114] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#777b86] focus:border-[#737b91] focus:ring-2 focus:ring-white/5"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#e5e7eb]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-[#101114] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#777b86] focus:border-[#737b91] focus:ring-2 focus:ring-white/5"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-[#e5e7eb]"
                  >
                    Issue category
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#101114] px-4 py-3 text-sm text-white outline-none transition focus:border-[#737b91] focus:ring-2 focus:ring-white/5"
                  >
                    <option value="course">Course question</option>
                    <option value="technical">Technical issue</option>
                    <option value="certificate">Certificate</option>
                    <option value="account">Account problem</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-[#e5e7eb]"
                  >
                    Describe your issue
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    required
                    rows={5}
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#101114] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#777b86] focus:border-[#737b91] focus:ring-2 focus:ring-white/5"
                    placeholder="Explain how we can help (10–2000 characters)"
                  />

                  <p className="mt-2 text-right text-xs text-[#777b86]">
                    {description.length}/2000
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#e5e7eb] px-4 py-3 font-semibold text-[#17181d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit support request"}
                </button>

                <p className="text-center text-xs leading-5 text-[#777b86]">
                  After submitting, keep your reference number to track your
                  request.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-5 text-center text-xs text-[#777b86]">
          Dugsiiye Student Support · Learning starts here
        </footer>
      </div>
    </main>
  );
}
