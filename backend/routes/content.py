"""
Content routes — PHASE 1: ZERO LLM calls
All responses come from static JSON + cached markdown files.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from content_loader import load_chapters, load_chapter_content, load_quizzes, search_chapters

router = APIRouter()

# In-memory progress store (Phase 1 — swap with Supabase in Phase 3)
_progress: dict[str, dict] = {}


@router.get("/chapters")
def list_chapters():
    """PHASE 1 (ZERO LLM): Return all chapters with metadata"""
    chapters = load_chapters()
    return [
        {
            "id": c["id"],
            "slug": c["slug"],
            "title": c["title"],
            "order": c["order"],
            "is_free": c["is_free"],
            "quiz_count": c["quiz_count"],
            "estimated_minutes": c["estimated_minutes"],
        }
        for c in chapters
    ]


@router.get("/chapters/{slug}")
def get_chapter(slug: str):
    """PHASE 1 (ZERO LLM): Return chapter content as markdown"""
    chapters = load_chapters()
    chapter = next((c for c in chapters if c["slug"] == slug), None)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    content = load_chapter_content(chapter["content_file"])
    return {
        **chapter,
        "content": content,
    }


@router.get("/chapters/{slug}/next")
def get_next_chapter(slug: str):
    """PHASE 1 (ZERO LLM): Get next chapter in sequence"""
    chapters = sorted(load_chapters(), key=lambda c: c["order"])
    current_idx = next((i for i, c in enumerate(chapters) if c["slug"] == slug), None)
    if current_idx is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if current_idx >= len(chapters) - 1:
        return {"next": None}
    nxt = chapters[current_idx + 1]
    return {"next": {"slug": nxt["slug"], "title": nxt["title"]}}


@router.get("/chapters/{slug}/prev")
def get_prev_chapter(slug: str):
    """PHASE 1 (ZERO LLM): Get previous chapter"""
    chapters = sorted(load_chapters(), key=lambda c: c["order"])
    current_idx = next((i for i, c in enumerate(chapters) if c["slug"] == slug), None)
    if current_idx is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if current_idx == 0:
        return {"prev": None}
    prv = chapters[current_idx - 1]
    return {"prev": {"slug": prv["slug"], "title": prv["title"]}}


@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    """PHASE 1 (ZERO LLM): Case-insensitive full-text search"""
    results = search_chapters(q)
    return {"query": q, "results": results, "count": len(results)}


class QuizSubmit(BaseModel):
    answer: str


@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: str, body: QuizSubmit):
    """PHASE 1 (ZERO LLM): Grade quiz against answer key — no AI"""
    quizzes = load_quizzes()
    quiz = next((q for q in quizzes if q["id"] == quiz_id), None)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct = body.answer.strip().lower() == quiz["answer"].strip().lower()
    return {
        "correct": correct,
        "correct_answer": quiz["answer"],
        "explanation": quiz["explanation"],
        "score": 100 if correct else 0,
    }


@router.get("/quizzes")
def get_quizzes(chapter_slug: str | None = None):
    """PHASE 1 (ZERO LLM): Get quizzes, optionally filtered by chapter"""
    quizzes = load_quizzes()
    if chapter_slug:
        quizzes = [q for q in quizzes if q["chapter_slug"] == chapter_slug]
    # Hide answers from response
    return [
        {k: v for k, v in q.items() if k != "answer" and k != "explanation"}
        for q in quizzes
    ]


@router.get("/progress/{user_id}")
def get_progress(user_id: str):
    """PHASE 1 (ZERO LLM): Get user progress"""
    return _progress.get(user_id, {
        "user_id": user_id,
        "completed_chapters": [],
        "quiz_scores": {},
        "xp": 0,
        "streak": 0,
    })


class ProgressUpdate(BaseModel):
    completed_chapter: str | None = None
    quiz_id: str | None = None
    quiz_score: int | None = None


@router.put("/progress/{user_id}")
def update_progress(user_id: str, body: ProgressUpdate):
    """PHASE 1 (ZERO LLM): Update user progress"""
    if user_id not in _progress:
        _progress[user_id] = {
            "user_id": user_id,
            "completed_chapters": [],
            "quiz_scores": {},
            "xp": 0,
            "streak": 0,
        }

    prog = _progress[user_id]

    if body.completed_chapter and body.completed_chapter not in prog["completed_chapters"]:
        prog["completed_chapters"].append(body.completed_chapter)
        prog["xp"] += 10  # +10 XP per chapter

    if body.quiz_id and body.quiz_score is not None:
        prog["quiz_scores"][body.quiz_id] = body.quiz_score
        if body.quiz_score >= 70:
            prog["xp"] += 25  # +25 XP per passed quiz

    return prog


@router.get("/access/{user_id}/{slug}")
def check_access(user_id: str, slug: str):
    """PHASE 1 (ZERO LLM): Check if user can access chapter (free ch1-2, rest premium)"""
    chapters = load_chapters()
    chapter = next((c for c in chapters if c["slug"] == slug), None)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Free: chapters 1-2, Premium: all
    # TODO Phase 2: check Supabase user_metadata for premium flag
    has_access = chapter["is_free"]  # or user is premium

    return {
        "slug": slug,
        "has_access": has_access,
        "is_free": chapter["is_free"],
        "requires_premium": not chapter["is_free"],
    }
