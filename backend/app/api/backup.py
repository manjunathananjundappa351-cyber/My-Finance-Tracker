from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.backup import BackupData, RestoreSummary
from app.services import backup_service

router = APIRouter(prefix="/backup", tags=["backup"])


@router.get("/export", response_model=BackupData)
def export_backup(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return backup_service.export_data(db, current_user.id)


@router.post("/restore", response_model=RestoreSummary)
def restore_backup(
    payload: BackupData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return backup_service.restore_data(db, current_user.id, payload)
