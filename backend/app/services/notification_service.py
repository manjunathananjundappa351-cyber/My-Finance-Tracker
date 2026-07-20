from datetime import date

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.notification import Notification
from app.repositories import budget_repo, notification_repo
from app.services.budget_service import to_budget_out


def _generate_budget_alerts(db: Session, user_id: int) -> None:
    month_key = date.today().strftime("%Y-%m")

    for budget in budget_repo.list_budgets(db, user_id):
        budget_out = to_budget_out(db, budget)
        if budget_out.percent_used < 80:
            continue

        level = "warning" if budget_out.percent_used < 100 else "error"
        source_key = f"budget:{budget.id}:{month_key}:{level}"
        if notification_repo.exists_by_source_key(db, user_id, source_key):
            continue

        if level == "error":
            message = (
                f"You've exceeded your {budget.category.name} budget "
                f"({budget_out.percent_used:.0f}% used this month)."
            )
        else:
            message = (
                f"You've used {budget_out.percent_used:.0f}% of your "
                f"{budget.category.name} budget this month."
            )

        notification_repo.create_notification(db, user_id, message, level, source_key)


def list_notifications(db: Session, user_id: int) -> list[Notification]:
    _generate_budget_alerts(db, user_id)
    return notification_repo.list_notifications(db, user_id)


def mark_read(db: Session, user_id: int, notification_id: int) -> Notification:
    notification = notification_repo.get_notification(db, user_id, notification_id)
    if notification is None:
        raise NotFoundError(detail="Notification not found")
    return notification_repo.mark_read(db, notification)


def mark_all_read(db: Session, user_id: int) -> None:
    notification_repo.mark_all_read(db, user_id)
