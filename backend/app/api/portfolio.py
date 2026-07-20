from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioHoldingCreate,
    PortfolioHoldingOut,
    PortfolioHoldingUpdate,
)
from app.services import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/holdings", response_model=list[PortfolioHoldingOut])
def list_holdings(
    include_archived: bool = False,
    archived_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holdings = portfolio_service.list_holdings(db, current_user.id, include_archived, archived_only)
    return [portfolio_service.to_holding_out(h) for h in holdings]


@router.post("/holdings", response_model=PortfolioHoldingOut, status_code=201)
def create_holding(
    payload: PortfolioHoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holding = portfolio_service.create_holding(db, current_user.id, **payload.model_dump())
    return portfolio_service.to_holding_out(holding)


@router.get("/holdings/{holding_id}", response_model=PortfolioHoldingOut)
def get_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holding = portfolio_service.get_holding_or_404(db, current_user.id, holding_id)
    return portfolio_service.to_holding_out(holding)


@router.put("/holdings/{holding_id}", response_model=PortfolioHoldingOut)
def update_holding(
    holding_id: int,
    payload: PortfolioHoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holding = portfolio_service.update_holding(
        db, current_user.id, holding_id, **payload.model_dump(exclude_unset=True)
    )
    return portfolio_service.to_holding_out(holding)


@router.post("/holdings/{holding_id}/archive", response_model=PortfolioHoldingOut)
def archive_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holding = portfolio_service.set_archived(db, current_user.id, holding_id, True)
    return portfolio_service.to_holding_out(holding)


@router.post("/holdings/{holding_id}/restore", response_model=PortfolioHoldingOut)
def restore_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    holding = portfolio_service.set_archived(db, current_user.id, holding_id, False)
    return portfolio_service.to_holding_out(holding)


@router.delete("/holdings/{holding_id}", status_code=204)
def delete_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio_service.delete_holding(db, current_user.id, holding_id)
