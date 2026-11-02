from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.auth import router as auth_router
from routes.plants import router as plants_router
from routes.ai import router as ai_router
from routes.rag import router as rag_router
from routes.reminders import router as reminders_router      # NEW
from services.images import UPLOAD_DIR                       # NEW


app = FastAPI(
    title="PlantCare AI API",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NEW: uploaded plant photos / avatars  ->  http://<server>:8000/uploads/...
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# API ROUTES
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Auth"]
)

app.include_router(
    plants_router,
    prefix="/api/plants",
    tags=["Plants"]
)

app.include_router(
    reminders_router,                                          # NEW
    prefix="/api/reminders",
    tags=["Reminders"]
)

app.include_router(
    ai_router,
    prefix="/api/ai",
    tags=["AI"]
)

app.include_router(
    rag_router,
    prefix="/api/rag",
    tags=["RAG"]
)


@app.get("/")
def root():
    return {
        "message": "PlantCare AI API is running",
        "docs": "/docs"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }
