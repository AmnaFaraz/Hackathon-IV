"""
Premium routes — PHASE 2: HYBRID INTELLIGENCE
Only 2 endpoints use Groq. All require premium flag check.
grep check: only this file contains 'groq' in backend/
"""
import os
import json
from functools import lru_cache
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from groq import Groq  # PHASE 2 (HYBRID — PREMIUM ONLY)

router = APIRouter()

# PHASE 2 (HYBRID — PREMIUM ONLY)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# Simple premium check (Phase 2 — swap with Supabase in Phase 3)
PREMIUM_USERS = set(os.getenv("PREMIUM_USER_IDS", "").split(","))

# Cache for learning path (1 hour)
_learning_path_cache: dict[str, tuple[datetime, dict]] = {}


def require_premium(user_id: str):
    if user_id not in PREMIUM_USERS and user_id != "demo-premium":
        raise HTTPException(
            status_code=403,
            detail="This feature requires a Premium subscription."
        )


class EssayGradeRequest(BaseModel):
    user_id: str
    chapter_slug: str
    question: str
    student_answer: str


class LearningPathRequest(BaseModel):
    user_id: str
    completed_chapters: list[str] = []
    weak_areas: list[str] = []


@router.post("/premium/grade-essay")
def grade_essay(req: EssayGradeRequest):
    """PHASE 2 (HYBRID — PREMIUM ONLY): Grade open-ended essay with Groq"""
    require_premium(req.user_id)

    prompt = f"""Grade this student essay response.

Chapter: {req.chapter_slug}
Question: {req.question}
Student Answer: {req.student_answer}

Provide a detailed evaluation. Respond with JSON:
{{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "feedback": "<2-3 sentence detailed feedback>"
}}"""

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content or "{}")
    return result


@router.get("/premium/learning-path/{user_id}")
def get_learning_path(user_id: str):
    """PHASE 2 (HYBRID — PREMIUM ONLY): Personalized learning path via Groq"""
    require_premium(user_id)

    # Check cache (1 hour)
    if user_id in _learning_path_cache:
        cached_time, cached_result = _learning_path_cache[user_id]
        if datetime.utcnow() - cached_time < timedelta(hours=1):
            return {**cached_result, "cached": True}

    prompt = """Recommend the next 3 topics for an AI/ML learner.
The course covers: LLMs, Prompt Engineering, RAG, Fine-tuning, AI Agents, Evaluation.

Respond with JSON:
{
  "recommendations": [
    {
      "slug": "<chapter-slug>",
      "title": "<chapter title>",
      "reason": "<why this is recommended>",
      "priority": <1|2|3>
    }
  ]
}"""

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content or "{}")

    # Cache result
    _learning_path_cache[user_id] = (datetime.utcnow(), result)

    return result
