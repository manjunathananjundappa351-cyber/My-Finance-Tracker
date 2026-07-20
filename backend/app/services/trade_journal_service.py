from typing import Any, Optional

from sqlalchemy.orm import Session

from app.constants import TradeDirection
from app.exceptions import NotFoundError
from app.models.trade_journal import TradeJournalEntry
from app.repositories import trade_journal_repo
from app.schemas.trade_journal import TradeAnalytics, TradeOut


def _profit_loss(trade: TradeJournalEntry) -> Optional[float]:
    if trade.exit_price is None:
        return None
    if trade.direction == TradeDirection.LONG:
        return (trade.exit_price - trade.entry_price) * trade.quantity
    return (trade.entry_price - trade.exit_price) * trade.quantity


def _holding_days(trade: TradeJournalEntry) -> Optional[int]:
    if trade.exit_date is None:
        return None
    return (trade.exit_date - trade.entry_date).days


def to_trade_out(trade: TradeJournalEntry) -> TradeOut:
    return TradeOut(
        id=trade.id,
        symbol=trade.symbol,
        direction=trade.direction,
        quantity=trade.quantity,
        entry_price=trade.entry_price,
        entry_date=trade.entry_date,
        exit_price=trade.exit_price,
        exit_date=trade.exit_date,
        strategy=trade.strategy,
        emotion=trade.emotion,
        mistake=trade.mistake,
        lessons=trade.lessons,
        is_closed=trade.exit_price is not None,
        profit_loss=_profit_loss(trade),
        holding_days=_holding_days(trade),
    )


def list_trades(db: Session, user_id: int) -> list[TradeJournalEntry]:
    return trade_journal_repo.list_trades(db, user_id)


def get_analytics(db: Session, user_id: int) -> TradeAnalytics:
    trades = [to_trade_out(t) for t in trade_journal_repo.list_trades(db, user_id)]
    closed = [t for t in trades if t.is_closed]

    wins = [t for t in closed if (t.profit_loss or 0) > 0]
    total_pl = sum(t.profit_loss or 0 for t in closed)
    holding_days = [t.holding_days for t in closed if t.holding_days is not None]

    best_trade = max(closed, key=lambda t: t.profit_loss or 0) if closed else None
    worst_trade = min(closed, key=lambda t: t.profit_loss or 0) if closed else None

    return TradeAnalytics(
        total_trades=len(trades),
        closed_trades=len(closed),
        win_rate_pct=(len(wins) / len(closed) * 100) if closed else 0.0,
        total_profit_loss=total_pl,
        average_profit_loss=(total_pl / len(closed)) if closed else 0.0,
        best_trade=best_trade,
        worst_trade=worst_trade,
        average_holding_days=(sum(holding_days) / len(holding_days)) if holding_days else None,
    )


def create_trade(db: Session, user_id: int, **fields: Any) -> TradeJournalEntry:
    return trade_journal_repo.create_trade(db, user_id, **fields)


def get_trade_or_404(db: Session, user_id: int, trade_id: int) -> TradeJournalEntry:
    trade = trade_journal_repo.get_trade(db, user_id, trade_id)
    if trade is None:
        raise NotFoundError(detail="Trade not found")
    return trade


def update_trade(db: Session, user_id: int, trade_id: int, **fields: Any) -> TradeJournalEntry:
    trade = get_trade_or_404(db, user_id, trade_id)
    return trade_journal_repo.update_trade(db, trade, **fields)


def delete_trade(db: Session, user_id: int, trade_id: int) -> None:
    trade = get_trade_or_404(db, user_id, trade_id)
    trade_journal_repo.delete_trade(db, trade)
