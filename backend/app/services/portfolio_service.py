from datetime import date
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.portfolio import PortfolioHolding
from app.repositories import portfolio_repo
from app.schemas.portfolio import PortfolioHoldingOut


def _compute_cagr_pct(invested_value: float, current_value: float, buy_date: date) -> Optional[float]:
    years = (date.today() - buy_date).days / 365.25
    if years <= 0 or invested_value <= 0:
        return None
    return ((current_value / invested_value) ** (1 / years) - 1) * 100


def to_holding_out(holding: PortfolioHolding) -> PortfolioHoldingOut:
    invested_value = holding.quantity * holding.buy_price
    current_value = holding.quantity * holding.current_price
    profit_loss = current_value - invested_value
    profit_loss_pct = (profit_loss / invested_value * 100) if invested_value else 0.0
    cagr_pct = _compute_cagr_pct(invested_value, current_value, holding.buy_date)

    return PortfolioHoldingOut(
        id=holding.id,
        symbol=holding.symbol,
        name=holding.name,
        asset_type=holding.asset_type,
        quantity=holding.quantity,
        buy_price=holding.buy_price,
        buy_date=holding.buy_date,
        current_price=holding.current_price,
        broker=holding.broker,
        sector=holding.sector,
        exchange=holding.exchange,
        target_price=holding.target_price,
        stop_loss=holding.stop_loss,
        notes=holding.notes,
        is_archived=holding.is_archived,
        invested_value=invested_value,
        current_value=current_value,
        profit_loss=profit_loss,
        profit_loss_pct=profit_loss_pct,
        cagr_pct=cagr_pct,
    )


def list_holdings(
    db: Session, user_id: int, include_archived: bool = False, archived_only: bool = False
) -> list[PortfolioHolding]:
    return portfolio_repo.list_holdings(db, user_id, include_archived, archived_only)


def create_holding(db: Session, user_id: int, **fields: Any) -> PortfolioHolding:
    return portfolio_repo.create_holding(db, user_id, **fields)


def get_holding_or_404(db: Session, user_id: int, holding_id: int) -> PortfolioHolding:
    holding = portfolio_repo.get_holding(db, user_id, holding_id)
    if holding is None:
        raise NotFoundError(detail="Portfolio holding not found")
    return holding


def update_holding(
    db: Session, user_id: int, holding_id: int, **fields: Any
) -> PortfolioHolding:
    holding = get_holding_or_404(db, user_id, holding_id)
    return portfolio_repo.update_holding(db, holding, **fields)


def set_archived(db: Session, user_id: int, holding_id: int, archived: bool) -> PortfolioHolding:
    holding = get_holding_or_404(db, user_id, holding_id)
    return portfolio_repo.set_archived(db, holding, archived)


def delete_holding(db: Session, user_id: int, holding_id: int) -> None:
    holding = get_holding_or_404(db, user_id, holding_id)
    portfolio_repo.delete_holding(db, holding)
