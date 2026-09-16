from pathlib import Path
import os
import re

from database import diagnoses

BASE = Path(__file__).resolve().parents[1] / "rag"
DOCS = BASE / "documents"


def _load_documents():
    """
    Load plant-care knowledge from text files.
    No FAISS / SentenceTransformer dependency.
    """
    documents = []

    if not DOCS.exists():
        return documents

    for path in DOCS.rglob("*.txt"):
        try:
            text = path.read_text(encoding="utf-8").strip()

            if not text:
                continue

            relative = path.relative_to(DOCS)
            parts = relative.parts

            category = parts[0] if len(parts) > 1 else "general"
            filename = path.stem

            documents.append(
                {
                    "source": path.name,
                    "path": str(relative),
                    "category": category,
                    "plant": "",
                    "disease": "",
                    "text": text,
                }
            )

        except Exception as e:
            print(f"[RAG] Could not read {path}: {e}")

    return documents


_documents = None


def ensure_loaded():
    global _documents

    if _documents is None:
        print("[RAG] Loading lightweight knowledge base...")
        _documents = _load_documents()
        print(f"[RAG] Loaded {len(_documents)} documents")


def _words(text):
    return set(
        re.findall(
            r"[a-zA-Z0-9]+",
            text.lower()
        )
    )


def retrieve(question, k=3):
    """
    Lightweight keyword-based retrieval.

    This replaces FAISS + SentenceTransformer so Render
    does not need Torch/CUDA dependencies.
    """
    ensure_loaded()

    if not _documents:
        return []

    question_words = _words(question)

    if not question_words:
        return []

    scored = []

    for document in _documents:
        text_words = _words(document["text"])

        if not text_words:
            continue

        common = question_words.intersection(text_words)

        score = len(common)

        if score > 0:
            scored.append(
                {
                    "score": float(score),
                    **document,
                }
            )

    scored.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return scored[:k]


def _call_free_llm(prompt: str):
    """
    Optional Groq/OpenAI-compatible API call.

    If GROQ_API_KEY is missing or the API fails,
    the system automatically uses the local answer.
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()

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
            "openai/gpt-oss-20b"
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
            f"[RAG] Groq call failed. "
            f"Using local fallback. Error: {e}"
        )
        return None


def _template_answer(question, hits):
    if not hits:
        return (
            "I could not find relevant information in the "
            "PlantCare knowledge base. Please provide more "
            "details about the plant, symptoms, soil, light, "
            "or watering condition."
        )

    lines = [
        "Based on the PlantCare knowledge base:",
        ""
    ]

    for hit in hits:
        source_name = (
            hit["source"]
            .replace(".txt", "")
            .replace("_", " ")
            .title()
        )

        text = " ".join(
            line.strip()
            for line in hit["text"].splitlines()
            if line.strip()
        )

        lines.append(
            f"• {source_name}: {text}"
        )

    lines.extend(
        [
            "",
            "Tip: Check soil moisture, light, "
            "leaf symptoms and watering conditions "
            "before changing your care routine."
        ]
    )

    return "\n".join(lines)


def answer(question):
    hits = retrieve(question, k=3)

    context = "\n\n".join(
        hit["text"]
        for hit in hits
    )

    text = None

    if context:
        prompt = (
            "You are PlantCare AI, a beginner-friendly "
            "plant-care assistant.\n\n"
            "Answer using the supplied knowledge-base "
            "context. Keep the answer practical and concise. "
            "Do not claim certainty about plant disease. "
            "If the context is insufficient, clearly say "
            "that more information is needed.\n\n"
            f"CONTEXT:\n{context}\n\n"
            f"QUESTION:\n{question}"
        )

        text = _call_free_llm(prompt)

    if text is None:
        text = _template_answer(
            question,
            hits
        )

    return {
        "answer": text,
        "sources": [
            {
                "source": hit["source"],
                "score": hit["score"],
            }
            for hit in hits
        ],
    }