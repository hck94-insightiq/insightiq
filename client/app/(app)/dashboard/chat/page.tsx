"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AccountInfo {
  tiktokUsername: string;
  followers: number;
  primaryNiche?: string;
}

const SUGGESTED_PROMPTS = [
  "Produk apa yang cocok untuk niche aku?",
  "Gimana cara ningkatin engagement rate?",
  "Kapan waktu terbaik untuk posting?",
  "Berapa harga produk yang ideal untuk audience aku?",
  "Strategi hashtag yang efektif untuk niche aku?",
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pre-fill prompt from query string (e.g. coming from wishlist)
  useEffect(() => {
    const promptFromQuery = searchParams.get("prompt");
    if (promptFromQuery) {
      setInput(decodeURIComponent(promptFromQuery));
      // Focus textarea so user just needs to press Enter
      setTimeout(() => {
        textareaRef.current?.focus();
        // Move cursor to end
        const len = decodeURIComponent(promptFromQuery).length;
        textareaRef.current?.setSelectionRange(len, len);
      }, 100);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        if (data.account) setAccount(data.account);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

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
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Maaf, terjadi kesalahan: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-88px)]">
      {account && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <p className="text-xs text-gray-400 dark:text-white/30">
            AI tahu data akun kamu —{" "}
            <span className="font-mono text-gray-600 dark:text-white/50">
              @{account.tiktokUsername}
            </span>
            {account.primaryNiche && (
              <>
                {" "}
                ·{" "}
                <span className="capitalize text-gray-600 dark:text-white/50">
                  {account.primaryNiche}
                </span>
              </>
            )}{" "}
            ·{" "}
            <span className="text-gray-600 dark:text-white/50">
              {account.followers.toLocaleString("id-ID")} followers
            </span>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <Sparkles size={22} className="text-teal-500" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                AI Consultant siap membantu
              </h3>
              <p className="text-sm text-gray-400 dark:text-white/30 max-w-xs">
                Tanyakan apa saja seputar strategi TikTok affiliate, produk, dan
                audience kamu.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 dark:hover:border-teal-500/50 transition-colors bg-white dark:bg-gray-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "assistant"
                      ? "bg-teal-500/10"
                      : "bg-gray-100 dark:bg-white/10"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={14} className="text-teal-500" />
                  ) : (
                    <User
                      size={14}
                      className="text-gray-500 dark:text-white/50"
                    />
                  )}
                </div>

                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-teal-500 text-white rounded-tr-sm"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-white/80 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-teal-500" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5">
                  <Loader2 size={14} className="animate-spin text-teal-500" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-white/5">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya sesuatu... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            rows={1}
            className="flex-1 resize-none min-h-[42px] max-h-32 text-sm py-2.5 leading-relaxed"
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-teal-500 hover:bg-teal-400 text-white h-[42px] w-[42px] p-0 shrink-0"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-white/20 mt-2 text-center">
          AI bisa membuat kesalahan. Verifikasi informasi penting sebelum
          digunakan.
        </p>
      </div>
    </div>
  );
}