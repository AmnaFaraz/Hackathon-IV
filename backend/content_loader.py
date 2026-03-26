"""
Content loader — loads and caches chapter markdown + quiz data at startup.
PHASE 1: ZERO LLM calls in backend.
"""
import json
import os
import re
from pathlib import Path
from functools import lru_cache

CONTENT_DIR = Path(__file__).parent.parent / "content"


@lru_cache(maxsize=1)
def load_chapters() -> list[dict]:
    with open(CONTENT_DIR / "chapters.json") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_quizzes() -> list[dict]:
    with open(CONTENT_DIR / "quizzes.json") as f:
        return json.load(f)


@lru_cache(maxsize=20)
def load_chapter_content(content_file: str) -> str:
    path = CONTENT_DIR / "chapters" / content_file
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def strip_markdown(text: str) -> str:
    """Remove markdown formatting for plain text search"""
    text = re.sub(r"#{1,6}\s*", "", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`{1,3}[^`]*`{1,3}", "", text, flags=re.DOTALL)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    text = re.sub(r"\|[^\n]+\|", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def search_chapters(query: str) -> list[dict]:
    """Case-insensitive search across all chapter content"""
    results = []
    chapters = load_chapters()
    query_lower = query.lower()

    for chapter in chapters:
        content = load_chapter_content(chapter["content_file"])
        plain = strip_markdown(content).lower()

        if query_lower in chapter["title"].lower() or query_lower in plain:
            # Find matching excerpt
            idx = plain.find(query_lower)
            excerpt = ""
            if idx >= 0:
                start = max(0, idx - 100)
                end = min(len(plain), idx + 200)
                excerpt = "..." + plain[start:end] + "..."

            results.append({
                "slug": chapter["slug"],
                "title": chapter["title"],
                "excerpt": excerpt,
                "order": chapter["order"],
            })

    return sorted(results, key=lambda x: x["order"])
