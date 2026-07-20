from pydantic import BaseModel


class GamificationStats(BaseModel):
    no_spend_streak_days: int
    budget_champion: bool
    active_budget_count: int
