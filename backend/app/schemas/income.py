from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.tag import TagOut


class IncomeCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    is_default: bool


class IncomeCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class IncomeCreate(BaseModel):
    category_id: int
    amount: float = Field(gt=0)
    description: str = ""
    notes: str = ""
    income_date: date
    is_recurring: bool = False
    tag_ids: list[int] = Field(default_factory=list)
    goal_id: Optional[int] = None


class IncomeUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    notes: Optional[str] = None
    income_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    tag_ids: Optional[list[int]] = None
    goal_id: Optional[int] = None
    clear_goal: bool = False


class IncomeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: IncomeCategoryOut
    amount: float
    description: str
    notes: str
    income_date: date
    is_recurring: bool
    is_archived: bool
    recurring_parent_id: Optional[int]
    tags: list[TagOut]
    goal_id: Optional[int]
