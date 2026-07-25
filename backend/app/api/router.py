from fastapi import APIRouter

from app.api import (
    audit_log,
    auth,
    backup,
    budget,
    dashboard,
    expense,
    gamification,
    goal,
    health_score,
    income,
    loan,
    net_worth,
    notification,
    portfolio,
    search,
    system,
    tag,
    trade_journal,
)

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(expense.router)
api_router.include_router(income.router)
api_router.include_router(portfolio.router)
api_router.include_router(dashboard.router)
api_router.include_router(budget.router)
api_router.include_router(goal.router)
api_router.include_router(notification.router)
api_router.include_router(loan.router)
api_router.include_router(trade_journal.router)
api_router.include_router(net_worth.router)
api_router.include_router(health_score.router)
api_router.include_router(gamification.router)
api_router.include_router(tag.router)
api_router.include_router(system.router)
api_router.include_router(search.router)
api_router.include_router(audit_log.router)
api_router.include_router(backup.router)
