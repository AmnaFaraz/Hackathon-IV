import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course Companion — Generative AI Fundamentals",
  description: "Master LLMs, Prompt Engineering, RAG, Fine-tuning, Agents, and Evaluation",
  keywords: ["generative ai", "llm", "rag", "prompt engineering", "panaversity"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
