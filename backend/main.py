"""
Panaversity Course Companion FTE — Backend (FastAPI)
Phase 1: ZERO LLM (content routes only)
Phase 2: 2 premium Groq routes added
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from content_loader import load_chapters, load_quizzes
from routes.content import router as content_router
from routes.premium import router as premium_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up content cache
    load_chapters()
    load_quizzes()
    print("Content cache loaded.")
    yield


app = FastAPI(
    title="Course Companion FTE API",
    description="Hackathon IV — Generative AI Fundamentals Course",
    version="4.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content_router, prefix="/api", tags=["content"])
app.include_router(premium_router, prefix="/api", tags=["premium"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "course-companion-api", "version": "4.0.0"}
