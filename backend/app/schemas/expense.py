from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.constants import ExpenseType
from app.schemas.tag import TagOut


class ExpenseCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: ExpenseType
    is_default: bool


class ExpenseCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: ExpenseType


class ExpenseCreate(BaseModel):
    category_id: int
    amount: float = Field(gt=0)
    description: str = ""
    notes: str = ""
    expense_date: date
    is_recurring: bool = False
    tag_ids: list[int] = Field(default_factory=list)


class ExpenseUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    notes: Optional[str] = None
    expense_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    tag_ids: Optional[list[int]] = None


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: ExpenseCategoryOut
    amount: float
    description: str
    notes: str
    expense_date: date
    is_recurring: bool
    is_archived: bool
    recurring_parent_id: Optional[int]
    tags: list[TagOut]
