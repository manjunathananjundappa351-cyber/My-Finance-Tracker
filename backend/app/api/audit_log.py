from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.audit_log import AuditLogOut
from app.services import audit_log_service

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=list[AuditLogOut])
def list_activity(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audit_log_service.list_activity(db, current_user.id, limit)
