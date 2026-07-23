from datetime import datetime
from statistics import mean
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Dynamic Pricing Engine", version="1.0.0")


class PricingRequest(BaseModel):
    productId: int
    basePrice: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    demandScore: float = Field(..., ge=0.0, le=1.0)
    competitorPrices: List[float] = Field(default_factory=list)
    timestamp: datetime


class PricingResponse(BaseModel):
    productId: int
    recommendedPrice: float
    confidence: float
    modelVersion: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "pricing-engine"}


@app.post("/api/pricing/recommend", response_model=PricingResponse)
def recommend_price(payload: PricingRequest) -> PricingResponse:
    price = payload.basePrice

    demand_adjustment = 1 + ((payload.demandScore - 0.5) * 0.30)
    price *= demand_adjustment

    if payload.stock < 5:
        price *= 1.10
    elif payload.stock > 30:
        price *= 0.95

    if payload.competitorPrices:
        competitor_avg = mean(payload.competitorPrices)
        blended_target = (price * 0.7) + (competitor_avg * 0.3)
        price = blended_target

    price = round(max(price, payload.basePrice * 0.6), 2)

    confidence = 0.75
    if not payload.competitorPrices:
        confidence -= 0.1
    if payload.stock == 0:
        confidence -= 0.15

    return PricingResponse(
        productId=payload.productId,
        recommendedPrice=price,
        confidence=round(max(0.35, confidence), 2),
        modelVersion="pricing-heuristic-v1",
    )
