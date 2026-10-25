"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const pathname = usePathname();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Salaan! Welcome to Dugsiiye Student Support. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const question = input.trim();

    if (!question || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't answer right now. Please try again.",
        },
      ]);
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
    <main className="min-h-screen bg-[#101114] text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 sm:px-6">
        {/* Navigation */}
        <header className="border-b sticky top-0 z-50 border-white/10 bg-[#101114] py-5">
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
                aria-current={
                  pathname === "/support" ? "page" : undefined
                }
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

        {/* Main content */}
        <section className="mx-auto w-full max-w-3xl flex-1 py-10 sm:py-14">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a3a6b0]">
              Student Services
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Student Support AI
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a3a6b0] sm:text-base">
              Your assistant for learning, courses, and technical support
              at Dugsiiye.
            </p>
          </div>

          {/* AI Chat */}
          <section
            id="ai-chat"
            aria-label="AI student support chat"
            className="flex min-h-[480px] flex-col rounded-2xl border border-white/10 bg-[#17181d] p-4 sm:p-6"
          >
            {/* Chat header */}
            <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#292d38] text-sm font-bold ring-1 ring-white/10">
                AI
              </div>

              <div>
                <h2 className="font-semibold">Dugsiiye AI</h2>
                <p className="mt-1 text-xs text-[#a3a6b0]">
                  Student learning assistant
                </p>
              </div>

              <span className="ml-auto flex items-center gap-2 text-xs text-[#a3a6b0]">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Ready to help
              </span>
            </div>

            {/* Messages */}
            <div
              aria-live="polite"
              className="flex-1 space-y-5 pb-6"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[85%] ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#30384b] text-white"
                        : "rounded-bl-md border border-white/10 bg-[#202127] text-[#e5e7eb]"
                    }`}
                  >
                    <p className="mb-1.5 text-xs font-semibold text-[#a3a6b0]">
                      {message.role === "user" ? "You" : "Dugsiiye AI"}
                    </p>

                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <p className="text-sm text-[#a3a6b0]" role="status">
                  Dugsiiye AI is thinking...
                </p>
              )}
            </div>

            {/* Message input */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t border-white/10 pt-5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses or technical support..."
                aria-label="Your question"
                maxLength={2000}
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#101114] px-4 py-3 text-sm text-white placeholder:text-[#777b86] outline-none transition focus:border-[#737b91] focus:ring-2 focus:ring-white/5 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-[#e5e7eb] px-4 py-3 text-sm font-semibold text-[#17181d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-[#777b86]">
              AI-generated answers may need verification.
            </p>
          </section>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-5 text-center text-xs text-[#777b86]">
          Dugsiiye Student Support · Learning starts here
        </footer>
      </div>
    </main>
  );
}
