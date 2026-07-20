from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.gamification import GamificationStats
from app.services import gamification_service

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("", response_model=GamificationStats)
def get_gamification_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return gamification_service.get_gamification_stats(db, current_user.id)
