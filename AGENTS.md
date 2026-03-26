# AGENTS.md

Spec-driven development. No code without spec.
LLM: Groq llama-3.3-70b-versatile. Never openai/anthropic.
Frontend: Next.js 15 + shadcn/ui. DB: Supabase. Deploy: Vercel + Koyeb.

## Student
Name: Amna Faraz
GitHub: AmnaFaraz

## Project
Hackathon IV — Course Companion FTE
Points: 1000 pts + 500 bonus
Course: Option C — Generative AI Fundamentals

## Phases
- Phase 1: ZERO-BACKEND-LLM (45 pts) — Groq ONLY in Next.js API routes
- Phase 2: HYBRID INTELLIGENCE — PREMIUM (20 pts) — 2 premium Groq endpoints
- Phase 3: FULL WEB APP (30 pts) — Full LMS with XP system

## Rules
- All LLM calls use Groq SDK with model: llama-3.3-70b-versatile
- Phase 1 RULE: FastAPI backend = ZERO Groq calls
- NEVER commit .env or .env.local files
- BUILD GATE: npm run build must pass 0 errors
