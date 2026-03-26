# Chapter 3: Retrieval-Augmented Generation (RAG)

## The Problem RAG Solves

LLMs have a knowledge cutoff — they can't access real-time information, private documents, or domain-specific data they weren't trained on. They also hallucinate when asked about facts outside their training.

**Retrieval-Augmented Generation (RAG)** solves this by giving the model access to an external knowledge base at inference time. Instead of relying solely on parametric memory (weights), the model retrieves relevant documents and uses them as context.

## RAG Architecture

```
User Query
    ↓
[Embedding Model] → Query Vector
    ↓
[Vector Database] → Top-K Similar Documents
    ↓
[Prompt Assembly]
  "Context: {retrieved docs}
   Question: {user query}
   Answer:"
    ↓
[LLM] → Final Answer
```

## Step 1: Document Ingestion (Offline)

Before RAG can work, you must index your knowledge base:

1. **Load documents**: PDFs, web pages, markdown files, databases
2. **Chunk**: Split into smaller segments (typically 200-500 tokens with overlap)
3. **Embed**: Convert each chunk to a dense vector using an embedding model
4. **Store**: Save vectors + metadata in a vector database

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def ingest_document(text: str, source: str):
    chunks = chunk_text(text, size=500, overlap=50)
    embeddings = model.encode(chunks)
    # Store in pgvector/Pinecone/Weaviate
    vector_db.upsert(embeddings, chunks, source)
```

## Step 2: Retrieval (Online)

When a user asks a question:
1. Embed the query using the same model
2. Perform cosine similarity search in the vector database
3. Return top-K most similar chunks

```sql
-- pgvector example
SELECT content, source,
  1 - (embedding <=> $1::vector) AS similarity
FROM documents
ORDER BY similarity DESC
LIMIT 5;
```

## Step 3: Generation

Assemble the context and call the LLM:

```python
def answer(question: str) -> str:
    # Retrieve relevant chunks
    query_vec = embed(question)
    chunks = vector_db.search(query_vec, k=5)
    context = "\n\n".join(chunks)

    # Generate answer
    prompt = f"""Answer based only on the context below.
If the answer isn't in the context, say "I don't know."

Context:
{context}

Question: {question}"""

    response = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

## Embedding Models

| Model | Dimensions | Speed | Quality |
|-------|-----------|-------|---------|
| all-MiniLM-L6-v2 | 384 | Fast | Good |
| all-mpnet-base-v2 | 768 | Medium | Better |
| text-embedding-3-small | 1536 | API call | Excellent |
| nomic-embed-text | 768 | Fast | Excellent |

For local, free deployment: **all-MiniLM-L6-v2** (used in this course).

## Vector Databases

- **pgvector**: PostgreSQL extension — great for existing Postgres setups
- **Pinecone**: Managed cloud service, easy to scale
- **Weaviate**: Open-source, schema-based
- **Chroma**: Lightweight, great for prototypes
- **Qdrant**: High-performance, Rust-based

## Advanced RAG Patterns

### HyDE (Hypothetical Document Embeddings)
Generate a hypothetical answer, embed it, then retrieve based on the hypothetical:
```
Query → Generate hypothetical answer → Embed hypothesis → Retrieve similar real docs
```

### Re-ranking
Use a cross-encoder to re-rank retrieved chunks for relevance:
```
Top 20 by vector similarity → Cross-encoder re-rank → Top 5 most relevant
```

### Multi-query Retrieval
Generate multiple query variations to improve recall:
```
Original: "How does RAG work?"
Generated: ["RAG architecture explained", "retrieval augmented generation steps", "LLM + retrieval system"]
```

## RAG Evaluation Metrics

- **Faithfulness**: Is the answer grounded in retrieved context?
- **Answer Relevancy**: Does the answer address the question?
- **Context Precision**: Are retrieved chunks relevant?
- **Context Recall**: Did we retrieve all necessary information?

Tools: RAGAS, TruLens, LangSmith
