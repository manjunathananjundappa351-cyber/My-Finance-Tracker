from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.constants import AssetType
from app.schemas.tag import TagOut


class PortfolioHoldingCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=50)
    name: str = ""
    asset_type: AssetType
    quantity: float = Field(gt=0)
    buy_price: float = Field(gt=0)
    buy_date: date
    current_price: float = Field(gt=0)
    broker: str = ""
    sector: str = ""
    exchange: str = ""
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    notes: str = ""
    tag_ids: list[int] = Field(default_factory=list)


class PortfolioHoldingUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    asset_type: Optional[AssetType] = None
    quantity: Optional[float] = Field(default=None, gt=0)
    buy_price: Optional[float] = Field(default=None, gt=0)
    buy_date: Optional[date] = None
    current_price: Optional[float] = Field(default=None, gt=0)
    broker: Optional[str] = None
    sector: Optional[str] = None
    exchange: Optional[str] = None
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    notes: Optional[str] = None
    tag_ids: Optional[list[int]] = None


class PortfolioHoldingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    name: str
    asset_type: AssetType
    quantity: float
    buy_price: float
    buy_date: date
    current_price: float
    broker: str
    sector: str
    exchange: str
    target_price: Optional[float]
    stop_loss: Optional[float]
    notes: str
    is_archived: bool
    tags: list[TagOut]

    invested_value: float
    current_value: float
    profit_loss: float
    profit_loss_pct: float
    cagr_pct: Optional[float]
