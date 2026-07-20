from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.system import ApplicationHealth
from app.services import system_service

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health", response_model=ApplicationHealth)
def get_health(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return system_service.get_application_health(db)
