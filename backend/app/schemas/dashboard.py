from pydantic import BaseModel


class MonthlyAmount(BaseModel):
    month: str
    amount: float


class CategoryAllocation(BaseModel):
    label: str
    amount: float


class HoldingMover(BaseModel):
    symbol: str
    name: str
    profit_loss: float
    profit_loss_pct: float


class DashboardSummary(BaseModel):
    net_worth: float
    total_invested: float
    total_portfolio_value: float
    monthly_income: float
    monthly_expenses: float
    todays_profit_loss: float

    expense_trend: list[MonthlyAmount]
    income_trend: list[MonthlyAmount]
    cash_flow: list[MonthlyAmount]

    expense_allocation: list[CategoryAllocation]
    portfolio_allocation: list[CategoryAllocation]

    top_gainers: list[HoldingMover]
    top_losers: list[HoldingMover]
