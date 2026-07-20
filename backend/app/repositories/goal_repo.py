from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import Goal


def list_goals(
    db: Session, user_id: int, include_archived: bool = False, archived_only: bool = False
) -> list[Goal]:
    stmt = select(Goal).where(Goal.user_id == user_id)
    if archived_only:
        stmt = stmt.where(Goal.is_archived.is_(True))
    elif not include_archived:
        stmt = stmt.where(Goal.is_archived.is_(False))
    stmt = stmt.order_by(Goal.target_date)
    return list(db.execute(stmt).scalars().all())


def get_goal(db: Session, user_id: int, goal_id: int) -> Optional[Goal]:
    stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def create_goal(
    db: Session,
    user_id: int,
    name: str,
    target_amount: float,
    current_amount: float,
    target_date: date,
) -> Goal:
    goal = Goal(
        user_id=user_id,
        name=name,
        target_amount=target_amount,
        current_amount=current_amount,
        target_date=target_date,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_goal(db: Session, goal: Goal, **fields) -> Goal:
    for key, value in fields.items():
        if value is not None:
            setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return goal


def set_archived(db: Session, goal: Goal, archived: bool) -> Goal:
    goal.is_archived = archived
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal: Goal) -> None:
    db.delete(goal)
    db.commit()
