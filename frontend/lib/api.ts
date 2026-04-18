const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export interface Chapter {
  id: number;
  slug: string;
  title: string;
  order: number;
  is_free: boolean;
  quiz_count: number;
  estimated_minutes: number;
  content?: string;
}

export interface Quiz {
  id: string;
  chapter_slug: string;
  question: string;
  options: string[];
}

export const api = {
  chapters: {
    list: () => req<Chapter[]>("/api/chapters"),
    get: (slug: string) => req<Chapter>(`/api/chapters/${slug}`),
    next: (slug: string) => req<{ next: { slug: string; title: string } | null }>(`/api/chapters/${slug}/next`),
    prev: (slug: string) => req<{ prev: { slug: string; title: string } | null }>(`/api/chapters/${slug}/prev`),
  },
  search: (q: string) => req<{ results: { slug: string; title: string; excerpt: string }[] }>(`/api/search?q=${encodeURIComponent(q)}`),
  quizzes: {
    list: (slug?: string) => req<Quiz[]>(`/api/quizzes${slug ? `?chapter_slug=${slug}` : ""}`),
    submit: (id: string, answer: string) =>
      req<{ correct: boolean; correct_answer: string; explanation: string; score: number }>(
        `/api/quizzes/${id}/submit`,
        { method: "POST", body: JSON.stringify({ answer }) }
      ),
  },
  progress: {
    get: (userId: string) => req<{ completed_chapters: string[]; xp: number; streak: number }>(`/api/progress/${userId}`),
    update: (userId: string, data: { completed_chapter?: string; quiz_id?: string; quiz_score?: number }) =>
      req(`/api/progress/${userId}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  access: (userId: string, slug: string) =>
    req<{ has_access: boolean; requires_premium: boolean }>(`/api/access/${userId}/${slug}`),
};

export const PRICING = [
  { name: "Free", price: "$0", features: ["Chapters 1-2", "Basic quizzes", "AI Assistent (limited)"], cta: "Get Started", highlight: false },
  { name: "Premium", price: "$9.99/mo", features: ["All 6 chapters", "AI essay grading", "Learning path", "All quizzes"], cta: "Upgrade", highlight: true },
  { name: "Premium Pro", price: "$19.99/mo", features: ["Everything in Premium", "AI mentor sessions", "Analytics dashboard", "Teacher access"], cta: "Go Pro", highlight: false },
];
