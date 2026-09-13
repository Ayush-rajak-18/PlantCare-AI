from pathlib import Path
import json
import faiss
from sentence_transformers import SentenceTransformer
BASE = Path(__file__).resolve().parent
index = faiss.read_index(str(BASE / "rag" / "index.faiss"))
metadata = json.loads(
    (BASE / "rag" / "metadata.json").read_text(
        encoding="utf-8"
    )
)
model = SentenceTransformer("all-MiniLM-L6-v2")
query = "Potato Late Blight symptoms management prevention treatment"
embedding = model.encode(
    [query],
    normalize_embeddings=True
).astype("float32")
scores, indices = index.search(embedding, 5)
print()
print("=" * 60)
print("RAG RETRIEVAL TEST")
print("=" * 60)
print("Query:", query)
print()
for rank, (score, idx) in enumerate(
    zip(scores[0], indices[0]),
    start=1
):
    item = metadata[idx]
    print(f"#{rank}")
    print("Score   :", round(float(score), 4))
    print("Source  :", item["source"])
    print("Plant   :", item["plant"])
    print("Disease :", item["disease"])
    print("Category:", item["category"])
    print("-" * 60)
