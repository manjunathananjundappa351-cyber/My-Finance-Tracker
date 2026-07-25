from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.expense import Expense, ExpenseCategory
from app.repositories import expense_repo, goal_repo, tag_repo
from app.services import audit_log_service
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


def _validate_goal(db: Session, user_id: int, goal_id: Optional[int]) -> None:
    if goal_id is not None and goal_repo.get_goal(db, user_id, goal_id) is None:
        raise NotFoundError(detail="Goal not found")


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
    goal_id: Optional[int] = None,
) -> Expense:
    category = expense_repo.get_category(db, user_id, category_id)
    if category is None:
        raise NotFoundError(detail="Expense category not found")
    _validate_goal(db, user_id, goal_id)

    tags = tag_repo.get_tags_by_ids(db, user_id, tag_ids or [])
    expense = expense_repo.create_expense(
        db,
        user_id,
        category_id,
        amount,
        description,
        expense_date,
        is_recurring=is_recurring,
        notes=notes,
        tags=tags,
        goal_id=goal_id,
    )
    audit_log_service.log(
        db, user_id, "create", "expense", expense.id,
        f"Added expense: {description or category.name} (₹{amount:g})",
    )
    return expense


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
    goal_id: Optional[int] = None,
    clear_goal: bool = False,
) -> Expense:
    expense = get_expense_or_404(db, user_id, expense_id)

    if category_id is not None and expense_repo.get_category(db, user_id, category_id) is None:
        raise NotFoundError(detail="Expense category not found")
    _validate_goal(db, user_id, goal_id)

    tags = tag_repo.get_tags_by_ids(db, user_id, tag_ids) if tag_ids is not None else None

    updated = expense_repo.update_expense(
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
    if clear_goal:
        updated = expense_repo.set_goal(db, updated, None)
    elif goal_id is not None:
        updated = expense_repo.set_goal(db, updated, goal_id)

    audit_log_service.log(
        db, user_id, "update", "expense", updated.id,
        f"Updated expense: {updated.description or updated.category.name}",
    )
    return updated


def set_archived(db: Session, user_id: int, expense_id: int, archived: bool) -> Expense:
    expense = get_expense_or_404(db, user_id, expense_id)
    updated = expense_repo.set_archived(db, expense, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "expense", updated.id,
        f"{'Archived' if archived else 'Restored'} expense: {updated.description or updated.category.name}",
    )
    return updated


def bulk_set_archived(db: Session, user_id: int, expense_ids: list[int], archived: bool) -> None:
    for expense_id in expense_ids:
        expense = expense_repo.get_expense(db, user_id, expense_id)
        if expense is not None:
            expense_repo.set_archived(db, expense, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "expense", 0,
        f"Bulk {'archived' if archived else 'restored'} {len(expense_ids)} expense(s)",
    )


def bulk_delete(db: Session, user_id: int, expense_ids: list[int]) -> None:
    for expense_id in expense_ids:
        expense = expense_repo.get_expense(db, user_id, expense_id)
        if expense is not None:
            expense_repo.delete_expense(db, expense)
    audit_log_service.log(
        db, user_id, "delete", "expense", 0, f"Bulk deleted {len(expense_ids)} expense(s)"
    )


def delete_expense(db: Session, user_id: int, expense_id: int) -> None:
    expense = get_expense_or_404(db, user_id, expense_id)
    summary = f"Permanently deleted expense: {expense.description or expense.category.name}"
    expense_repo.delete_expense(db, expense)
    audit_log_service.log(db, user_id, "delete", "expense", expense_id, summary)


def bulk_import(
    db: Session, user_id: int, items: list[dict]
) -> tuple[int, int, list[str]]:
    """Create many expenses from parsed CSV rows. Rows referencing an unknown
    category are skipped and reported rather than failing the whole import."""
    imported = 0
    errors: list[str] = []
    categories = {c.name.lower(): c for c in expense_repo.list_categories(db, user_id)}

    for i, item in enumerate(items, start=1):
        category = categories.get(item["category_name"].strip().lower())
        if category is None:
            errors.append(f"Row {i}: category '{item['category_name']}' not found - skipped")
            continue
        expense = expense_repo.create_expense(
            db,
            user_id,
            category.id,
            item["amount"],
            item.get("description", ""),
            item["expense_date"],
        )
        audit_log_service.log(
            db, user_id, "create", "expense", expense.id,
            f"Imported expense: {expense.description or category.name} (₹{expense.amount:g})",
        )
        imported += 1

    return imported, len(items) - imported, errors
