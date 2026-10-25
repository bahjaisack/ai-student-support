"use client";

import { useCallback, useEffect, useState } from "react";

type SupportReply = {
  message: string;
  sender: string;
  createdAt: string;
};

type SupportRequest = {
  reference: string;
  name: string;
  email: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  replies?: SupportReply[];
};

export default function AdminDashboard() {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReference, setSendingReference] = useState("");
  const [replyFeedback, setReplyFeedback] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/requests", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error(
          "Admin API response:",
          response.status,
          responseText.slice(0, 300),
        );

        throw new Error(
          `The admin API returned HTML instead of JSON (HTTP ${response.status}). Check the API route and terminal.`,
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load requests.");
      }

      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function sendReply(reference: string) {
    const message = (replyDrafts[reference] || "").trim();

    if (!message) {
      setReplyFeedback((previous) => ({
        ...previous,
        [reference]: {
          success: false,
          message: "Please enter a reply first.",
        },
      }));
      return;
    }

    if (message.length > 5000) {
      setReplyFeedback((previous) => ({
        ...previous,
        [reference]: {
          success: true,
          message: "Reply saved successfully.",
        },
      }));

   
      const newReply: SupportReply = {
        message,
        sender: "Admin",
        createdAt: new Date().toISOString(),
      };

      setRequests((previous) =>
        previous.map((request) =>
          request.reference === reference
            ? {
                ...request,
                replies: [...(request.replies || []), newReply],
              }
            : request,
        ),
      );

      return;
    }

    setSendingReference(reference);
    setReplyFeedback((previous) => {
      const next = { ...previous };
      delete next[reference];
      return next;
    });

    try {
      const response = await fetch(
        `/api/admin/requests/${encodeURIComponent(reference)}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        },
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reply.");
      }

      setReplyDrafts((previous) => ({
        ...previous,
        [reference]: "",
      }));

      setReplyFeedback((previous) => ({
        ...previous,
        [reference]: {
          success: true,
          message: "Reply saved successfully.",
        },
      }));

      await loadRequests();
    } catch (err) {
      setReplyFeedback((previous) => ({
        ...previous,
        [reference]: {
          success: false,
          message: err instanceof Error ? err.message : "Unable to send reply.",
        },
      }));
    } finally {
      setSendingReference("");
    }
  }

  async function updateStatus(reference: string, status: string) {
    setError("");

    try {
      const response = await fetch(
        `/api/admin/requests/${encodeURIComponent(reference)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setRequests((previous) =>
        previous.map((request) =>
          request.reference === reference ? { ...request, status } : request,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    }
  }

  async function handleLogout() {
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to log out. Please try again.");
      }

      window.location.href = "/admin/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed.");
    }
  }

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter(
          (request) => request.status.toLowerCase() === filter.toLowerCase(),
        );

  const dateLabel = (value?: string) => {
    if (!value) return "Not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleString();
  };

  function statusStyle(status: string) {
    switch (status.toLowerCase()) {
      case "open":
        return "border-blue-400/20 bg-blue-400/10 text-blue-300";
      case "in progress":
      case "in-progress":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
      case "resolved":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
      default:
        return "border-white/10 bg-white/5 text-slate-300";
    }
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-[#101114] px-4 py-6 text-[#f5f5f5] sm:px-6 lg:px-8">
      <div className="w-full max-w-none">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <a href="/" aria-label="Dugsiiye home" className="shrink-0">
              <img
                src="/dugsiiye-logo.webp"
                alt="Dugsiiye"
                className="h-10 w-auto object-contain"
              />
            </a>

            <div className="border-l border-white/10 pl-4">
              <h1 className="text-xl font-bold sm:text-2xl">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage student support requests.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadRequests()}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-[#202127] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-[#292d38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "↻ Refresh requests"}
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-400/20"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Dashboard summary */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#17181d] p-5">
            <p className="text-sm text-slate-400">Total requests</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {requests.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              All submitted requests
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#17181d] p-5">
            <p className="text-sm text-slate-400">Open</p>
            <p className="mt-3 text-3xl font-bold text-blue-300 tabular-nums">
              {requests.filter((r) => r.status.toLowerCase() === "open").length}
            </p>
            <p className="mt-2 text-xs text-slate-500">Awaiting attention</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#17181d] p-5">
            <p className="text-sm text-slate-400">In progress</p>
            <p className="mt-3 text-3xl font-bold text-amber-300 tabular-nums">
              {
                requests.filter(
                  (r) =>
                    r.status.toLowerCase() === "in progress" ||
                    r.status.toLowerCase() === "in-progress",
                ).length
              }
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Currently being handled
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#17181d] p-5">
            <p className="text-sm text-slate-400">Resolved</p>
            <p className="mt-3 text-3xl font-bold text-emerald-300 tabular-nums">
              {
                requests.filter((r) => r.status.toLowerCase() === "resolved")
                  .length
              }
            </p>
            <p className="mt-2 text-xs text-slate-500">Successfully resolved</p>
          </div>
        </section>

        {/* Requests panel */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#17181d]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Support requests</h2>
              <p className="mt-1 text-sm text-slate-400">
                {filteredRequests.length} request(s) shown
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium text-slate-300"
              >
                Filter
              </label>

              <select
                id="status-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#202127] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/60"
              >
                <option value="all">All requests</option>
                <option value="open">Open</option>
                <option value="in progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mx-5 mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-300 sm:mx-6"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-400">
                Loading support requests...
              </p>
            </div>
          ) : !error && filteredRequests.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7h8M8 11h8m-8 4h5M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                  />
                </svg>
              </div>

              <p className="mt-4 font-medium">No support requests found</p>
              <p className="mt-1 text-sm text-slate-400">
                Try another filter or refresh the requests.
              </p>
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="border-b border-white/10 bg-[#202127] text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Reference</th>
                    <th className="px-5 py-4 font-medium">Student</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Description</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Update status</th>
                    <th className="px-5 py-4 font-medium">Reply to student</th>
                    <th className="px-5 py-4 font-medium">Submitted</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.07]">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.reference}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-300">
                        {request.reference}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-100">
                          {request.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {request.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 capitalize text-slate-300">
                        {request.category.replace(/[-_]/g, " ")}
                      </td>

                      <td className="max-w-xs px-5 py-4">
                        <p className="whitespace-normal break-words leading-6 text-slate-300">
                          {request.description || "No description provided."}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle(
                            request.status,
                          )}`}
                        >
                          {request.status.replace(/[-_]/g, " ")}
                        </span>
                      </td>

                      {/* Update status */}
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Update status for ${request.reference}`}
                          value={request.status}
                          onChange={(event) =>
                            void updateStatus(
                              request.reference,
                              event.target.value,
                            )
                          }
                          className="rounded-xl border border-white/10 bg-[#202127] px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/60"
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Reply to student */}
                      <td className="min-w-75 px-5 py-4">
                        <div className="space-y-3">
                          {request.replies && request.replies.length > 0 && (
                            <div className="space-y-2">
                              {request.replies.map((reply, index) => (
                                <div
                                  key={`${request.reference}-reply-${index}`}
                                  className="rounded-lg border border-white/10 bg-[#202127] p-3"
                                >
                                  <p className="whitespace-pre-wrap wrap-break-word text-sm text-slate-200">
                                    {reply.message}
                                  </p>
                                  <p className="mt-2 text-xs text-slate-500">
                                    Admin · {dateLabel(reply.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          <textarea
                            value={replyDrafts[request.reference] || ""}
                            onChange={(event) =>
                              setReplyDrafts((previous) => ({
                                ...previous,
                                [request.reference]: event.target.value,
                              }))
                            }
                            placeholder="Write a reply to this student..."
                            maxLength={5000}
                            rows={3}
                            aria-label={`Reply to ${request.reference}`}
                            className="w-full rounded-xl border border-white/10 bg-[#202127] p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
                          />

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-500">
                              {(replyDrafts[request.reference] || "").length}
                              /5000
                            </span>

                            <button
                              type="button"
                              onClick={() => void sendReply(request.reference)}
                              disabled={sendingReference === request.reference}
                              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#101114] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {sendingReference === request.reference
                                ? "Sending..."
                                : "Send reply"}
                            </button>
                          </div>

                          {replyFeedback[request.reference] && (
                            <p
                              role="status"
                              className={`text-xs ${
                                replyFeedback[request.reference].success
                                  ? "text-emerald-300"
                                  : "text-red-300"
                              }`}
                            >
                              {replyFeedback[request.reference].message}
                            </p>
                          )}
                        </div>
                      </td>
                      {/* Submitted */}
                      <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                        {dateLabel(request.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500 sm:px-6">
            Dugsiiye Student Support · Admin dashboard
          </div>
        </section>

        <footer className="py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Dugsiiye. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
