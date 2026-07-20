from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import BulkIdsRequest
from app.schemas.income import (
    IncomeCategoryCreate,
    IncomeCategoryOut,
    IncomeCreate,
    IncomeOut,
    IncomeUpdate,
)
from app.services import income_service

router = APIRouter(prefix="/income", tags=["income"])


@router.get("/categories", response_model=list[IncomeCategoryOut])
def list_categories(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return income_service.list_categories(db, current_user.id)


@router.post("/categories", response_model=IncomeCategoryOut, status_code=201)
def create_category(
    payload: IncomeCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.create_category(db, current_user.id, payload.name)


@router.get("", response_model=list[IncomeOut])
def list_income(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    include_archived: bool = False,
    archived_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.list_income(
        db, current_user.id, start_date, end_date, category_id, include_archived, archived_only, tag_id
    )


@router.post("", response_model=IncomeOut, status_code=201)
def create_income(
    payload: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.create_income(
        db,
        current_user.id,
        payload.category_id,
        payload.amount,
        payload.description,
        payload.income_date,
        is_recurring=payload.is_recurring,
        notes=payload.notes,
        tag_ids=payload.tag_ids,
    )


@router.post("/bulk/archive", status_code=204)
def bulk_archive(
    payload: BulkIdsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    income_service.bulk_set_archived(db, current_user.id, payload.ids, True)


@router.post("/bulk/restore", status_code=204)
def bulk_restore(
    payload: BulkIdsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    income_service.bulk_set_archived(db, current_user.id, payload.ids, False)


@router.post("/bulk/delete", status_code=204)
def bulk_delete(
    payload: BulkIdsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    income_service.bulk_delete(db, current_user.id, payload.ids)


@router.get("/{income_id}", response_model=IncomeOut)
def get_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.get_income_or_404(db, current_user.id, income_id)


@router.put("/{income_id}", response_model=IncomeOut)
def update_income(
    income_id: int,
    payload: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.update_income(
        db,
        current_user.id,
        income_id,
        payload.category_id,
        payload.amount,
        payload.description,
        payload.income_date,
        is_recurring=payload.is_recurring,
        notes=payload.notes,
        tag_ids=payload.tag_ids,
    )


@router.post("/{income_id}/archive", response_model=IncomeOut)
def archive_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.set_archived(db, current_user.id, income_id, True)


@router.post("/{income_id}/restore", response_model=IncomeOut)
def restore_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.set_archived(db, current_user.id, income_id, False)


@router.delete("/{income_id}", status_code=204)
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    income_service.delete_income(db, current_user.id, income_id)
