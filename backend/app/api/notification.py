from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationOut
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return notification_service.list_notifications(db, current_user.id)


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.mark_read(db, current_user.id, notification_id)


@router.post("/read-all", status_code=204)
def mark_all_read(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    notification_service.mark_all_read(db, current_user.id)
