from sqlalchemy import Column, ForeignKey, Integer, String, Table, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

expense_tags = Table(
    "expense_tags",
    Base.metadata,
    Column("expense_id", ForeignKey("expenses.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

income_tags = Table(
    "income_tags",
    Base.metadata,
    Column("income_id", ForeignKey("income.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

portfolio_tags = Table(
    "portfolio_tags",
    Base.metadata,
    Column(
        "portfolio_holding_id",
        ForeignKey("portfolio_holdings.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_tag_user_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#0071e3")

    expenses = relationship("Expense", secondary=expense_tags, back_populates="tags")
    income_entries = relationship("Income", secondary=income_tags, back_populates="tags")
    portfolio_holdings = relationship(
        "PortfolioHolding", secondary=portfolio_tags, back_populates="tags"
    )
