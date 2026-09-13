from pathlib import Path
import json
import os
import faiss
from sentence_transformers import SentenceTransformer

BASE = Path(__file__).resolve().parents[1] / "rag"
INDEX = BASE / "index.faiss"
META = BASE / "metadata.json"

_model = None
_index = None
_meta = []


def ensure_loaded():
    global _model, _index, _meta
    if _model is not None:
        return
    _model = SentenceTransformer("all-MiniLM-L6-v2")
    if INDEX.exists() and META.exists():
        _index = faiss.read_index(str(INDEX))
        _meta = json.loads(META.read_text(encoding="utf-8"))
    else:
        _index = None
        _meta = []


def retrieve(question, k=3):
    ensure_loaded()
    if _index is None:
        return []
    q = _model.encode([question], normalize_embeddings=True).astype("float32")
    scores, ids = _index.search(q, min(k, _index.ntotal))
    return [
        {"score": float(score), **_meta[i]}
        for score, i in zip(scores[0], ids[0]) if i >= 0
    ]


def _call_free_llm(prompt: str):
    """
    Free LLM call using Groq's OpenAI-compatible API.
    Get a free key (no credit card needed) at https://console.groq.com/keys
    Set GROQ_API_KEY in backend/.env to enable this. Without it, the
    template answer below is used instead - fully free, no key needed.
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[rag_service] Free LLM call failed, falling back to template answer: {e}")
        return None


def _template_answer(question, hits, context):
    if not hits:
        return (
            "The RAG knowledge base is not indexed yet. Run this once from the "
            "backend folder: python rag/ingest.py"
        )
    lines = ["Based on the plant-care knowledge base:", ""]
    for h in hits:
        source_name = h["source"].replace(".txt", "").replace("_", " ").title()
        snippet = h["text"].strip().splitlines()
        snippet_text = " ".join(s.strip() for s in snippet if s.strip())
        lines.append(f"• {source_name}: {snippet_text}")
    lines.append("")
    lines.append(
        "Tip: check soil moisture, light and leaf symptoms before changing "
        "your watering or fertilizer routine."
    )
    return "\n".join(lines)


def answer(question):
    hits = retrieve(question)
    context = "\n\n".join(h["text"] for h in hits)

    text = None
    if context:
        prompt = (
            "You are PlantCare AI. Answer using only the supplied plant-care context. "
            "Be concise, practical and beginner-friendly. If the context is insufficient, "
            "say that more information is needed. Do not claim certainty about plant disease.\n\n"
            f"CONTEXT:\n{context}\n\nQUESTION:\n{question}"
        )
        text = _call_free_llm(prompt)

    if text is None:
        text = _template_answer(question, hits, context)

    return {
        "answer": text,
        "sources": [{"source": h["source"], "score": h["score"]} for h in hits],
    }