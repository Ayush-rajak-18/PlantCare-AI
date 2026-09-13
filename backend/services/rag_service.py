from pathlib import Path
import json
import os

import faiss


# =========================================================
# PATHS
# =========================================================

BASE = Path(__file__).resolve().parents[1] / "rag"

INDEX = BASE / "index.faiss"
META = BASE / "metadata.json"


# =========================================================
# LAZY-LOADED RAG OBJECTS
# =========================================================

_model = None
_index = None
_meta = []


# =========================================================
# LOAD RAG MODEL + INDEX
# =========================================================

def ensure_loaded():
    global _model, _index, _meta

    # Already loaded
    if _model is not None:
        return

    print("[RAG] Loading SentenceTransformer model...")

    # IMPORTANT:
    # Import only when RAG is actually used.
    # This prevents Torch/SentenceTransformer from loading
    # during FastAPI server startup.
    from sentence_transformers import SentenceTransformer

    _model = SentenceTransformer("all-MiniLM-L6-v2")

    print("[RAG] SentenceTransformer loaded successfully.")

    # Load FAISS index and metadata
    if INDEX.exists() and META.exists():

        print(f"[RAG] Loading FAISS index: {INDEX}")

        _index = faiss.read_index(str(INDEX))

        _meta = json.loads(
            META.read_text(encoding="utf-8")
        )

        print(
            f"[RAG] FAISS index loaded successfully. "
            f"Documents: {_index.ntotal}"
        )

    else:

        print("[RAG] FAISS index or metadata not found.")

        _index = None
        _meta = []


# =========================================================
# RAG RETRIEVAL
# =========================================================

def retrieve(question, k=3):

    ensure_loaded()

    if _index is None:
        return []

    # Convert question into embedding
    q = _model.encode(
        [question],
        normalize_embeddings=True
    ).astype("float32")

    # Search FAISS
    scores, ids = _index.search(
        q,
        min(k, _index.ntotal)
    )

    results = []

    for score, i in zip(scores[0], ids[0]):

        if i < 0:
            continue

        if i >= len(_meta):
            continue

        results.append(
            {
                "score": float(score),
                **_meta[i]
            }
        )

    return results


# =========================================================
# GROQ FREE LLM
# =========================================================

def _call_free_llm(prompt: str):
    """
    Free LLM call using Groq's OpenAI-compatible API.

    GROQ_API_KEY is optional.

    If GROQ_API_KEY is not configured or the API fails,
    the system automatically falls back to the local
    template answer.
    """

    api_key = os.getenv(
        "GROQ_API_KEY",
        ""
    ).strip()

    if not api_key:
        return None

    try:

        from openai import OpenAI

        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )

        model = os.getenv(
            "GROQ_MODEL",
            "llama-3.1-8b-instant"
        )

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=400,
        )

        return response.choices[0].message.content

    except Exception as e:

        print(
            "[rag_service] Free LLM call failed, "
            f"falling back to template answer: {e}"
        )

        return None


# =========================================================
# TEMPLATE FALLBACK ANSWER
# =========================================================

def _template_answer(
    question,
    hits,
    context
):

    if not hits:

        return (
            "The RAG knowledge base is not indexed yet. "
            "Run this once from the backend folder: "
            "python rag/ingest.py"
        )

    lines = [
        "Based on the plant-care knowledge base:",
        ""
    ]

    for h in hits:

        source_name = (
            h["source"]
            .replace(".txt", "")
            .replace("_", " ")
            .title()
        )

        snippet = h["text"].strip().splitlines()

        snippet_text = " ".join(
            s.strip()
            for s in snippet
            if s.strip()
        )

        lines.append(
            f"• {source_name}: {snippet_text}"
        )

    lines.append("")

    lines.append(
        "Tip: check soil moisture, light and leaf symptoms "
        "before changing your watering or fertilizer routine."
    )

    return "\n".join(lines)


# =========================================================
# RAG + GROQ ANSWER
# =========================================================

def answer(question):

    # Retrieve relevant knowledge
    hits = retrieve(question)

    context = "\n\n".join(
        h["text"]
        for h in hits
    )

    text = None

    # Use Groq only when relevant RAG context exists
    if context:

        prompt = (
            "You are PlantCare AI. "
            "Answer using only the supplied plant-care context. "
            "Be concise, practical and beginner-friendly. "
            "If the context is insufficient, say that more "
            "information is needed. "
            "Do not claim certainty about plant disease.\n\n"

            f"CONTEXT:\n{context}\n\n"

            f"QUESTION:\n{question}"
        )

        text = _call_free_llm(prompt)

    # Local fallback
    if text is None:

        text = _template_answer(
            question,
            hits,
            context
        )

    return {
        "answer": text,

        "sources": [
            {
                "source": h["source"],
                "score": h["score"]
            }
            for h in hits
        ],
    }