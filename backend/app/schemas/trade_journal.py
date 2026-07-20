from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.constants import TradeDirection


class TradeCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=50)
    direction: TradeDirection
    quantity: float = Field(gt=0)
    entry_price: float = Field(gt=0)
    entry_date: date
    exit_price: Optional[float] = Field(default=None, gt=0)
    exit_date: Optional[date] = None
    strategy: str = ""
    emotion: str = ""
    mistake: str = ""
    lessons: str = ""


class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    direction: Optional[TradeDirection] = None
    quantity: Optional[float] = Field(default=None, gt=0)
    entry_price: Optional[float] = Field(default=None, gt=0)
    entry_date: Optional[date] = None
    exit_price: Optional[float] = Field(default=None, gt=0)
    exit_date: Optional[date] = None
    strategy: Optional[str] = None
    emotion: Optional[str] = None
    mistake: Optional[str] = None
    lessons: Optional[str] = None


class TradeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    direction: TradeDirection
    quantity: float
    entry_price: float
    entry_date: date
    exit_price: Optional[float]
    exit_date: Optional[date]
    strategy: str
    emotion: str
    mistake: str
    lessons: str

    is_closed: bool
    profit_loss: Optional[float]
    holding_days: Optional[int]


class TradeAnalytics(BaseModel):
    total_trades: int
    closed_trades: int
    win_rate_pct: float
    total_profit_loss: float
    average_profit_loss: float
    best_trade: Optional[TradeOut]
    worst_trade: Optional[TradeOut]
    average_holding_days: Optional[float]
