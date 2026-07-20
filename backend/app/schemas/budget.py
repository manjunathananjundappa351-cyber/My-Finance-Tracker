from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.expense import ExpenseCategoryOut


class BudgetCreate(BaseModel):
    category_id: int
    monthly_limit: float = Field(gt=0)


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = Field(default=None, gt=0)


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: ExpenseCategoryOut
    monthly_limit: float
    spent: float
    remaining: float
    percent_used: float
