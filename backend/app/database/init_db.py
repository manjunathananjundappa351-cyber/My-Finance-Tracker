from app.constants import DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES
from app.database.base import Base
from app.database.connection import engine
from app.models import audit_log as audit_log_models  # noqa: F401
from app.models import budget as budget_models  # noqa: F401
from app.models import expense as expense_models  # noqa: F401
from app.models import goal as goal_models  # noqa: F401
from app.models import income as income_models  # noqa: F401
from app.models import loan as loan_models  # noqa: F401
from app.models import net_worth_snapshot as net_worth_snapshot_models  # noqa: F401
from app.models import notification as notification_models  # noqa: F401
from app.models import portfolio as portfolio_models  # noqa: F401
from app.models import tag as tag_models  # noqa: F401
from app.models import trade_journal as trade_journal_models  # noqa: F401
from app.models import user as user_models  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def seed_default_categories_for_user(db, user_id: int) -> None:
    """Create the default expense/income categories for a newly registered user."""
    from app.models.expense import ExpenseCategory
    from app.models.income import IncomeCategory

    for name, expense_type in DEFAULT_EXPENSE_CATEGORIES:
        db.add(
            ExpenseCategory(
                name=name,
                type=expense_type,
                user_id=user_id,
                is_default=True,
            )
        )

    for name in DEFAULT_INCOME_CATEGORIES:
        db.add(IncomeCategory(name=name, user_id=user_id, is_default=True))

    db.commit()
