"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Sparkles, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AccountInfo {
  tiktokUsername: string;
  followers: number;
  primaryNiche?: string;
}

const SUGGESTIONS = [
  "Produk apa yang paling cocok untuk niche aku?",
  "Kapan waktu terbaik aku posting?",
  "Hashtag apa yang sebaiknya aku pakai?",
  "Gimana caranya naikkin engagement rate aku?",
];

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        const parts = line
          .split(/(\*\*[^*]+\*\*)/g)
          .map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              part
            ),
          );
        return (
          <div key={i} className="text-[14px] leading-relaxed">
            {parts}
          </div>
        );
      })}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5">
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
    </div>
  );
}

function makeInitialMessage(username?: string): Message {
  return {
    role: "assistant",
    content: username
      ? `Halo! Aku InsightIQ AI — aku sudah tahu data akun **@${username}** kamu. Tanya apa pun soal strategi affiliate, produk, waktu posting, atau hashtag. Aku siap kasih insight berbasis data akun kamu.`
      : "Halo! Aku InsightIQ AI. Tanya apa pun soal strategi TikTok affiliate kamu — produk, waktu posting, hashtag, atau engagement.",
  };
}

// Inner component yang pakai useSearchParams — dibungkus Suspense
function PromptReader({ onRead }: { onRead: (prompt: string | null) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onRead(searchParams.get("prompt"));
  }, []);
  return null;
}

function ChatPageInner() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        if (data.account) {
          setAccount(data.account);
          if (!initializedRef.current) {
            setMessages([makeInitialMessage(data.account.tiktokUsername)]);
            initializedRef.current = true;
          }
        }
      })
      .catch(() => {
        if (!initializedRef.current) {
          setMessages([makeInitialMessage()]);
          initializedRef.current = true;
        }
      });
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [input]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function handlePromptFromQuery(prompt: string | null) {
    if (prompt) {
      const decoded = decodeURIComponent(prompt);
      setInput(decoded);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(decoded.length, decoded.length);
      }, 100);
    }
  }

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || typing) return;

      const userMessage: Message = { role: "user", content };
      const newMessages = [...messages, userMessage];

      setMessages(newMessages);
      setInput("");
      setTyping(true);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI.");

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Maaf, terjadi kesalahan. Coba lagi." },
        ]);
      } finally {
        setTyping(false);
        textareaRef.current?.focus();
      }
    },
    [input, messages, typing],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleReset() {
    setMessages([makeInitialMessage(account?.tiktokUsername)]);
    setInput("");
    textareaRef.current?.focus();
  }

  const showSuggestions = messages.length <= 1 && !typing;

  return (
    <div className="flex h-[calc(100dvh-11rem)] md:h-[calc(100vh-140px)] flex-col md:-mb-16">
      <Suspense>
        <PromptReader onRead={handlePromptFromQuery} />
      </Suspense>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        {/* Context banner */}
        <div className="flex items-center gap-2 border-b border-border bg-teal-500/5 px-3 py-2.5 sm:gap-2.5 sm:px-5 sm:py-3">
          <Sparkles
            size={14}
            className="shrink-0 text-teal-600 dark:text-teal-400"
          />
          <p className="flex-1 text-xs text-muted-foreground">
            AI tahu data akun kamu —{" "}
            {account ? (
              <>
                <span className="font-mono font-medium text-foreground">
                  @{account.tiktokUsername}
                </span>
                {account.primaryNiche && (
                  <>
                    {" "}
                    · <span className="capitalize">{account.primaryNiche}</span>
                  </>
                )}{" "}
                · {account.followers.toLocaleString("id-ID")} followers
              </>
            ) : (
              <span className="text-muted-foreground">Memuat...</span>
            )}
          </p>
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            Powered by Gemini 3.5-flash
          </span>
          <button
            onClick={handleReset}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw size={12} />
            New chat
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          className="flex-1 min-h-0 space-y-4 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="mr-2.5 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white">
                  <Sparkles size={13} />
                </div>
              )}
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "border border-border bg-muted/60"
                }`}
              >
                {m.role === "assistant" ? (
                  <Markdown text={m.content} />
                ) : (
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white">
                <Sparkles size={13} />
              </div>
              <div className="rounded-2xl border border-border bg-muted/60">
                <TypingDots />
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="pt-2">
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                // SUGGESTED PROMPTS
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-background px-3.5 py-2 text-left text-[13px] font-medium transition-colors hover:border-teal-500/40 hover:bg-teal-500/5 hover:text-teal-700 dark:hover:text-teal-400"
                  >
                    <span className="mr-1.5 text-teal-500">›</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 overflow-hidden rounded-xl border border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3 focus-within:border-teal-500/60 transition-colors">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya apa pun tentang strategi affiliate kamu…"
                disabled={typing}
                className="w-full resize-none bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-[120px] overflow-y-auto"
                onInput={(e) => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white transition-colors hover:bg-teal-400 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
          {/* Hint — simplified on mobile */}
          <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
            <span className="hidden sm:inline">
              Enter untuk kirim · Shift+Enter untuk baris baru ·{" "}
            </span>
            AI bisa membuat kesalahan, verifikasi info penting
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
