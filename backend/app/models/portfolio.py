from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import AssetType
from app.database.base import Base


class PortfolioHolding(Base):
    """A single buy lot the user holds (stock, ETF, mutual fund, gold, etc).

    current_price is user-editable in Phase 1 since there is no live market
    data feed yet (that lands in Phase 2 alongside the market data service).
    """

    __tablename__ = "portfolio_holdings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), default="")
    asset_type: Mapped[AssetType] = mapped_column(String(20), nullable=False)

    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    buy_price: Mapped[float] = mapped_column(Float, nullable=False)
    buy_date: Mapped[date] = mapped_column(Date, nullable=False)
    current_price: Mapped[float] = mapped_column(Float, nullable=False)

    broker: Mapped[str] = mapped_column(String(100), default="")
    sector: Mapped[str] = mapped_column(String(100), default="")
    exchange: Mapped[str] = mapped_column(String(50), default="")
    target_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stop_loss: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[str] = mapped_column(String(1000), default="")
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="holdings")
    tags = relationship("Tag", secondary="portfolio_tags", back_populates="portfolio_holdings")
