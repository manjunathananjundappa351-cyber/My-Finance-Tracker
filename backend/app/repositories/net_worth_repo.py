from datetime import date, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.net_worth_snapshot import NetWorthSnapshot


def get_snapshot(db: Session, user_id: int, snapshot_date: date) -> Optional[NetWorthSnapshot]:
    stmt = select(NetWorthSnapshot).where(
        NetWorthSnapshot.user_id == user_id, NetWorthSnapshot.snapshot_date == snapshot_date
    )
    return db.execute(stmt).scalar_one_or_none()


def upsert_today_snapshot(db: Session, user_id: int, net_worth: float) -> NetWorthSnapshot:
    today = date.today()
    existing = get_snapshot(db, user_id, today)
    if existing is not None:
        existing.net_worth = net_worth
        db.commit()
        db.refresh(existing)
        return existing

    snapshot = NetWorthSnapshot(user_id=user_id, snapshot_date=today, net_worth=net_worth)
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def list_timeline(db: Session, user_id: int, days: int) -> list[NetWorthSnapshot]:
    start = date.today() - timedelta(days=days)
    stmt = (
        select(NetWorthSnapshot)
        .where(NetWorthSnapshot.user_id == user_id, NetWorthSnapshot.snapshot_date >= start)
        .order_by(NetWorthSnapshot.snapshot_date)
    )
    return list(db.execute(stmt).scalars().all())
