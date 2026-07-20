from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.tag import Tag
from app.repositories import tag_repo


def list_tags(db: Session, user_id: int) -> list[Tag]:
    return tag_repo.list_tags(db, user_id)


def create_tag(db: Session, user_id: int, name: str, color: str) -> Tag:
    existing = [t for t in tag_repo.list_tags(db, user_id) if t.name.lower() == name.lower()]
    if existing:
        raise ConflictError(detail="A tag with this name already exists")
    return tag_repo.create_tag(db, user_id, name, color)


def delete_tag(db: Session, user_id: int, tag_id: int) -> None:
    tag = tag_repo.get_tag(db, user_id, tag_id)
    if tag is None:
        raise NotFoundError(detail="Tag not found")
    tag_repo.delete_tag(db, tag)
