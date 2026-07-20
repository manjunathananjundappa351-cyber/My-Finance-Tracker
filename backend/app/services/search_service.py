from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.expense import Expense
from app.models.goal import Goal
from app.models.income import Income
from app.models.portfolio import PortfolioHolding
from app.schemas.search import SearchResult

RESULTS_PER_TYPE = 5


def global_search(db: Session, user_id: int, query: str) -> list[SearchResult]:
    if not query or len(query.strip()) < 2:
        return []

    like = f"%{query.strip()}%"
    results: list[SearchResult] = []

    expenses = db.execute(
        select(Expense)
        .options(joinedload(Expense.category))
        .where(
            Expense.user_id == user_id,
            Expense.is_archived.is_(False),
            Expense.description.ilike(like),
        )
        .limit(RESULTS_PER_TYPE)
    ).scalars().all()
    for e in expenses:
        results.append(
            SearchResult(
                type="expense",
                id=e.id,
                title=e.description or e.category.name,
                subtitle=f"Expense - {e.category.name} - {e.expense_date}",
                path="/expenses",
            )
        )

    income_entries = db.execute(
        select(Income)
        .options(joinedload(Income.category))
        .where(
            Income.user_id == user_id,
            Income.is_archived.is_(False),
            Income.description.ilike(like),
        )
        .limit(RESULTS_PER_TYPE)
    ).scalars().all()
    for i in income_entries:
        results.append(
            SearchResult(
                type="income",
                id=i.id,
                title=i.description or i.category.name,
                subtitle=f"Income - {i.category.name} - {i.income_date}",
                path="/income",
            )
        )

    holdings = db.execute(
        select(PortfolioHolding)
        .where(
            PortfolioHolding.user_id == user_id,
            PortfolioHolding.is_archived.is_(False),
            (PortfolioHolding.symbol.ilike(like) | PortfolioHolding.name.ilike(like)),
        )
        .limit(RESULTS_PER_TYPE)
    ).scalars().all()
    for h in holdings:
        results.append(
            SearchResult(
                type="portfolio",
                id=h.id,
                title=h.symbol,
                subtitle=f"Portfolio - {h.asset_type} - {h.name}" if h.name else "Portfolio holding",
                path="/portfolio",
            )
        )

    goals = db.execute(
        select(Goal)
        .where(Goal.user_id == user_id, Goal.is_archived.is_(False), Goal.name.ilike(like))
        .limit(RESULTS_PER_TYPE)
    ).scalars().all()
    for g in goals:
        results.append(
            SearchResult(type="goal", id=g.id, title=g.name, subtitle="Goal", path="/goals")
        )

    return results
