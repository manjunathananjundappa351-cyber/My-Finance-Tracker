from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.health_score import FinancialHealthScore
from app.services import health_score_service

router = APIRouter(prefix="/health-score", tags=["health-score"])


@router.get("", response_model=FinancialHealthScore)
def get_health_score(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return health_score_service.compute_health_score(db, current_user.id)
