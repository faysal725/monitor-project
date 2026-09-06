from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.analyzer import analyze as analyze_rule_based
from app.llm_analyzer import analyze_with_llm

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
    try:
        return analyze_with_llm(request)
    except Exception as e:
        print(f"LLM analysis failed, falling back to rule-based: {e}")
        return analyze_rule_based(request)