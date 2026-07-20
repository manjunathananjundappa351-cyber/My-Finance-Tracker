from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.budget import Budget
from app.repositories import budget_repo, expense_repo
from app.schemas.budget import BudgetOut


def _spent_this_month(db: Session, user_id: int, category_id: int) -> float:
    month_start = date.today().replace(day=1)
    expenses = expense_repo.list_expenses(
        db, user_id, start_date=month_start, category_id=category_id
    )
    return sum(e.amount for e in expenses)


def to_budget_out(db: Session, budget: Budget) -> BudgetOut:
    spent = _spent_this_month(db, budget.user_id, budget.category_id)
    remaining = budget.monthly_limit - spent
    percent_used = (spent / budget.monthly_limit * 100) if budget.monthly_limit else 0.0

    return BudgetOut(
        id=budget.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        spent=spent,
        remaining=remaining,
        percent_used=percent_used,
    )


def list_budgets(db: Session, user_id: int) -> list[BudgetOut]:
    return [to_budget_out(db, b) for b in budget_repo.list_budgets(db, user_id)]


def create_budget(db: Session, user_id: int, category_id: int, monthly_limit: float) -> BudgetOut:
    if expense_repo.get_category(db, user_id, category_id) is None:
        raise NotFoundError(detail="Expense category not found")
    if budget_repo.get_budget_by_category(db, user_id, category_id) is not None:
        raise ConflictError(detail="A budget already exists for this category")

    budget = budget_repo.create_budget(db, user_id, category_id, monthly_limit)
    return to_budget_out(db, budget)


def get_budget_or_404(db: Session, user_id: int, budget_id: int) -> Budget:
    budget = budget_repo.get_budget(db, user_id, budget_id)
    if budget is None:
        raise NotFoundError(detail="Budget not found")
    return budget


def update_budget(
    db: Session, user_id: int, budget_id: int, monthly_limit: Optional[float]
) -> BudgetOut:
    budget = get_budget_or_404(db, user_id, budget_id)
    budget = budget_repo.update_budget(db, budget, monthly_limit)
    return to_budget_out(db, budget)


def delete_budget(db: Session, user_id: int, budget_id: int) -> None:
    budget = get_budget_or_404(db, user_id, budget_id)
    budget_repo.delete_budget(db, budget)
