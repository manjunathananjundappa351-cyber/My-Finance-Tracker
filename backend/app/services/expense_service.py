from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.expense import Expense, ExpenseCategory
from app.repositories import expense_repo, tag_repo
from app.utils.recurring import generate_due_recurring_expenses


def list_categories(db: Session, user_id: int) -> list[ExpenseCategory]:
    return expense_repo.list_categories(db, user_id)


def create_category(db: Session, user_id: int, name: str, expense_type: str) -> ExpenseCategory:
    return expense_repo.create_category(db, user_id, name, expense_type)


def list_expenses(
    db: Session,
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    include_archived: bool = False,
    archived_only: bool = False,
    tag_id: Optional[int] = None,
) -> list[Expense]:
    generate_due_recurring_expenses(db, user_id)
    return expense_repo.list_expenses(
        db, user_id, start_date, end_date, category_id, include_archived, archived_only, tag_id
    )


def create_expense(
    db: Session,
    user_id: int,
    category_id: int,
    amount: float,
    description: str,
    expense_date: date,
    is_recurring: bool = False,
    notes: str = "",
    tag_ids: Optional[list[int]] = None,
) -> Expense:
    category = expense_repo.get_category(db, user_id, category_id)
    if category is None:
        raise NotFoundError(detail="Expense category not found")

    tags = tag_repo.get_tags_by_ids(db, user_id, tag_ids or [])
    return expense_repo.create_expense(
        db,
        user_id,
        category_id,
        amount,
        description,
        expense_date,
        is_recurring=is_recurring,
        notes=notes,
        tags=tags,
    )


def get_expense_or_404(db: Session, user_id: int, expense_id: int) -> Expense:
    expense = expense_repo.get_expense(db, user_id, expense_id)
    if expense is None:
        raise NotFoundError(detail="Expense not found")
    return expense


def update_expense(
    db: Session,
    user_id: int,
    expense_id: int,
    category_id: Optional[int],
    amount: Optional[float],
    description: Optional[str],
    expense_date: Optional[date],
    is_recurring: Optional[bool] = None,
    notes: Optional[str] = None,
    tag_ids: Optional[list[int]] = None,
) -> Expense:
    expense = get_expense_or_404(db, user_id, expense_id)

    if category_id is not None and expense_repo.get_category(db, user_id, category_id) is None:
        raise NotFoundError(detail="Expense category not found")

    tags = tag_repo.get_tags_by_ids(db, user_id, tag_ids) if tag_ids is not None else None

    return expense_repo.update_expense(
        db,
        expense,
        category_id=category_id,
        amount=amount,
        description=description,
        expense_date=expense_date,
        is_recurring=is_recurring,
        notes=notes,
        tags=tags,
    )


def set_archived(db: Session, user_id: int, expense_id: int, archived: bool) -> Expense:
    expense = get_expense_or_404(db, user_id, expense_id)
    return expense_repo.set_archived(db, expense, archived)


def bulk_set_archived(db: Session, user_id: int, expense_ids: list[int], archived: bool) -> None:
    for expense_id in expense_ids:
        expense = expense_repo.get_expense(db, user_id, expense_id)
        if expense is not None:
            expense_repo.set_archived(db, expense, archived)


def bulk_delete(db: Session, user_id: int, expense_ids: list[int]) -> None:
    for expense_id in expense_ids:
        expense = expense_repo.get_expense(db, user_id, expense_id)
        if expense is not None:
            expense_repo.delete_expense(db, expense)


def delete_expense(db: Session, user_id: int, expense_id: int) -> None:
    expense = get_expense_or_404(db, user_id, expense_id)
    expense_repo.delete_expense(db, expense)
