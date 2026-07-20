from datetime import date

from sqlalchemy.orm import Session

from app.repositories import budget_repo, expense_repo, income_repo, portfolio_repo
from app.schemas.health_score import FinancialHealthScore, HealthScoreComponent
from app.services.budget_service import to_budget_out
from app.services.loan_service import total_outstanding
from app.services.portfolio_service import to_holding_out


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def _rating(score: float) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Average"
    return "Weak"


def compute_health_score(db: Session, user_id: int) -> FinancialHealthScore:
    month_start = date.today().replace(day=1)

    monthly_expenses = sum(
        e.amount for e in expense_repo.list_expenses(db, user_id, start_date=month_start)
    )
    monthly_income = sum(
        i.amount for i in income_repo.list_income(db, user_id, start_date=month_start)
    )

    holdings = [to_holding_out(h) for h in portfolio_repo.list_holdings(db, user_id)]
    portfolio_value = sum(h.current_value for h in holdings)
    distinct_asset_types = len({h.asset_type for h in holdings})

    outstanding_debt = total_outstanding(db, user_id)
    budgets = [to_budget_out(db, b) for b in budget_repo.list_budgets(db, user_id)]

    # 1. Savings ratio: share of income not spent this month.
    savings_ratio = ((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income else 0.0
    savings_score = _clamp(savings_ratio / 30 * 100)

    # 2. Debt-to-annual-income ratio: lower outstanding debt relative to income is better.
    annual_income = monthly_income * 12
    if annual_income > 0:
        debt_to_income = outstanding_debt / annual_income
    else:
        debt_to_income = 1.0 if outstanding_debt > 0 else 0.0
    debt_score = _clamp(100 - debt_to_income * 100)

    # 3. Diversification: breadth of distinct asset types held.
    diversification_score = _clamp(min(distinct_asset_types, 5) / 5 * 100)

    # 4. Expense control: how well budgets (if any) are being kept.
    if budgets:
        expense_control_score = _clamp(
            sum(100 - max(b.percent_used - 100, 0) for b in budgets) / len(budgets)
        )
    else:
        expense_control_score = 60.0

    # 5. Emergency fund: portfolio value as a multiple of monthly expenses, target 6 months.
    if monthly_expenses > 0:
        emergency_fund_score = _clamp(portfolio_value / (monthly_expenses * 6) * 100)
    else:
        emergency_fund_score = 100.0

    components = [
        HealthScoreComponent(label="Savings", score=savings_score, rating=_rating(savings_score)),
        HealthScoreComponent(label="Debt", score=debt_score, rating=_rating(debt_score)),
        HealthScoreComponent(
            label="Investment Diversification",
            score=diversification_score,
            rating=_rating(diversification_score),
        ),
        HealthScoreComponent(
            label="Expense Control", score=expense_control_score, rating=_rating(expense_control_score)
        ),
        HealthScoreComponent(
            label="Emergency Fund", score=emergency_fund_score, rating=_rating(emergency_fund_score)
        ),
    ]

    overall_score = sum(c.score for c in components) / len(components)

    return FinancialHealthScore(
        overall_score=overall_score,
        overall_rating=_rating(overall_score),
        components=components,
    )
