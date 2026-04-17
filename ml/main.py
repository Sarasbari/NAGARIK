from dotenv import load_dotenv
load_dotenv()  # load GEMINI_API_KEY from .env before any imports that need it

from fastapi import FastAPI
from routers import analyze

app = FastAPI(title="NAGARIK ML Service")
app.include_router(analyze.router, prefix="/analyze")

@app.get("/health")
def health():
    return {"status": "ok"}