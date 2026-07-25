from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class BackupExpense(BaseModel):
    category: str
    category_type: str = "need"
    amount: float
    description: str = ""
    notes: str = ""
    expense_date: date
    is_recurring: bool = False
    tags: list[str] = Field(default_factory=list)


class BackupIncome(BaseModel):
    category: str
    amount: float
    description: str = ""
    notes: str = ""
    income_date: date
    is_recurring: bool = False
    tags: list[str] = Field(default_factory=list)


class BackupHolding(BaseModel):
    symbol: str
    name: str = ""
    asset_type: str
    quantity: float
    buy_price: float
    buy_date: date
    current_price: float
    broker: str = ""
    sector: str = ""
    exchange: str = ""
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    notes: str = ""


class BackupLoan(BaseModel):
    name: str
    loan_type: str
    principal_amount: float
    interest_rate: float
    emi_amount: float
    outstanding_balance: float
    start_date: date
    tenure_months: int
    notes: str = ""


class BackupGoal(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    target_date: date
    notes: str = ""


class BackupBudget(BaseModel):
    category: str
    monthly_limit: float


class BackupData(BaseModel):
    version: int = 1
    exported_at: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    expenses: list[BackupExpense] = Field(default_factory=list)
    income: list[BackupIncome] = Field(default_factory=list)
    portfolio_holdings: list[BackupHolding] = Field(default_factory=list)
    loans: list[BackupLoan] = Field(default_factory=list)
    goals: list[BackupGoal] = Field(default_factory=list)
    budgets: list[BackupBudget] = Field(default_factory=list)


class RestoreSummary(BaseModel):
    expenses_imported: int
    income_imported: int
    portfolio_holdings_imported: int
    loans_imported: int
    goals_imported: int
    budgets_imported: int
    tags_imported: int
