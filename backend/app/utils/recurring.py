import calendar
from datetime import date

from sqlalchemy.orm import Session

from app.repositories import expense_repo, income_repo


def add_months(d: date, months: int) -> date:
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def generate_due_recurring_expenses(db: Session, user_id: int) -> None:
    today = date.today()
    for template in expense_repo.list_recurring_templates(db, user_id):
        cursor = add_months(template.expense_date, 1)
        while cursor <= today:
            if not expense_repo.recurring_child_exists(db, template.id, cursor.year, cursor.month):
                expense_repo.create_expense(
                    db,
                    user_id,
                    template.category_id,
                    template.amount,
                    template.description,
                    cursor,
                    is_recurring=False,
                    recurring_parent_id=template.id,
                )
            cursor = add_months(cursor, 1)


def generate_due_recurring_income(db: Session, user_id: int) -> None:
    today = date.today()
    for template in income_repo.list_recurring_templates(db, user_id):
        cursor = add_months(template.income_date, 1)
        while cursor <= today:
            if not income_repo.recurring_child_exists(db, template.id, cursor.year, cursor.month):
                income_repo.create_income(
                    db,
                    user_id,
                    template.category_id,
                    template.amount,
                    template.description,
                    cursor,
                    is_recurring=False,
                    recurring_parent_id=template.id,
                )
            cursor = add_months(cursor, 1)
