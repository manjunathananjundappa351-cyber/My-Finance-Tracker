from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import BulkIdsRequest
from app.schemas.expense import (
    ExpenseBulkImportRequest,
    ExpenseBulkImportResult,
    ExpenseCategoryCreate,
    ExpenseCategoryOut,
    ExpenseCreate,
    ExpenseOut,
    ExpenseUpdate,
)
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/categories", response_model=list[ExpenseCategoryOut])
def list_categories(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return expense_service.list_categories(db, current_user.id)


@router.post("/categories", response_model=ExpenseCategoryOut, status_code=201)
def create_category(
    payload: ExpenseCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.create_category(db, current_user.id, payload.name, payload.type)


@router.get("", response_model=list[ExpenseOut])
def list_expenses(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    include_archived: bool = False,
    archived_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.list_expenses(
        db, current_user.id, start_date, end_date, category_id, include_archived, archived_only, tag_id
    )


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.create_expense(
        db,
        current_user.id,
        payload.category_id,
        payload.amount,
        payload.description,
        payload.expense_date,
        is_recurring=payload.is_recurring,
        notes=payload.notes,
        tag_ids=payload.tag_ids,
        goal_id=payload.goal_id,
    )


@router.post("/bulk/import", response_model=ExpenseBulkImportResult)
def bulk_import(
    payload: ExpenseBulkImportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    imported, skipped, errors = expense_service.bulk_import(
        db, current_user.id, [item.model_dump() for item in payload.items]
    )
    return ExpenseBulkImportResult(imported=imported, skipped=skipped, errors=errors)


@router.post("/bulk/archive", status_code=204)
def bulk_archive(
    payload: BulkIdsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense_service.bulk_set_archived(db, current_user.id, payload.ids, True)


@router.post("/bulk/restore", status_code=204)
def bulk_restore(
    payload: BulkIdsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense_service.bulk_set_archived(db, current_user.id, payload.ids, False)


@router.post("/bulk/delete", status_code=204)
def bulk_delete(
    payload: BulkIdsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense_service.bulk_delete(db, current_user.id, payload.ids)


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.get_expense_or_404(db, current_user.id, expense_id)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.update_expense(
        db,
        current_user.id,
        expense_id,
        payload.category_id,
        payload.amount,
        payload.description,
        payload.expense_date,
        is_recurring=payload.is_recurring,
        notes=payload.notes,
        tag_ids=payload.tag_ids,
        goal_id=payload.goal_id,
        clear_goal=payload.clear_goal,
    )


@router.post("/{expense_id}/archive", response_model=ExpenseOut)
def archive_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.set_archived(db, current_user.id, expense_id, True)


@router.post("/{expense_id}/restore", response_model=ExpenseOut)
def restore_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.set_archived(db, current_user.id, expense_id, False)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense_service.delete_expense(db, current_user.id, expense_id)
