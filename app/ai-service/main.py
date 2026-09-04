from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.analyzer import analyze

app = FastAPI(title="AI Diagnostics Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(request: AnalyzeRequest):
    return analyze(request)