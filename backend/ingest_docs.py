import os
import json
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
from fastembed import TextEmbedding

load_dotenv()

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
CONTENT_DIR = Path(__file__).parent.parent / "content"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("Embedding model loaded.")

def ingest():
    chapters_file = CONTENT_DIR / "chapters.json"
    with open(chapters_file) as f:
        chapters = json.load(f)

    print(f"Found {len(chapters)} chapters. Starting ingestion...")

    for chapter in chapters:
        file_path = CONTENT_DIR / "chapters" / chapter["content_file"]
        if not file_path.exists():
            print(f"Skipping {chapter['slug']} - file not found")
            continue

        content = file_path.read_text(encoding="utf-8")
        
        # Split content into chunks (roughly 500 words)
        chunks = content.split("\n\n")
        
        for idx, chunk in enumerate(chunks):
            if len(chunk.strip()) < 50: continue
            
            embedding = list(model.embed([chunk]))[0].tolist()
            
            data = {
                "chapter_slug": chapter["slug"],
                "chapter_title": chapter["title"],
                "content": chunk,
                "embedding": embedding,
                "chunk_index": idx
            }
            
            try:
                supabase.table("course_content").upsert(data).execute()
                print(f"Ingested {chapter['slug']} chunk {idx}")
            except Exception as e:
                print(f"Error ingesting {chapter['slug']}: {e}")

if __name__ == "__main__":
    ingest()
