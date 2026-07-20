from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.expense import Expense, ExpenseCategory
from app.models.tag import Tag


def list_categories(db: Session, user_id: int) -> list[ExpenseCategory]:
    stmt = select(ExpenseCategory).where(ExpenseCategory.user_id == user_id).order_by(
        ExpenseCategory.name
    )
    return list(db.execute(stmt).scalars().all())


def get_category(db: Session, user_id: int, category_id: int) -> Optional[ExpenseCategory]:
    stmt = select(ExpenseCategory).where(
        ExpenseCategory.id == category_id, ExpenseCategory.user_id == user_id
    )
    return db.execute(stmt).scalar_one_or_none()


def create_category(db: Session, user_id: int, name: str, expense_type: str) -> ExpenseCategory:
    category = ExpenseCategory(user_id=user_id, name=name, type=expense_type, is_default=False)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


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
    stmt = (
        select(Expense)
        .options(joinedload(Expense.category), joinedload(Expense.tags))
        .where(Expense.user_id == user_id)
    )
    if archived_only:
        stmt = stmt.where(Expense.is_archived.is_(True))
    elif not include_archived:
        stmt = stmt.where(Expense.is_archived.is_(False))
    if start_date is not None:
        stmt = stmt.where(Expense.expense_date >= start_date)
    if end_date is not None:
        stmt = stmt.where(Expense.expense_date <= end_date)
    if category_id is not None:
        stmt = stmt.where(Expense.category_id == category_id)
    if tag_id is not None:
        stmt = stmt.where(Expense.tags.any(Tag.id == tag_id))
    stmt = stmt.order_by(Expense.expense_date.desc())
    return list(db.execute(stmt).unique().scalars().all())


def get_expense(db: Session, user_id: int, expense_id: int) -> Optional[Expense]:
    stmt = (
        select(Expense)
        .options(joinedload(Expense.category), joinedload(Expense.tags))
        .where(Expense.id == expense_id, Expense.user_id == user_id)
    )
    return db.execute(stmt).unique().scalar_one_or_none()


def create_expense(
    db: Session,
    user_id: int,
    category_id: int,
    amount: float,
    description: str,
    expense_date: date,
    is_recurring: bool = False,
    recurring_parent_id: Optional[int] = None,
    notes: str = "",
    tags: Optional[list[Tag]] = None,
) -> Expense:
    expense = Expense(
        user_id=user_id,
        category_id=category_id,
        amount=amount,
        description=description,
        notes=notes,
        expense_date=expense_date,
        is_recurring=is_recurring,
        recurring_parent_id=recurring_parent_id,
        tags=tags or [],
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def list_recurring_templates(db: Session, user_id: int) -> list[Expense]:
    stmt = select(Expense).where(
        Expense.user_id == user_id,
        Expense.is_recurring.is_(True),
        Expense.recurring_parent_id.is_(None),
    )
    return list(db.execute(stmt).scalars().all())


def recurring_child_exists(db: Session, parent_id: int, year: int, month: int) -> bool:
    stmt = select(Expense.id).where(
        Expense.recurring_parent_id == parent_id,
        Expense.expense_date >= date(year, month, 1),
        Expense.expense_date
        < (date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)),
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def update_expense(db: Session, expense: Expense, **fields) -> Expense:
    for key, value in fields.items():
        if value is not None:
            setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


def set_archived(db: Session, expense: Expense, archived: bool) -> Expense:
    expense.is_archived = archived
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense: Expense) -> None:
    db.delete(expense)
    db.commit()
