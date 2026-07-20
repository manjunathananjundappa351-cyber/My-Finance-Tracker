from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget


def list_budgets(db: Session, user_id: int) -> list[Budget]:
    stmt = (
        select(Budget)
        .options(joinedload(Budget.category))
        .where(Budget.user_id == user_id)
    )
    return list(db.execute(stmt).scalars().all())


def get_budget(db: Session, user_id: int, budget_id: int) -> Optional[Budget]:
    stmt = (
        select(Budget)
        .options(joinedload(Budget.category))
        .where(Budget.id == budget_id, Budget.user_id == user_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def get_budget_by_category(db: Session, user_id: int, category_id: int) -> Optional[Budget]:
    stmt = select(Budget).where(Budget.user_id == user_id, Budget.category_id == category_id)
    return db.execute(stmt).scalar_one_or_none()


def create_budget(db: Session, user_id: int, category_id: int, monthly_limit: float) -> Budget:
    budget = Budget(user_id=user_id, category_id=category_id, monthly_limit=monthly_limit)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def update_budget(db: Session, budget: Budget, monthly_limit: Optional[float]) -> Budget:
    if monthly_limit is not None:
        budget.monthly_limit = monthly_limit
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget: Budget) -> None:
    db.delete(budget)
    db.commit()
