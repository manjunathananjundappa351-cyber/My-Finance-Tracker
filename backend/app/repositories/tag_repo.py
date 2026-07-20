from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tag import Tag


def list_tags(db: Session, user_id: int) -> list[Tag]:
    stmt = select(Tag).where(Tag.user_id == user_id).order_by(Tag.name)
    return list(db.execute(stmt).scalars().all())


def get_tag(db: Session, user_id: int, tag_id: int) -> Optional[Tag]:
    stmt = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def get_tags_by_ids(db: Session, user_id: int, tag_ids: list[int]) -> list[Tag]:
    if not tag_ids:
        return []
    stmt = select(Tag).where(Tag.user_id == user_id, Tag.id.in_(tag_ids))
    return list(db.execute(stmt).scalars().all())


def create_tag(db: Session, user_id: int, name: str, color: str) -> Tag:
    tag = Tag(user_id=user_id, name=name, color=color)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag: Tag) -> None:
    db.delete(tag)
    db.commit()
