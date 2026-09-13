
from fastapi import APIRouter, UploadFile, File, Depends
from PIL import Image
from io import BytesIO

from database import diagnoses
from auth import get_current_user
from services.disease_model import predict_image
from services.care_data import get_care_recommendations
from services.rag_service import retrieve


router = APIRouter()


@router.post("/diagnose")
async def diagnose(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    image = Image.open(BytesIO(await file.read()))

    # 1. AI disease prediction
    result = predict_image(image)

    plant = result["plant"]
    disease = result["disease"]
    confidence = result["confidence"]
    is_uncertain = result.get("is_uncertain", False)

    # 2. Existing disease-aware recommendations
    recommendations = get_care_recommendations(
        plant,
        disease,
        confidence,
        is_uncertain,
    )

    # 3. RAG retrieval
    rag_query = f"{plant} {disease} symptoms management prevention treatment care"

    rag_hits = retrieve(rag_query, k=3)

    # 4. Add RAG knowledge to response
    rag_results = [
        {
            "source": hit["source"],
            "score": round(hit["score"], 4),
            "plant": hit["plant"],
            "disease": hit["disease"],
            "category": hit["category"],
            "text": hit["text"],
        }
        for hit in rag_hits
    ]

    # 5. Save diagnosis history
    diagnoses.insert_one({
        "user_id": user_id,
        "plant": plant,
        "disease": disease,
        "confidence": confidence,
    })

    # 6. Final response
    result["recommendations"] = recommendations
    result["rag"] = {
        "query": rag_query,
        "results": rag_results,
    }

    return result