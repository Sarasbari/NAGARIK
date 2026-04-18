from dotenv import load_dotenv
load_dotenv()  # load GEMINI_API_KEY from .env before any imports that need it

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze

app = FastAPI(title="NAGARIK ML Service")

# Allow Next.js dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze")

@app.get("/health")
def health():
    return {"status": "ok"}