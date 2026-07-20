from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.trade_journal import TradeAnalytics, TradeCreate, TradeOut, TradeUpdate
from app.services import trade_journal_service

router = APIRouter(prefix="/trades", tags=["trade-journal"])


@router.get("", response_model=list[TradeOut])
def list_trades(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        trade_journal_service.to_trade_out(t)
        for t in trade_journal_service.list_trades(db, current_user.id)
    ]


@router.get("/analytics", response_model=TradeAnalytics)
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return trade_journal_service.get_analytics(db, current_user.id)


@router.post("", response_model=TradeOut, status_code=201)
def create_trade(
    payload: TradeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = trade_journal_service.create_trade(db, current_user.id, **payload.model_dump())
    return trade_journal_service.to_trade_out(trade)


@router.put("/{trade_id}", response_model=TradeOut)
def update_trade(
    trade_id: int,
    payload: TradeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = trade_journal_service.update_trade(
        db, current_user.id, trade_id, **payload.model_dump(exclude_unset=True)
    )
    return trade_journal_service.to_trade_out(trade)


@router.delete("/{trade_id}", status_code=204)
def delete_trade(
    trade_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade_journal_service.delete_trade(db, current_user.id, trade_id)
