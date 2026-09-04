from pydantic import BaseModel
from typing import Optional, List


class MonitorContext(BaseModel):
    url: Optional[str] = None
    status: Optional[str] = None
    statusCode: Optional[int] = None
    latencyMs: Optional[int] = None


class WebhookContext(BaseModel):
    signatureValid: Optional[bool] = None
    anomalyFlags: Optional[List[str]] = None
    body: Optional[dict] = None


class AnalyzeRequest(BaseModel):
    monitor: Optional[MonitorContext] = None
    webhookEvent: Optional[WebhookContext] = None


class AnalyzeResponse(BaseModel):
    summary: str
    probableCause: str
    steps: List[str]
    codeFix: Optional[str] = None