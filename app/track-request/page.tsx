"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";


type RequestReply = {
  message: string;
  sender: string;
  createdAt: string | Date;
};

type TrackedRequest = {
  reference: string;
  category: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  replies?: RequestReply[];
};

const navigation = [
  { name: "AI Assistant", href: "/" },
  { name: "Support", href: "/support" },
  { name: "Track Request", href: "/track-request" },
];

export default function TrackRequestPage() {
  const pathname = usePathname();

  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackedRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/track-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.trim().toUpperCase(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to find your request.");
      }

      setResult(data.request);
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

  function formatDate(value?: string | Date) {
    if (!value) return "Not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleString();
  }

  function formatStatus(status: string) {
    return status.replace(/[-_]/g, " ");
  }

  function statusColor(status: string) {
    switch (status.toLowerCase()) {
      case "open":
        return "border-blue-400/20 bg-blue-400/10 text-blue-300";
      case "in_progress":
      case "in-progress":
      case "in progress":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
      case "resolved":
      case "closed":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
      default:
        return "border-white/10 bg-white/5 text-slate-300";
    }
  }

  return (
    <main className="min-h-screen bg-[#101114] px-4 py-6 text-[#f5f5f5] sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header and logo */}
        <header className="flex sticky top-0 z-50 flex-col gap-5  bg-[#101114] border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/"
            className="inline-flex w-fit items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Dugsiiye home"
          >
  <img
    src="/dugsiiye-logo.webp"
    alt="Dugsiiye"
    className="h-10 w-auto object-contain"
  />

          </a>

          {/* Navigation tabs */}
          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center gap-2"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#292d38] text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </nav>
        </header>

        {/* Page heading */}
        <section className="mx-auto mt-10 max-w-2xl text-center sm:mt-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-7 w-7 text-emerald-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7h8M8 11h5m-7 9-2 1v-4a8 8 0 1 1 3 2.2L6 20Z"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Track Your Request
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
            Check the latest status of your Dugsiiye student support request
            using your reference number and email address.
          </p>
        </section>

        {/* Tracking form */}
        <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-[#17181d] p-5 shadow-xl shadow-black/10 sm:mt-10 sm:p-8">
          <h2 className="text-lg font-semibold">Find your request</h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter the reference number you received when submitting your
            support request.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="reference"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Reference number
              </label>

              <input
                id="reference"
                name="reference"
                value={reference}
                onChange={(event) =>
                  setReference(event.target.value.toUpperCase())
                }
                placeholder="DS-A6B4EC81"
                pattern="DS-[A-F0-9]{8}"
                title="Enter a reference such as DS-A6B4EC81"
                autoComplete="off"
                required
                className="w-full rounded-xl border border-white/10 bg-[#202127] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/10 bg-[#202127] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
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
              {loading ? "Checking request..." : "Check request status"}
            </button>
          </form>

          {/* Request results */}
          {result && (
            <section
              aria-live="polite"
              className="mt-7 rounded-2xl border border-white/10 bg-[#202127] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Request details</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {result.reference}
                  </h2>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-medium capitalize ${statusColor(
                    result.status
                  )}`}
                >
                  {formatStatus(result.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Category</p>
                  <p className="mt-1 font-medium capitalize">
                    {formatStatus(result.category)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Current status</p>
                  <p className="mt-1 font-medium capitalize">
                    {formatStatus(result.status)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Submitted</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    {formatDate(result.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Last updated</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    {formatDate(result.updatedAt)}
                  </p>
                </div>
              </div>

           
{/* Admin replies */}
<section className="mt-6 border-t border-white/10 pt-5">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5 text-emerald-400"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h8m-8 4h5m-8 6 2-3.5A8 8 0 1 1 12 20H7Z"
        />
      </svg>
    </div>

    <div>
      <h3 className="font-semibold text-white">Replies from student support</h3>
      <p className="mt-1 text-sm text-slate-400">
        Messages from the Dugsiiye support team.
      </p>
    </div>
  </div>

  {!result.replies || result.replies.length === 0 ? (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-medium text-slate-300">
        No replies yet
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-400">
        The support team has not replied to your request yet.
        Please check back later.
      </p>
    </div>
  ) : (
    <div className="mt-4 space-y-3">
      {result.replies.map((reply, index) => (
        <article
          key={`${result.reference}-reply-${index}`}
          className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-emerald-300">
              Dugsiiye Support Team
            </span>
            <time className="text-xs text-slate-500">
              {formatDate(reply.createdAt)}
            </time>
          </div>

          <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-200">
            {reply.message}
          </p>
        </article>
      ))}
    </div>
  )}
</section>

<p className="mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm leading-6 text-slate-400">
  Keep your reference number safe. If you need more help, you can
  submit another request through the Support tab.
</p>

            </section>
          )}
        </section>

        {/* Support link */}
        <p className="mx-auto mt-7 max-w-2xl text-center text-sm text-slate-400">
          Need help with something else?{" "}
          <a
            href="/support"
            className="font-medium text-emerald-400 underline-offset-4 hover:text-emerald-300 hover:underline"
          >
            Contact student support
          </a>
        </p>

        {/* Footer */}
        <footer className="mt-14 border-t border-white/10 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Dugsiiye. Student Support Assistant.
        </footer>
      </div>
    </main>
  );
}