from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import answer

router = APIRouter()

class ChatIn(BaseModel):
    question: str

@router.post("/chat")
def chat(data: ChatIn):
    return answer(data.question)
