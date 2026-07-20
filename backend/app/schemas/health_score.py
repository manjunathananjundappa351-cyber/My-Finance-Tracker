from pydantic import BaseModel


class HealthScoreComponent(BaseModel):
    label: str
    score: float
    rating: str


class FinancialHealthScore(BaseModel):
    overall_score: float
    overall_rating: str
    components: list[HealthScoreComponent]
