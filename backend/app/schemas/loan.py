from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.constants import LoanType


class LoanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    loan_type: LoanType
    principal_amount: float = Field(gt=0)
    interest_rate: float = Field(ge=0)
    emi_amount: float = Field(gt=0)
    outstanding_balance: float = Field(ge=0)
    start_date: date
    tenure_months: int = Field(gt=0)
    notes: str = ""


class LoanUpdate(BaseModel):
    name: Optional[str] = None
    loan_type: Optional[LoanType] = None
    principal_amount: Optional[float] = Field(default=None, gt=0)
    interest_rate: Optional[float] = Field(default=None, ge=0)
    emi_amount: Optional[float] = Field(default=None, gt=0)
    outstanding_balance: Optional[float] = Field(default=None, ge=0)
    start_date: Optional[date] = None
    tenure_months: Optional[int] = Field(default=None, gt=0)
    notes: Optional[str] = None


class LoanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    loan_type: LoanType
    principal_amount: float
    interest_rate: float
    emi_amount: float
    outstanding_balance: float
    start_date: date
    tenure_months: int
    notes: str
    is_archived: bool

    paid_amount: float
    progress_pct: float
    next_due_date: date
