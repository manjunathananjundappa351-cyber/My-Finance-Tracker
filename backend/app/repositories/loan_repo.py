from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.loan import Loan


def list_loans(
    db: Session, user_id: int, include_archived: bool = False, archived_only: bool = False
) -> list[Loan]:
    stmt = select(Loan).where(Loan.user_id == user_id)
    if archived_only:
        stmt = stmt.where(Loan.is_archived.is_(True))
    elif not include_archived:
        stmt = stmt.where(Loan.is_archived.is_(False))
    stmt = stmt.order_by(Loan.start_date)
    return list(db.execute(stmt).scalars().all())


def get_loan(db: Session, user_id: int, loan_id: int) -> Optional[Loan]:
    stmt = select(Loan).where(Loan.id == loan_id, Loan.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def create_loan(db: Session, user_id: int, **fields) -> Loan:
    loan = Loan(user_id=user_id, **fields)
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


def update_loan(db: Session, loan: Loan, **fields) -> Loan:
    for key, value in fields.items():
        if value is not None:
            setattr(loan, key, value)
    db.commit()
    db.refresh(loan)
    return loan


def set_archived(db: Session, loan: Loan, archived: bool) -> Loan:
    loan.is_archived = archived
    db.commit()
    db.refresh(loan)
    return loan


def delete_loan(db: Session, loan: Loan) -> None:
    db.delete(loan)
    db.commit()
