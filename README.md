# Course Companion FTE — Generative AI Fundamentals

**Student:** Amna Faraz | **GitHub:** AmnaFaraz

## Phases

| Phase | Description | Points |
|-------|-------------|--------|
| 1 | Zero-Backend-LLM (Groq in Next.js only) | 45 |
| 2 | Hybrid Intelligence — Premium Groq routes | 20 |
| 3 | Full LMS with XP system | 30 |

## Quick Start

### Backend (Phase 1 — ZERO Groq)
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --port 8002 --reload
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local  # Add GROQ_API_KEY
npm install
npm run dev
```

## Phase 1 Self-Audit
```bash
# This MUST return 0 matches (backend has no Groq)
grep -rn "groq\|openai\|anthropic" backend/routes/content.py
# Only premium.py should have groq
grep -rn "groq" backend/routes/premium.py
```

## XP System
- +10 XP per chapter completed
- +25 XP per quiz passed (≥70%)
- +50 XP for 7-day streak
- +100 XP per module mastered

## Stack
- Frontend: Next.js 15 + TypeScript + Tailwind v4
- AI Tutor: Groq llama-3.3-70b (Next.js API route — Phase 1)
- Backend: FastAPI + Python 3.13 (Zero Groq in Phase 1)
- Deploy: Vercel (frontend) + Koyeb (backend)
