from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.trade_journal import TradeJournalEntry


def list_trades(db: Session, user_id: int) -> list[TradeJournalEntry]:
    stmt = (
        select(TradeJournalEntry)
        .where(TradeJournalEntry.user_id == user_id)
        .order_by(TradeJournalEntry.entry_date.desc())
    )
    return list(db.execute(stmt).scalars().all())


def get_trade(db: Session, user_id: int, trade_id: int) -> Optional[TradeJournalEntry]:
    stmt = select(TradeJournalEntry).where(
        TradeJournalEntry.id == trade_id, TradeJournalEntry.user_id == user_id
    )
    return db.execute(stmt).scalar_one_or_none()


def create_trade(db: Session, user_id: int, **fields) -> TradeJournalEntry:
    trade = TradeJournalEntry(user_id=user_id, **fields)
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade


def update_trade(db: Session, trade: TradeJournalEntry, **fields) -> TradeJournalEntry:
    for key, value in fields.items():
        if value is not None:
            setattr(trade, key, value)
    db.commit()
    db.refresh(trade)
    return trade


def delete_trade(db: Session, trade: TradeJournalEntry) -> None:
    db.delete(trade)
    db.commit()
