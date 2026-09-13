from pathlib import Path
import json
import re

import faiss
from sentence_transformers import SentenceTransformer


BASE = Path(__file__).resolve().parent

DOCUMENTS_DIR = BASE / "documents"
INDEX_PATH = BASE / "index.faiss"
METADATA_PATH = BASE / "metadata.json"

MODEL_NAME = "all-MiniLM-L6-v2"


def clean_text(text):
    text = text.replace("\ufeff", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_field(text, field_name):
    pattern = rf"(?im)^\s*{re.escape(field_name)}\s*:\s*(.+?)\s*$"
    match = re.search(pattern, text)

    if match:
        return match.group(1).strip()

    return None


def detect_plant(path, text):
    # First try the Plant: field
    plant = extract_field(text, "Plant")

    if plant:
        return plant

    # Otherwise detect plant from filename
    filename = path.stem.lower()

    plant_map = {
        "apple": "Apple",
        "blueberry": "Blueberry",
        "cherry": "Cherry",
        "corn": "Corn",
        "grape": "Grape",
        "orange": "Orange",
        "peach": "Peach",
        "pepper_bell": "Pepper Bell",
        "potato": "Potato",
        "raspberry": "Raspberry",
        "soybean": "Soybean",
        "squash": "Squash",
        "strawberry": "Strawberry",
        "tomato": "Tomato",
    }

    for key, value in plant_map.items():
        if filename.startswith(key):
            return value

    return None


def get_category(path):
    folder = path.parent.name.lower()

    if folder == "diseases":
        return "disease"

    if folder == "healthy":
        return "healthy"

    if folder == "plants":
        return "plant"

    return "general"


def load_documents():
    if not DOCUMENTS_DIR.exists():
        raise FileNotFoundError(
            f"Documents folder not found: {DOCUMENTS_DIR}"
        )

    files = sorted(
        DOCUMENTS_DIR.rglob("*.txt"),
        key=lambda p: str(p).lower()
    )

    print("=" * 60)
    print("PlantCare AI - RAG Ingestion")
    print("=" * 60)
    print(f"Documents folder : {DOCUMENTS_DIR}")
    print(f"TXT files found  : {len(files)}")
    print()

    texts = []
    metadata = []
    skipped = 0

    for path in files:
        try:
            raw_text = path.read_text(
                encoding="utf-8",
                errors="ignore"
            )

            text = clean_text(raw_text)

            if not text:
                print(f"[SKIP] Empty: {path.name}")
                skipped += 1
                continue

            relative_path = path.relative_to(
                DOCUMENTS_DIR
            ).as_posix()

            category = get_category(path)
            plant = detect_plant(path, raw_text)

            disease = extract_field(
                raw_text,
                "Disease"
            )

            condition = extract_field(
                raw_text,
                "Condition"
            )

            metadata_item = {
                "source": relative_path,
                "filename": path.name,
                "category": category,
                "plant": plant,
                "disease": disease,
                "condition": condition,
                "text": raw_text.strip()
            }

            texts.append(text)
            metadata.append(metadata_item)

            print(
                f"[OK] {relative_path} | "
                f"Plant={plant} | "
                f"Disease={disease} | "
                f"Category={category}"
            )

        except Exception as error:
            print(
                f"[SKIP] {path.name} -> {error}"
            )
            skipped += 1

    print()
    print("-" * 60)
    print(f"Loaded  : {len(texts)}")
    print(f"Skipped : {skipped}")
    print("-" * 60)

    if not texts:
        raise RuntimeError(
            "No valid RAG documents were found."
        )

    return texts, metadata


def create_faiss_index(texts):
    print()
    print(f"Loading embedding model: {MODEL_NAME}")

    model = SentenceTransformer(MODEL_NAME)

    print("Creating embeddings...")

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    embeddings = embeddings.astype("float32")

    print(
        f"Embedding shape: {embeddings.shape}"
    )

    # Normalized vectors + Inner Product
    # = cosine similarity
    index = faiss.IndexFlatIP(
        embeddings.shape[1]
    )

    index.add(embeddings)

    return index


def save_index(index, metadata):
    faiss.write_index(
        index,
        str(INDEX_PATH)
    )

    METADATA_PATH.write_text(
        json.dumps(
            metadata,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print()
    print("=" * 60)
    print("RAG INDEX CREATED SUCCESSFULLY")
    print("=" * 60)
    print(f"FAISS index : {INDEX_PATH}")
    print(f"Metadata    : {METADATA_PATH}")
    print(f"Vectors     : {index.ntotal}")
    print("=" * 60)


def main():
    texts, metadata = load_documents()

    index = create_faiss_index(texts)

    save_index(index, metadata)


if __name__ == "__main__":
    main()