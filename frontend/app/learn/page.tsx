import Link from "next/link";
import { ArrowLeft, Brain, Clock, Lock } from "lucide-react";

const CHAPTERS = [
  { slug: "intro-to-llms", title: "Introduction to LLMs", minutes: 15, free: true, order: 1 },
  { slug: "prompt-engineering", title: "Prompt Engineering", minutes: 20, free: true, order: 2 },
  { slug: "rag", title: "Retrieval-Augmented Generation", minutes: 25, free: false, order: 3 },
  { slug: "fine-tuning", title: "Fine-tuning LLMs", minutes: 25, free: false, order: 4 },
  { slug: "ai-agents", title: "AI Agents", minutes: 20, free: false, order: 5 },
  { slug: "evaluation", title: "Evaluating AI Systems", minutes: 20, free: false, order: 6 },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="text-[var(--text-secondary)]"><ArrowLeft size={18} /></Link>
        <Brain size={20} style={{ color: "var(--accent)" }} />
        <span className="font-bold text-[var(--text-primary)]">All Chapters</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {CHAPTERS.map((ch) => (
            <Link
              key={ch.slug}
              href={ch.free ? `/learn/${ch.slug}` : "#pricing"}
              className="flex items-center gap-4 p-4 rounded-xl border transition-all group"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                opacity: ch.free ? 1 : 0.7,
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent)" }}>
                {ch.order}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {ch.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-[var(--text-secondary)]">
                  <Clock size={10} />
                  <span>{ch.minutes} min</span>
                </div>
              </div>
              {ch.free ? (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(63,185,80,0.1)", color: "var(--success)" }}>
                  Free
                </span>
              ) : (
                <Lock size={14} style={{ color: "var(--text-secondary)" }} />
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
