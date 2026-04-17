from fastapi import FastAPI
from routers import analyze

app = FastAPI(title="NAGARIK ML Service")
app.include_router(analyze.router, prefix="/analyze")

@app.get("/health")
def health():
    return {"status": "ok"}