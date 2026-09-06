import os
import json
from google import genai
from google.genai import types
from app.schemas import AnalyzeRequest, AnalyzeResponse

MODEL_NAME = "gemini-3.6-flash"


def build_prompt(request: AnalyzeRequest) -> str:
    context = {
        "monitor": request.monitor.model_dump() if request.monitor else None,
        "webhookEvent": request.webhookEvent.model_dump() if request.webhookEvent else None,
    }

    return f"""You are an expert site reliability engineer diagnosing an API or webhook issue.

Context:
{json.dumps(context, indent=2)}

Respond ONLY with a JSON object with these exact keys:
- "summary": one plain-English sentence summarizing the issue
- "probableCause": a short paragraph explaining the likely root cause
- "steps": an array of 3-5 concrete, actionable steps to fix it
- "codeFix": a short code snippet demonstrating a fix, as a string, or null if not applicable

Do not include markdown formatting, code fences, or any text outside the JSON object."""


def analyze_with_llm(request: AnalyzeRequest) -> AnalyzeResponse:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(request)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    data = json.loads(response.text)
    return AnalyzeResponse(**data)