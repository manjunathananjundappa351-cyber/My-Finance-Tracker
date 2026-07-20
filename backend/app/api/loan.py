from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.loan import LoanCreate, LoanOut, LoanUpdate
from app.services import loan_service

router = APIRouter(prefix="/loans", tags=["loans"])


@router.get("", response_model=list[LoanOut])
def list_loans(
    include_archived: bool = False,
    archived_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loans = loan_service.list_loans(db, current_user.id, include_archived, archived_only)
    return [loan_service.to_loan_out(loan) for loan in loans]


@router.post("", response_model=LoanOut, status_code=201)
def create_loan(
    payload: LoanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = loan_service.create_loan(db, current_user.id, **payload.model_dump())
    return loan_service.to_loan_out(loan)


@router.put("/{loan_id}", response_model=LoanOut)
def update_loan(
    loan_id: int,
    payload: LoanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = loan_service.update_loan(
        db, current_user.id, loan_id, **payload.model_dump(exclude_unset=True)
    )
    return loan_service.to_loan_out(loan)


@router.post("/{loan_id}/archive", response_model=LoanOut)
def archive_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = loan_service.set_archived(db, current_user.id, loan_id, True)
    return loan_service.to_loan_out(loan)


@router.post("/{loan_id}/restore", response_model=LoanOut)
def restore_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = loan_service.set_archived(db, current_user.id, loan_id, False)
    return loan_service.to_loan_out(loan)


@router.delete("/{loan_id}", status_code=204)
def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan_service.delete_loan(db, current_user.id, loan_id)
