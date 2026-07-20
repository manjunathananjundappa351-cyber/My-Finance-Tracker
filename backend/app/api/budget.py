from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetUpdate
from app.services import budget_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetOut])
def list_budgets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.list_budgets(db, current_user.id)


@router.post("", response_model=BudgetOut, status_code=201)
def create_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return budget_service.create_budget(db, current_user.id, payload.category_id, payload.monthly_limit)


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return budget_service.update_budget(db, current_user.id, budget_id, payload.monthly_limit)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget_service.delete_budget(db, current_user.id, budget_id)
