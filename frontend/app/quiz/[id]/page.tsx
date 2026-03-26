"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { api, Quiz } from "@/lib/api";

export default function QuizPage() {
  const params = useParams();
  const slug = params.id as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation: string; correct_answer: string } | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quizzes.list(slug).then(setQuizzes).catch(() => setQuizzes([])).finally(() => setLoading(false));
  }, [slug]);

  const handleAnswer = async (option: string) => {
    if (selected) return;
    setSelected(option);
    try {
      const quiz = quizzes[current];
      const res = await api.quizzes.submit(quiz.id, option);
      setResult(res);
      if (res.correct) setScore((s) => s + 1);
    } catch {
      setResult({ correct: false, explanation: "Backend not connected.", correct_answer: option });
    }
  };

  const nextQuestion = () => {
    if (current >= quizzes.length - 1) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setResult(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-[var(--text-secondary)]">Loading quiz...</div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Quiz Complete!</h2>
        <p className="text-[var(--text-secondary)] mb-6">Score: {score}/{quizzes.length}</p>
        <Link href={`/learn/${slug}`} className="px-6 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "#080B14" }}>
          Back to Chapter
        </Link>
      </div>
    </div>
  );

  const quiz = quizzes[current];
  if (!quiz) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <p className="text-[var(--text-secondary)]">No quizzes found for this chapter.</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href={`/learn/${slug}`} className="text-[var(--text-secondary)]"><ArrowLeft size={18} /></Link>
        <span className="font-bold text-[var(--text-primary)]">Quiz</span>
        <span className="ml-auto text-xs text-[var(--text-secondary)]">{current + 1}/{quizzes.length}</span>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-12">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">{quiz.question}</h2>

        <div className="space-y-3">
          {quiz.options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = result?.correct_answer === opt;
            let bg = "var(--surface)";
            let border = "var(--border)";
            if (selected) {
              if (isCorrect) { bg = "rgba(63,185,80,0.1)"; border = "var(--success)"; }
              else if (isSelected && !result?.correct) { bg = "rgba(255,68,68,0.1)"; border = "var(--error)"; }
            }

            return (
              <button key={opt} onClick={() => handleAnswer(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                style={{ background: bg, borderColor: border, color: "var(--text-primary)" }}
                disabled={!!selected}>
                <div className="flex items-center gap-3">
                  {selected && isCorrect && <CheckCircle size={16} style={{ color: "var(--success)" }} />}
                  {selected && isSelected && !result?.correct && <XCircle size={16} style={{ color: "var(--error)" }} />}
                  {opt}
                </div>
              </button>
            );
          })}
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "var(--surface-2)", border: `1px solid ${result.correct ? "var(--success)" : "var(--error)"}` }}>
            <p className="text-sm font-medium mb-1" style={{ color: result.correct ? "var(--success)" : "var(--error)" }}>
              {result.correct ? "✅ Correct!" : "❌ Incorrect"}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{result.explanation}</p>
          </div>
        )}

        {selected && (
          <button onClick={nextQuestion} className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "var(--accent)", color: "#080B14" }}>
            {current >= quizzes.length - 1 ? "See Results" : "Next Question →"}
          </button>
        )}
      </main>
    </div>
  );
}
