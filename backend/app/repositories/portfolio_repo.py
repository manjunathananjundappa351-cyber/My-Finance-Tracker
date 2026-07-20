from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.portfolio import PortfolioHolding


def list_holdings(
    db: Session, user_id: int, include_archived: bool = False, archived_only: bool = False
) -> list[PortfolioHolding]:
    stmt = select(PortfolioHolding).where(PortfolioHolding.user_id == user_id)
    if archived_only:
        stmt = stmt.where(PortfolioHolding.is_archived.is_(True))
    elif not include_archived:
        stmt = stmt.where(PortfolioHolding.is_archived.is_(False))
    stmt = stmt.order_by(PortfolioHolding.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def get_holding(db: Session, user_id: int, holding_id: int) -> Optional[PortfolioHolding]:
    stmt = select(PortfolioHolding).where(
        PortfolioHolding.id == holding_id, PortfolioHolding.user_id == user_id
    )
    return db.execute(stmt).scalar_one_or_none()


def create_holding(db: Session, user_id: int, **fields) -> PortfolioHolding:
    holding = PortfolioHolding(user_id=user_id, **fields)
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


def update_holding(db: Session, holding: PortfolioHolding, **fields) -> PortfolioHolding:
    for key, value in fields.items():
        if value is not None:
            setattr(holding, key, value)
    db.commit()
    db.refresh(holding)
    return holding


def set_archived(db: Session, holding: PortfolioHolding, archived: bool) -> PortfolioHolding:
    holding.is_archived = archived
    db.commit()
    db.refresh(holding)
    return holding


def delete_holding(db: Session, holding: PortfolioHolding) -> None:
    db.delete(holding)
    db.commit()
