from sqlalchemy.orm import Session

from app.repositories import net_worth_repo, portfolio_repo
from app.schemas.net_worth import NetWorthPoint, NetWorthTimeline
from app.services.loan_service import total_outstanding
from app.services.portfolio_service import to_holding_out


def compute_net_worth(db: Session, user_id: int) -> float:
    holdings = portfolio_repo.list_holdings(db, user_id)
    portfolio_value = sum(to_holding_out(h).current_value for h in holdings)
    return portfolio_value - total_outstanding(db, user_id)


def record_today_snapshot(db: Session, user_id: int) -> float:
    net_worth = compute_net_worth(db, user_id)
    net_worth_repo.upsert_today_snapshot(db, user_id, net_worth)
    return net_worth


def get_timeline(db: Session, user_id: int, days: int = 180) -> NetWorthTimeline:
    record_today_snapshot(db, user_id)
    snapshots = net_worth_repo.list_timeline(db, user_id, days)
    return NetWorthTimeline(
        points=[
            NetWorthPoint(snapshot_date=s.snapshot_date, net_worth=s.net_worth)
            for s in snapshots
        ]
    )
