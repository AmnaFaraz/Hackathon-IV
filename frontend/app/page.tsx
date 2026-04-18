import Link from "next/link";
import { Brain, Lock, Star, CheckCircle } from "lucide-react";
import { PRICING } from "@/lib/api";

const CHAPTERS = [
  { num: 1, title: "Introduction to LLMs", free: true },
  { num: 2, title: "Prompt Engineering", free: true },
  { num: 3, title: "RAG", free: false },
  { num: 4, title: "Fine-tuning", free: false },
  { num: 5, title: "AI Agents", free: false },
  { num: 6, title: "Evaluation", free: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Brain size={20} style={{ color: "var(--accent)" }} />
          <span className="font-bold text-[var(--text-primary)]">GenAI Fundamentals</span>
        </div>
        <div className="flex gap-3">
          <Link href="/learn" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Chapters</Link>
          <Link href="/progress" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Progress</Link>
          <Link href="/learn/intro-to-llms" className="text-sm px-4 py-1.5 rounded-lg font-medium" style={{ background: "var(--accent)", color: "#080B14" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "var(--accent)" }}>
          <Star size={12} />
          Hackathon IV — 1000+ pts
        </div>
        <h1 className="text-5xl font-bold mb-4 text-[var(--text-primary)]">
          Master <span style={{ color: "var(--accent)" }}>Generative AI</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mb-8">
          6 deep-dive chapters covering LLMs, Prompt Engineering, RAG, Fine-tuning, AI Agents, and Evaluation.
          With an AI assistent that answers from the exact chapter content.
        </p>
        <div className="flex gap-4">
          <Link href="/learn/intro-to-llms" className="px-6 py-3 rounded-lg font-medium" style={{ background: "var(--accent)", color: "#080B14" }}>
            Start Chapter 1 (Free)
          </Link>
          <Link href="#pricing" className="px-6 py-3 rounded-lg font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            View Pricing →
          </Link>
        </div>
      </section>

      {/* Chapter list */}
      <section className="px-6 pb-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 text-center">Course Curriculum</h2>
        <div className="space-y-2">
          {CHAPTERS.map((ch) => (
            <div key={ch.num} className="flex items-center gap-4 p-3 rounded-lg border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent)" }}>
                {ch.num}
              </div>
              <span className="flex-1 text-sm text-[var(--text-primary)]">{ch.title}</span>
              {ch.free ? (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(63,185,80,0.1)", color: "var(--success)" }}>
                  Free
                </span>
              ) : (
                <Lock size={14} style={{ color: "var(--text-secondary)" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t px-6 py-16" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-8 text-center">Pricing</h2>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
          {PRICING.map((plan) => (
            <div key={plan.name} className="p-5 rounded-xl border flex flex-col"
              style={{
                background: "var(--surface)",
                borderColor: plan.highlight ? "var(--accent)" : "var(--border)",
                boxShadow: plan.highlight ? "0 0 20px rgba(0,212,255,0.1)" : "none",
              }}>
              {plan.highlight && (
                <div className="text-xs text-center mb-3 font-medium" style={{ color: "var(--accent)" }}>
                  ★ Most Popular
                </div>
              )}
              <h3 className="font-bold text-[var(--text-primary)]">{plan.name}</h3>
              <div className="text-2xl font-bold mt-1 mb-4" style={{ color: "var(--accent)" }}>{plan.price}</div>
              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <CheckCircle size={12} style={{ color: "var(--success)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/learn" className="block text-center py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: plan.highlight ? "var(--accent)" : "transparent",
                  color: plan.highlight ? "#080B14" : "var(--text-secondary)",
                  border: plan.highlight ? "none" : "1px solid var(--border)",
                }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
