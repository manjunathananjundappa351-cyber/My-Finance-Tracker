from datetime import date
from typing import Any

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.loan import Loan
from app.repositories import loan_repo
from app.schemas.loan import LoanOut
from app.services import audit_log_service
from app.utils.recurring import add_months


def _next_due_date(start_date: date, tenure_months: int) -> date:
    today = date.today()
    max_date = add_months(start_date, tenure_months)
    cursor = start_date
    while cursor < today and cursor < max_date:
        cursor = add_months(cursor, 1)
    return cursor


def to_loan_out(loan: Loan) -> LoanOut:
    paid_amount = loan.principal_amount - loan.outstanding_balance
    progress_pct = (paid_amount / loan.principal_amount * 100) if loan.principal_amount else 0.0

    return LoanOut(
        id=loan.id,
        name=loan.name,
        loan_type=loan.loan_type,
        principal_amount=loan.principal_amount,
        interest_rate=loan.interest_rate,
        emi_amount=loan.emi_amount,
        outstanding_balance=loan.outstanding_balance,
        start_date=loan.start_date,
        tenure_months=loan.tenure_months,
        notes=loan.notes,
        is_archived=loan.is_archived,
        paid_amount=paid_amount,
        progress_pct=progress_pct,
        next_due_date=_next_due_date(loan.start_date, loan.tenure_months),
    )


def list_loans(
    db: Session, user_id: int, include_archived: bool = False, archived_only: bool = False
) -> list[Loan]:
    return loan_repo.list_loans(db, user_id, include_archived, archived_only)


def total_outstanding(db: Session, user_id: int) -> float:
    return sum(loan.outstanding_balance for loan in loan_repo.list_loans(db, user_id))


def create_loan(db: Session, user_id: int, **fields: Any) -> Loan:
    loan = loan_repo.create_loan(db, user_id, **fields)
    audit_log_service.log(db, user_id, "create", "loan", loan.id, f"Added loan: {loan.name}")
    return loan


def get_loan_or_404(db: Session, user_id: int, loan_id: int) -> Loan:
    loan = loan_repo.get_loan(db, user_id, loan_id)
    if loan is None:
        raise NotFoundError(detail="Loan not found")
    return loan


def update_loan(db: Session, user_id: int, loan_id: int, **fields: Any) -> Loan:
    loan = get_loan_or_404(db, user_id, loan_id)
    updated = loan_repo.update_loan(db, loan, **fields)
    audit_log_service.log(db, user_id, "update", "loan", updated.id, f"Updated loan: {updated.name}")
    return updated


def set_archived(db: Session, user_id: int, loan_id: int, archived: bool) -> Loan:
    loan = get_loan_or_404(db, user_id, loan_id)
    updated = loan_repo.set_archived(db, loan, archived)
    audit_log_service.log(
        db, user_id, "archive" if archived else "restore", "loan", updated.id,
        f"{'Archived' if archived else 'Restored'} loan: {updated.name}",
    )
    return updated


def delete_loan(db: Session, user_id: int, loan_id: int) -> None:
    loan = get_loan_or_404(db, user_id, loan_id)
    summary = f"Permanently deleted loan: {loan.name}"
    loan_repo.delete_loan(db, loan)
    audit_log_service.log(db, user_id, "delete", "loan", loan_id, summary)
