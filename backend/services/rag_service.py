from pathlib import Path
import json
import os
import re
import math
from collections import Counter

BASE = Path(__file__).resolve().parents[1] / "rag"
META = BASE / "metadata.json"

_meta = []
_loaded = False


def ensure_loaded():
    global _meta, _loaded

    if _loaded:
        return

    _loaded = True

    if META.exists():
        try:
            _meta = json.loads(META.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"[rag_service] Failed to load metadata: {e}")
            _meta = []
    else:
        _meta = []


def _tokenize(text):
    return re.findall(r"[a-zA-Z0-9]+", text.lower())


def _score(question, text):
    question_tokens = _tokenize(question)
    text_tokens = _tokenize(text)

    if not question_tokens or not text_tokens:
        return 0.0

    question_count = Counter(question_tokens)
    text_count = Counter(text_tokens)

    score = 0.0

    for word, count in question_count.items():
        if word in text_count:
            score += min(count, text_count[word])

    # Normalize score so results stay between 0 and 1
    denominator = math.sqrt(
        sum(v * v for v in question_count.values())
        * sum(v * v for v in text_count.values())
    )

    if denominator == 0:
        return 0.0

    return min(score / denominator, 1.0)


def retrieve(question, k=3):
    ensure_loaded()

    if not _meta:
        return []

    results = []

    for item in _meta:
        text = item.get("text", "")

        score = _score(question, text)

        results.append(
            {
                "score": float(score),
                **item,
            }
        )

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results[:k]


def _call_free_llm(prompt: str):
    """
    Groq OpenAI-compatible API.
    GROQ_API_KEY and GROQ_MODEL are read from environment variables.
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
            f"[rag_service] Groq call failed, "
            f"falling back to template answer: {e}"
        )
        return None


def _template_answer(question, hits, context):
    if not hits:
        return (
            "The PlantCare AI knowledge base does not have "
            "enough information for this question."
        )

    lines = [
        "Based on the PlantCare AI knowledge base:",
        ""
    ]

    for h in hits:
        source = h.get("source", "Knowledge Base")
        source_name = (
            source
            .replace(".txt", "")
            .replace("_", " ")
            .title()
        )

        text = h.get("text", "").strip()

        lines.append(
            f"• {source_name}: {text}"
        )

    lines.append("")
    lines.append(
        "Tip: Check soil moisture, light, leaf symptoms, "
        "and watering routine before making major changes."
    )

    return "\n".join(lines)


def answer(question):
    hits = retrieve(question, k=3)

    context = "\n\n".join(
        h.get("text", "")
        for h in hits
        if h.get("text")
    )

    text = None

    if context:
        prompt = (
            "You are PlantCare AI, a plant-care assistant.\n"
            "Answer using only the supplied plant-care context.\n"
            "Be concise, practical and beginner-friendly.\n"
            "If the context is insufficient, say that more "
            "information is needed.\n"
            "Do not claim certainty about plant disease.\n\n"
            f"CONTEXT:\n{context}\n\n"
            f"QUESTION:\n{question}"
        )

        text = _call_free_llm(prompt)

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
                "source": h.get("source", ""),
                "score": round(
                    float(h.get("score", 0)),
                    4
                ),
            }
            for h in hits
        ],
    }