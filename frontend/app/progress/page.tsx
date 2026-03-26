"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, BookOpen } from "lucide-react";
import { api } from "@/lib/api";

const CHAPTERS_LIST = [
  { slug: "intro-to-llms", title: "Introduction to LLMs" },
  { slug: "prompt-engineering", title: "Prompt Engineering" },
  { slug: "rag", title: "RAG" },
  { slug: "fine-tuning", title: "Fine-tuning" },
  { slug: "ai-agents", title: "AI Agents" },
  { slug: "evaluation", title: "Evaluation" },
];

export default function ProgressPage() {
  const [progress, setProgress] = useState<{ completed_chapters: string[]; xp: number; streak: number }>({
    completed_chapters: [],
    xp: 0,
    streak: 0,
  });

  useEffect(() => {
    api.progress.get("demo-user").then(setProgress).catch(() => {});
  }, []);

  const pct = Math.round((progress.completed_chapters.length / 6) * 100);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="text-[var(--text-secondary)]"><ArrowLeft size={18} /></Link>
        <Trophy size={20} style={{ color: "var(--accent)" }} />
        <span className="font-bold text-[var(--text-primary)]">My Progress</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* XP Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Zap size={18} />, label: "XP", value: progress.xp },
            { icon: <BookOpen size={18} />, label: "Chapters", value: `${progress.completed_chapters.length}/6` },
            { icon: <Trophy size={18} />, label: "Streak", value: `${progress.streak}d` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div style={{ color: "var(--accent)" }} className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="rounded-xl border p-5 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Course Progress</span>
            <span className="text-sm" style={{ color: "var(--accent)" }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--accent)" }} />
          </div>
        </div>

        {/* Chapter list */}
        <div className="space-y-2">
          {CHAPTERS_LIST.map((ch) => {
            const done = progress.completed_chapters.includes(ch.slug);
            return (
              <div key={ch.slug} className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? "var(--success)" : "var(--surface-2)", border: `1px solid ${done ? "var(--success)" : "var(--border)"}` }}>
                  {done && <span className="text-xs text-white">✓</span>}
                </div>
                <span className="flex-1 text-sm" style={{ color: done ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {ch.title}
                </span>
                {done && <span className="text-xs" style={{ color: "var(--success)" }}>+10 XP</span>}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
