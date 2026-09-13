from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.plants import router as plants_router
from routes.ai import router as ai_router
from routes.rag import router as rag_router


app = FastAPI(
    title="PlantCare AI API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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