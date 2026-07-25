from datetime import date
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.portfolio import PortfolioHolding
from app.repositories import portfolio_repo, tag_repo
from app.schemas.portfolio import PortfolioHoldingOut
from app.services import audit_log_service


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
        tags=holding.tags,
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
    tag_ids = fields.pop("tag_ids", None)
    fields["tags"] = tag_repo.get_tags_by_ids(db, user_id, tag_ids or [])
    holding = portfolio_repo.create_holding(db, user_id, **fields)
    audit_log_service.log(
        db, user_id, "create", "portfolio_holding", holding.id, f"Added holding: {holding.symbol}"
    )
    return holding


def get_holding_or_404(db: Session, user_id: int, holding_id: int) -> PortfolioHolding:
    holding = portfolio_repo.get_holding(db, user_id, holding_id)
    if holding is None:
        raise NotFoundError(detail="Portfolio holding not found")
    return holding


def update_holding(
    db: Session, user_id: int, holding_id: int, **fields: Any
) -> PortfolioHolding:
    holding = get_holding_or_404(db, user_id, holding_id)
    if "tag_ids" in fields:
        tag_ids = fields.pop("tag_ids")
        if tag_ids is not None:
            fields["tags"] = tag_repo.get_tags_by_ids(db, user_id, tag_ids)
    updated = portfolio_repo.update_holding(db, holding, **fields)
    audit_log_service.log(
        db, user_id, "update", "portfolio_holding", updated.id, f"Updated holding: {updated.symbol}"
    )
    return updated


def set_archived(db: Session, user_id: int, holding_id: int, archived: bool) -> PortfolioHolding:
    holding = get_holding_or_404(db, user_id, holding_id)
    updated = portfolio_repo.set_archived(db, holding, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "portfolio_holding", updated.id,
        f"{'Archived' if archived else 'Restored'} holding: {updated.symbol}",
    )
    return updated


def delete_holding(db: Session, user_id: int, holding_id: int) -> None:
    holding = get_holding_or_404(db, user_id, holding_id)
    summary = f"Permanently deleted holding: {holding.symbol}"
    portfolio_repo.delete_holding(db, holding)
    audit_log_service.log(db, user_id, "delete", "portfolio_holding", holding_id, summary)
