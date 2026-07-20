from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.income import Income, IncomeCategory
from app.models.tag import Tag


def list_categories(db: Session, user_id: int) -> list[IncomeCategory]:
    stmt = select(IncomeCategory).where(IncomeCategory.user_id == user_id).order_by(
        IncomeCategory.name
    )
    return list(db.execute(stmt).scalars().all())


def get_category(db: Session, user_id: int, category_id: int) -> Optional[IncomeCategory]:
    stmt = select(IncomeCategory).where(
        IncomeCategory.id == category_id, IncomeCategory.user_id == user_id
    )
    return db.execute(stmt).scalar_one_or_none()


def create_category(db: Session, user_id: int, name: str) -> IncomeCategory:
    category = IncomeCategory(user_id=user_id, name=name, is_default=False)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


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
    stmt = (
        select(Income)
        .options(joinedload(Income.category), joinedload(Income.tags))
        .where(Income.user_id == user_id)
    )
    if archived_only:
        stmt = stmt.where(Income.is_archived.is_(True))
    elif not include_archived:
        stmt = stmt.where(Income.is_archived.is_(False))
    if start_date is not None:
        stmt = stmt.where(Income.income_date >= start_date)
    if end_date is not None:
        stmt = stmt.where(Income.income_date <= end_date)
    if category_id is not None:
        stmt = stmt.where(Income.category_id == category_id)
    if tag_id is not None:
        stmt = stmt.where(Income.tags.any(Tag.id == tag_id))
    stmt = stmt.order_by(Income.income_date.desc())
    return list(db.execute(stmt).unique().scalars().all())


def get_income(db: Session, user_id: int, income_id: int) -> Optional[Income]:
    stmt = (
        select(Income)
        .options(joinedload(Income.category), joinedload(Income.tags))
        .where(Income.id == income_id, Income.user_id == user_id)
    )
    return db.execute(stmt).unique().scalar_one_or_none()


def create_income(
    db: Session,
    user_id: int,
    category_id: int,
    amount: float,
    description: str,
    income_date: date,
    is_recurring: bool = False,
    recurring_parent_id: Optional[int] = None,
    notes: str = "",
    tags: Optional[list[Tag]] = None,
) -> Income:
    income = Income(
        user_id=user_id,
        category_id=category_id,
        amount=amount,
        description=description,
        notes=notes,
        income_date=income_date,
        is_recurring=is_recurring,
        recurring_parent_id=recurring_parent_id,
        tags=tags or [],
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


def list_recurring_templates(db: Session, user_id: int) -> list[Income]:
    stmt = select(Income).where(
        Income.user_id == user_id,
        Income.is_recurring.is_(True),
        Income.recurring_parent_id.is_(None),
    )
    return list(db.execute(stmt).scalars().all())


def recurring_child_exists(db: Session, parent_id: int, year: int, month: int) -> bool:
    stmt = select(Income.id).where(
        Income.recurring_parent_id == parent_id,
        Income.income_date >= date(year, month, 1),
        Income.income_date
        < (date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)),
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def update_income(db: Session, income: Income, **fields) -> Income:
    for key, value in fields.items():
        if value is not None:
            setattr(income, key, value)
    db.commit()
    db.refresh(income)
    return income


def set_archived(db: Session, income: Income, archived: bool) -> Income:
    income.is_archived = archived
    db.commit()
    db.refresh(income)
    return income


def delete_income(db: Session, income: Income) -> None:
    db.delete(income)
    db.commit()
