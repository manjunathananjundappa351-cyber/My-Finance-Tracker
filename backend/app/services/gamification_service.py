from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.repositories import budget_repo, expense_repo
from app.schemas.gamification import GamificationStats
from app.services.budget_service import to_budget_out

LOOKBACK_DAYS = 90


def _no_spend_streak_days(db: Session, user_id: int) -> int:
    today = date.today()
    start = today - timedelta(days=LOOKBACK_DAYS)
    expenses = expense_repo.list_expenses(db, user_id, start_date=start)
    spend_dates = {e.expense_date for e in expenses if e.amount > 0}

    streak = 0
    cursor = today
    while cursor >= start:
        if cursor in spend_dates:
            break
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def get_gamification_stats(db: Session, user_id: int) -> GamificationStats:
    budgets = [to_budget_out(db, b) for b in budget_repo.list_budgets(db, user_id)]
    budget_champion = bool(budgets) and all(b.percent_used <= 100 for b in budgets)

    return GamificationStats(
        no_spend_streak_days=_no_spend_streak_days(db, user_id),
        budget_champion=budget_champion,
        active_budget_count=len(budgets),
    )
