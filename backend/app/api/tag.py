from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.tag import TagCreate, TagOut
from app.services import tag_service

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
def list_tags(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return tag_service.list_tags(db, current_user.id)


@router.post("", response_model=TagOut, status_code=201)
def create_tag(
    payload: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return tag_service.create_tag(db, current_user.id, payload.name, payload.color)


@router.delete("/{tag_id}", status_code=204)
def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tag_service.delete_tag(db, current_user.id, tag_id)
