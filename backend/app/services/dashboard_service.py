from collections import OrderedDict
from datetime import date

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.repositories import expense_repo, income_repo, portfolio_repo
from app.schemas.dashboard import (
    CategoryAllocation,
    DashboardSummary,
    HoldingMover,
    MonthlyAmount,
)
from app.services.loan_service import total_outstanding
from app.services.portfolio_service import to_holding_out

TREND_MONTHS = 6


def _month_key(d: date) -> str:
    return d.strftime("%Y-%m")


def _last_n_month_keys(n: int) -> "OrderedDict[str, float]":
    today = date.today().replace(day=1)
    keys: "OrderedDict[str, float]" = OrderedDict()
    for i in range(n - 1, -1, -1):
        month = today - relativedelta(months=i)
        keys[_month_key(month)] = 0.0
    return keys


def get_dashboard_summary(db: Session, user_id: int) -> DashboardSummary:
    today = date.today()
    month_start = today.replace(day=1)
    trend_start = (month_start - relativedelta(months=TREND_MONTHS - 1))

    expenses = expense_repo.list_expenses(db, user_id, start_date=trend_start)
    income_entries = income_repo.list_income(db, user_id, start_date=trend_start)
    holdings = portfolio_repo.list_holdings(db, user_id)

    expense_by_month = _last_n_month_keys(TREND_MONTHS)
    income_by_month = _last_n_month_keys(TREND_MONTHS)
    expense_by_category: dict[str, float] = {}
    monthly_expenses = 0.0

    for expense in expenses:
        key = _month_key(expense.expense_date)
        if key in expense_by_month:
            expense_by_month[key] += expense.amount
        if expense.expense_date >= month_start:
            monthly_expenses += expense.amount
            expense_by_category[expense.category.name] = (
                expense_by_category.get(expense.category.name, 0.0) + expense.amount
            )

    monthly_income = 0.0
    for entry in income_entries:
        key = _month_key(entry.income_date)
        if key in income_by_month:
            income_by_month[key] += entry.amount
        if entry.income_date >= month_start:
            monthly_income += entry.amount

    holding_outs = [to_holding_out(h) for h in holdings]
    total_invested = sum(h.invested_value for h in holding_outs)
    total_portfolio_value = sum(h.current_value for h in holding_outs)

    portfolio_allocation: dict[str, float] = {}
    for h in holding_outs:
        portfolio_allocation[h.asset_type.value] = (
            portfolio_allocation.get(h.asset_type.value, 0.0) + h.current_value
        )

    movers = sorted(holding_outs, key=lambda h: h.profit_loss_pct, reverse=True)
    top_gainers = [
        HoldingMover(
            symbol=h.symbol, name=h.name, profit_loss=h.profit_loss, profit_loss_pct=h.profit_loss_pct
        )
        for h in movers[:5]
        if h.profit_loss > 0
    ]
    top_losers = [
        HoldingMover(
            symbol=h.symbol, name=h.name, profit_loss=h.profit_loss, profit_loss_pct=h.profit_loss_pct
        )
        for h in reversed(movers[-5:])
        if h.profit_loss < 0
    ]

    cash_flow = OrderedDict(
        (key, income_by_month[key] - expense_by_month[key]) for key in expense_by_month
    )

    net_worth = total_portfolio_value - total_outstanding(db, user_id)

    return DashboardSummary(
        net_worth=net_worth,
        total_invested=total_invested,
        total_portfolio_value=total_portfolio_value,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        todays_profit_loss=0.0,
        expense_trend=[MonthlyAmount(month=k, amount=v) for k, v in expense_by_month.items()],
        income_trend=[MonthlyAmount(month=k, amount=v) for k, v in income_by_month.items()],
        cash_flow=[MonthlyAmount(month=k, amount=v) for k, v in cash_flow.items()],
        expense_allocation=[
            CategoryAllocation(label=k, amount=v) for k, v in expense_by_category.items()
        ],
        portfolio_allocation=[
            CategoryAllocation(label=k, amount=v) for k, v in portfolio_allocation.items()
        ],
        top_gainers=top_gainers,
        top_losers=top_losers,
    )
