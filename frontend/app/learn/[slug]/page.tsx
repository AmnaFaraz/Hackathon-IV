"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, ArrowRight, Bot, Send, BookOpen } from "lucide-react";
import { api } from "@/lib/api";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const FREE_SLUGS = ["intro-to-llms", "prompt-engineering"];

export default function ChapterPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [chapter, setChapter] = useState<{ title: string; content: string; is_free: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Ask me anything about this chapter!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [nextChapter, setNextChapter] = useState<{ slug: string; title: string } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const isFree = FREE_SLUGS.includes(slug);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.chapters.get(slug);
        setChapter({ title: data.title, content: data.content || "", is_free: data.is_free });
        const nextData = await api.chapters.next(slug);
        setNextChapter(nextData.next);
      } catch {
        setChapter({ title: slug, content: "Backend not connected. Start the FastAPI server.", is_free: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100);
      setReadProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chapterContent: chapter?.content,
          chapterTitle: chapter?.title,
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.response || "Sorry, I couldn't respond." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "GROQ_API_KEY not set. Add it to .env.local." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-[var(--text-secondary)]">Loading chapter...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Reading progress */}
      <div className="reading-progress" style={{ width: `${readProgress}%` }} />

      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
        <Link href="/learn" className="text-[var(--text-secondary)]"><ArrowLeft size={18} /></Link>
        <BookOpen size={18} style={{ color: "var(--accent)" }} />
        <span className="font-semibold text-sm text-[var(--text-primary)] flex-1 truncate">{chapter?.title}</span>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: chatOpen ? "var(--accent)" : "var(--surface-2)",
            color: chatOpen ? "#080B14" : "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Bot size={12} />
          AI Tutor
        </button>
      </nav>

      <div className="flex">
        {/* Chapter content */}
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8" ref={contentRef}>
          <div className={`prose ${!isFree ? "blur-overlay" : ""}`}>
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {chapter?.content || ""}
            </ReactMarkdown>
          </div>

          {/* Blur overlay for premium chapters */}
          {!isFree && (
            <div className="text-center py-12 mt-4 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Premium Chapter</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Upgrade to access all 6 chapters</p>
              <Link href="/#pricing" className="px-5 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--accent)", color: "#080B14" }}>
                Upgrade to Premium
              </Link>
            </div>
          )}

          {/* Next chapter */}
          {nextChapter && isFree && (
            <div className="mt-8 p-4 rounded-xl border flex items-center justify-between"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Next chapter</p>
                <p className="font-medium text-sm text-[var(--text-primary)]">{nextChapter.title}</p>
              </div>
              <Link href={`/learn/${nextChapter.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                style={{ background: "var(--accent)", color: "#080B14" }}>
                Continue <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </main>

        {/* AI Tutor panel */}
        {chatOpen && (
          <div className="w-72 border-l flex flex-col sticky top-[65px] h-[calc(100vh-65px)]"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="p-3 border-b text-sm font-medium text-[var(--text-primary)]"
              style={{ borderColor: "var(--border)" }}>
              🤖 AI Tutor — {chapter?.title}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-lg leading-relaxed ${msg.role === "user" ? "ml-4" : "mr-4"}`}
                  style={{
                    background: msg.role === "user" ? "var(--accent)" : "var(--surface-2)",
                    color: msg.role === "user" ? "#080B14" : "var(--text-primary)",
                    border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                  }}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && <div className="text-xs text-[var(--text-secondary)] p-2">Thinking...</div>}
            </div>

            <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Ask about this chapter..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <button onClick={sendChat} className="p-1.5 rounded-lg" style={{ background: "var(--accent)", color: "#080B14" }}>
                  <Send size={12} />
                </button>
              </div>
              <p className="text-center text-xs text-[var(--text-secondary)] mt-1.5">
                Powered by Groq llama-3.3-70b
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
