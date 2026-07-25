from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.goal import Goal
from app.repositories import expense_repo, goal_repo, income_repo
from app.schemas.goal import GoalOut, GoalTransactionItem, GoalTransactions
from app.services import audit_log_service


def _months_remaining(target_date: date) -> int:
    today = date.today()
    months = (target_date.year - today.year) * 12 + (target_date.month - today.month)
    if target_date.day < today.day:
        months -= 1
    return max(months, 0)


def to_goal_out(goal: Goal) -> GoalOut:
    progress_pct = (goal.current_amount / goal.target_amount * 100) if goal.target_amount else 0.0
    months_remaining = _months_remaining(goal.target_date)
    remaining_amount = max(goal.target_amount - goal.current_amount, 0)
    monthly_contribution_needed = (
        remaining_amount / months_remaining if months_remaining > 0 else remaining_amount
    )

    return GoalOut(
        id=goal.id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        notes=goal.notes,
        is_archived=goal.is_archived,
        progress_pct=progress_pct,
        months_remaining=months_remaining,
        monthly_contribution_needed=monthly_contribution_needed,
    )


def list_goals(
    db: Session, user_id: int, include_archived: bool = False, archived_only: bool = False
) -> list[GoalOut]:
    return [
        to_goal_out(g) for g in goal_repo.list_goals(db, user_id, include_archived, archived_only)
    ]


def create_goal(
    db: Session,
    user_id: int,
    name: str,
    target_amount: float,
    current_amount: float,
    target_date: date,
    notes: str = "",
) -> GoalOut:
    goal = goal_repo.create_goal(db, user_id, name, target_amount, current_amount, target_date)
    if notes:
        goal = goal_repo.update_goal(db, goal, notes=notes)
    audit_log_service.log(db, user_id, "create", "goal", goal.id, f"Added goal: {goal.name}")
    return to_goal_out(goal)


def get_goal_or_404(db: Session, user_id: int, goal_id: int) -> Goal:
    goal = goal_repo.get_goal(db, user_id, goal_id)
    if goal is None:
        raise NotFoundError(detail="Goal not found")
    return goal


def update_goal(
    db: Session,
    user_id: int,
    goal_id: int,
    name: Optional[str],
    target_amount: Optional[float],
    current_amount: Optional[float],
    target_date: Optional[date],
    notes: Optional[str] = None,
) -> GoalOut:
    goal = get_goal_or_404(db, user_id, goal_id)
    goal = goal_repo.update_goal(
        db,
        goal,
        name=name,
        target_amount=target_amount,
        current_amount=current_amount,
        target_date=target_date,
        notes=notes,
    )
    audit_log_service.log(db, user_id, "update", "goal", goal.id, f"Updated goal: {goal.name}")
    return to_goal_out(goal)


def set_archived(db: Session, user_id: int, goal_id: int, archived: bool) -> GoalOut:
    goal = get_goal_or_404(db, user_id, goal_id)
    goal = goal_repo.set_archived(db, goal, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "goal", goal.id,
        f"{'Archived' if archived else 'Restored'} goal: {goal.name}",
    )
    return to_goal_out(goal)


def delete_goal(db: Session, user_id: int, goal_id: int) -> None:
    goal = get_goal_or_404(db, user_id, goal_id)
    summary = f"Permanently deleted goal: {goal.name}"
    goal_repo.delete_goal(db, goal)
    audit_log_service.log(db, user_id, "delete", "goal", goal_id, summary)


def get_goal_transactions(db: Session, user_id: int, goal_id: int) -> GoalTransactions:
    get_goal_or_404(db, user_id, goal_id)
    expenses = expense_repo.list_by_goal(db, user_id, goal_id)
    income = income_repo.list_by_goal(db, user_id, goal_id)
    return GoalTransactions(
        expenses=[
            GoalTransactionItem(
                id=e.id, type="expense", amount=e.amount, description=e.description,
                category_name=e.category.name, txn_date=e.expense_date,
            )
            for e in expenses
        ],
        income=[
            GoalTransactionItem(
                id=i.id, type="income", amount=i.amount, description=i.description,
                category_name=i.category.name, txn_date=i.income_date,
            )
            for i in income
        ],
    )
