from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.net_worth import NetWorthTimeline
from app.services import net_worth_service

router = APIRouter(prefix="/networth", tags=["net-worth"])


@router.get("/timeline", response_model=NetWorthTimeline)
def get_timeline(
    days: int = 180,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return net_worth_service.get_timeline(db, current_user.id, days)
