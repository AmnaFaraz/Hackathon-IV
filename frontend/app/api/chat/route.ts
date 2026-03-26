/**
 * PHASE 1 — Groq runs HERE (Next.js API route), NOT in FastAPI backend.
 * This is the AI Tutor endpoint.
 */
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// PHASE 1: Groq in Next.js API route (not backend)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  try {
    const { message, chapterContent, chapterTitle } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const systemPrompt = chapterContent
      ? `You are an expert AI tutor for the course "Generative AI Fundamentals."
You are helping a student with Chapter: "${chapterTitle}".

Answer ONLY based on the chapter content below.
If the question is not covered: say "This isn't covered in this chapter. Check the other chapters."
Be concise (max 200 words). Use examples when helpful.

CHAPTER CONTENT:
${chapterContent.slice(0, 3000)}`
      : `You are an expert AI tutor for a Generative AI Fundamentals course.
Answer questions about LLMs, Prompt Engineering, RAG, Fine-tuning, AI Agents, and Evaluation.
Be concise and educational.`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 512,
    });

    return NextResponse.json({
      response: response.choices[0].message.content,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
