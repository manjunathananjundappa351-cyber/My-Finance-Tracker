from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.repositories import (
    budget_repo,
    expense_repo,
    goal_repo,
    income_repo,
    loan_repo,
    portfolio_repo,
    tag_repo,
)
from app.schemas.backup import (
    BackupBudget,
    BackupData,
    BackupExpense,
    BackupGoal,
    BackupHolding,
    BackupIncome,
    BackupLoan,
    RestoreSummary,
)


def export_data(db: Session, user_id: int) -> BackupData:
    expenses = expense_repo.list_expenses(db, user_id, include_archived=True)
    income_entries = income_repo.list_income(db, user_id, include_archived=True)
    holdings = portfolio_repo.list_holdings(db, user_id, include_archived=True)
    loans = loan_repo.list_loans(db, user_id, include_archived=True)
    goals = goal_repo.list_goals(db, user_id, include_archived=True)
    budgets = budget_repo.list_budgets(db, user_id)
    tags = tag_repo.list_tags(db, user_id)

    return BackupData(
        exported_at=datetime.now(timezone.utc).isoformat(),
        tags=[t.name for t in tags],
        expenses=[
            BackupExpense(
                category=e.category.name,
                category_type=e.category.type,
                amount=e.amount,
                description=e.description,
                notes=e.notes,
                expense_date=e.expense_date,
                is_recurring=e.is_recurring,
                tags=[t.name for t in e.tags],
            )
            for e in expenses
            if e.recurring_parent_id is None
        ],
        income=[
            BackupIncome(
                category=i.category.name,
                amount=i.amount,
                description=i.description,
                notes=i.notes,
                income_date=i.income_date,
                is_recurring=i.is_recurring,
                tags=[t.name for t in i.tags],
            )
            for i in income_entries
            if i.recurring_parent_id is None
        ],
        portfolio_holdings=[
            BackupHolding(
                symbol=h.symbol,
                name=h.name,
                asset_type=h.asset_type,
                quantity=h.quantity,
                buy_price=h.buy_price,
                buy_date=h.buy_date,
                current_price=h.current_price,
                broker=h.broker,
                sector=h.sector,
                exchange=h.exchange,
                target_price=h.target_price,
                stop_loss=h.stop_loss,
                notes=h.notes,
            )
            for h in holdings
        ],
        loans=[
            BackupLoan(
                name=l.name,
                loan_type=l.loan_type,
                principal_amount=l.principal_amount,
                interest_rate=l.interest_rate,
                emi_amount=l.emi_amount,
                outstanding_balance=l.outstanding_balance,
                start_date=l.start_date,
                tenure_months=l.tenure_months,
                notes=l.notes,
            )
            for l in loans
        ],
        goals=[
            BackupGoal(
                name=g.name,
                target_amount=g.target_amount,
                current_amount=g.current_amount,
                target_date=g.target_date,
                notes=g.notes,
            )
            for g in goals
        ],
        budgets=[
            BackupBudget(category=b.category.name, monthly_limit=b.monthly_limit) for b in budgets
        ],
    )


def _get_or_create_tag(db: Session, user_id: int, name: str, cache: dict):
    if name in cache:
        return cache[name]
    existing = next((t for t in tag_repo.list_tags(db, user_id) if t.name.lower() == name.lower()), None)
    tag = existing or tag_repo.create_tag(db, user_id, name, "#0071e3")
    cache[name] = tag
    return tag


def _get_or_create_expense_category(db: Session, user_id: int, name: str, category_type: str, cache: dict):
    if name in cache:
        return cache[name]
    existing = next((c for c in expense_repo.list_categories(db, user_id) if c.name.lower() == name.lower()), None)
    category = existing or expense_repo.create_category(db, user_id, name, category_type)
    cache[name] = category
    return category


def _get_or_create_income_category(db: Session, user_id: int, name: str, cache: dict):
    if name in cache:
        return cache[name]
    existing = next((c for c in income_repo.list_categories(db, user_id) if c.name.lower() == name.lower()), None)
    category = existing or income_repo.create_category(db, user_id, name)
    cache[name] = category
    return category


def restore_data(db: Session, user_id: int, data: BackupData) -> RestoreSummary:
    tag_cache: dict = {}
    expense_category_cache: dict = {}
    income_category_cache: dict = {}

    for name in data.tags:
        _get_or_create_tag(db, user_id, name, tag_cache)

    for e in data.expenses:
        category = _get_or_create_expense_category(db, user_id, e.category, e.category_type, expense_category_cache)
        tags = [_get_or_create_tag(db, user_id, t, tag_cache) for t in e.tags]
        expense_repo.create_expense(
            db, user_id, category.id, e.amount, e.description, e.expense_date,
            is_recurring=e.is_recurring, notes=e.notes, tags=tags,
        )

    for i in data.income:
        category = _get_or_create_income_category(db, user_id, i.category, income_category_cache)
        tags = [_get_or_create_tag(db, user_id, t, tag_cache) for t in i.tags]
        income_repo.create_income(
            db, user_id, category.id, i.amount, i.description, i.income_date,
            is_recurring=i.is_recurring, notes=i.notes, tags=tags,
        )

    for h in data.portfolio_holdings:
        portfolio_repo.create_holding(
            db, user_id,
            symbol=h.symbol, name=h.name, asset_type=h.asset_type, quantity=h.quantity,
            buy_price=h.buy_price, buy_date=h.buy_date, current_price=h.current_price,
            broker=h.broker, sector=h.sector, exchange=h.exchange,
            target_price=h.target_price, stop_loss=h.stop_loss, notes=h.notes,
        )

    for l in data.loans:
        loan_repo.create_loan(
            db, user_id,
            name=l.name, loan_type=l.loan_type, principal_amount=l.principal_amount,
            interest_rate=l.interest_rate, emi_amount=l.emi_amount,
            outstanding_balance=l.outstanding_balance, start_date=l.start_date,
            tenure_months=l.tenure_months, notes=l.notes,
        )

    for g in data.goals:
        goal_repo.create_goal(db, user_id, g.name, g.target_amount, g.current_amount, g.target_date)

    for b in data.budgets:
        category = _get_or_create_expense_category(db, user_id, b.category, "need", expense_category_cache)
        if budget_repo.get_budget_by_category(db, user_id, category.id) is None:
            budget_repo.create_budget(db, user_id, category.id, b.monthly_limit)

    return RestoreSummary(
        expenses_imported=len(data.expenses),
        income_imported=len(data.income),
        portfolio_holdings_imported=len(data.portfolio_holdings),
        loans_imported=len(data.loans),
        goals_imported=len(data.goals),
        budgets_imported=len(data.budgets),
        tags_imported=len(data.tags),
    )
