from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification


def list_notifications(db: Session, user_id: int) -> list[Notification]:
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def exists_by_source_key(db: Session, user_id: int, source_key: str) -> bool:
    stmt = select(Notification.id).where(
        Notification.user_id == user_id, Notification.source_key == source_key
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def create_notification(
    db: Session, user_id: int, message: str, level: str, source_key: str
) -> Notification:
    notification = Notification(
        user_id=user_id, message=message, level=level, source_key=source_key
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notification(db: Session, user_id: int, notification_id: int) -> Optional[Notification]:
    stmt = select(Notification).where(
        Notification.id == notification_id, Notification.user_id == user_id
    )
    return db.execute(stmt).scalar_one_or_none()


def mark_read(db: Session, notification: Notification) -> Notification:
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_read(db: Session, user_id: int) -> None:
    for notification in list_notifications(db, user_id):
        notification.is_read = True
    db.commit()
