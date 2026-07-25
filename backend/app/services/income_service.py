from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.income import Income, IncomeCategory
from app.repositories import goal_repo, income_repo, tag_repo
from app.services import audit_log_service
from app.utils.recurring import generate_due_recurring_income


def list_categories(db: Session, user_id: int) -> list[IncomeCategory]:
    return income_repo.list_categories(db, user_id)


def create_category(db: Session, user_id: int, name: str) -> IncomeCategory:
    return income_repo.create_category(db, user_id, name)


def list_income(
    db: Session,
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    include_archived: bool = False,
    archived_only: bool = False,
    tag_id: Optional[int] = None,
) -> list[Income]:
    generate_due_recurring_income(db, user_id)
    return income_repo.list_income(
        db, user_id, start_date, end_date, category_id, include_archived, archived_only, tag_id
    )


def _validate_goal(db: Session, user_id: int, goal_id: Optional[int]) -> None:
    if goal_id is not None and goal_repo.get_goal(db, user_id, goal_id) is None:
        raise NotFoundError(detail="Goal not found")


def create_income(
    db: Session,
    user_id: int,
    category_id: int,
    amount: float,
    description: str,
    income_date: date,
    is_recurring: bool = False,
    notes: str = "",
    tag_ids: Optional[list[int]] = None,
    goal_id: Optional[int] = None,
) -> Income:
    category = income_repo.get_category(db, user_id, category_id)
    if category is None:
        raise NotFoundError(detail="Income category not found")
    _validate_goal(db, user_id, goal_id)

    tags = tag_repo.get_tags_by_ids(db, user_id, tag_ids or [])
    income = income_repo.create_income(
        db,
        user_id,
        category_id,
        amount,
        description,
        income_date,
        is_recurring=is_recurring,
        notes=notes,
        tags=tags,
        goal_id=goal_id,
    )
    audit_log_service.log(
        db, user_id, "create", "income", income.id,
        f"Added income: {description or category.name} (₹{amount:g})",
    )
    return income


def get_income_or_404(db: Session, user_id: int, income_id: int) -> Income:
    income = income_repo.get_income(db, user_id, income_id)
    if income is None:
        raise NotFoundError(detail="Income not found")
    return income


def update_income(
    db: Session,
    user_id: int,
    income_id: int,
    category_id: Optional[int],
    amount: Optional[float],
    description: Optional[str],
    income_date: Optional[date],
    is_recurring: Optional[bool] = None,
    notes: Optional[str] = None,
    tag_ids: Optional[list[int]] = None,
    goal_id: Optional[int] = None,
    clear_goal: bool = False,
) -> Income:
    income = get_income_or_404(db, user_id, income_id)

    if category_id is not None and income_repo.get_category(db, user_id, category_id) is None:
        raise NotFoundError(detail="Income category not found")
    _validate_goal(db, user_id, goal_id)

    tags = tag_repo.get_tags_by_ids(db, user_id, tag_ids) if tag_ids is not None else None

    updated = income_repo.update_income(
        db,
        income,
        category_id=category_id,
        amount=amount,
        description=description,
        income_date=income_date,
        is_recurring=is_recurring,
        notes=notes,
        tags=tags,
    )
    if clear_goal:
        updated = income_repo.set_goal(db, updated, None)
    elif goal_id is not None:
        updated = income_repo.set_goal(db, updated, goal_id)

    audit_log_service.log(
        db, user_id, "update", "income", updated.id,
        f"Updated income: {updated.description or updated.category.name}",
    )
    return updated


def set_archived(db: Session, user_id: int, income_id: int, archived: bool) -> Income:
    income = get_income_or_404(db, user_id, income_id)
    updated = income_repo.set_archived(db, income, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "income", updated.id,
        f"{'Archived' if archived else 'Restored'} income: {updated.description or updated.category.name}",
    )
    return updated


def bulk_set_archived(db: Session, user_id: int, income_ids: list[int], archived: bool) -> None:
    for income_id in income_ids:
        income = income_repo.get_income(db, user_id, income_id)
        if income is not None:
            income_repo.set_archived(db, income, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "income", 0,
        f"Bulk {'archived' if archived else 'restored'} {len(income_ids)} income entr{'y' if len(income_ids) == 1 else 'ies'}",
    )


def bulk_delete(db: Session, user_id: int, income_ids: list[int]) -> None:
    for income_id in income_ids:
        income = income_repo.get_income(db, user_id, income_id)
        if income is not None:
            income_repo.delete_income(db, income)
    audit_log_service.log(
        db, user_id, "delete", "income", 0, f"Bulk deleted {len(income_ids)} income entr(ies)"
    )


def delete_income(db: Session, user_id: int, income_id: int) -> None:
    income = get_income_or_404(db, user_id, income_id)
    summary = f"Permanently deleted income: {income.description or income.category.name}"
    income_repo.delete_income(db, income)
    audit_log_service.log(db, user_id, "delete", "income", income_id, summary)
