from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.constants import TradeDirection
from app.database.base import Base


class TradeJournalEntry(Base):
    __tablename__ = "trade_journal"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    direction: Mapped[TradeDirection] = mapped_column(String(10), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    exit_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    exit_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    strategy: Mapped[str] = mapped_column(String(100), default="")
    emotion: Mapped[str] = mapped_column(String(100), default="")
    mistake: Mapped[str] = mapped_column(String(255), default="")
    lessons: Mapped[str] = mapped_column(String(1000), default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
