from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    expense_categories = relationship(
        "ExpenseCategory", back_populates="user", cascade="all, delete-orphan"
    )
    income_entries = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    income_categories = relationship(
        "IncomeCategory", back_populates="user", cascade="all, delete-orphan"
    )
    holdings = relationship(
        "PortfolioHolding", back_populates="user", cascade="all, delete-orphan"
    )
