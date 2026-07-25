from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalOut, GoalTransactions, GoalUpdate
from app.services import goal_service

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalOut])
def list_goals(
    include_archived: bool = False,
    archived_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.list_goals(db, current_user.id, include_archived, archived_only)


@router.post("", response_model=GoalOut, status_code=201)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.create_goal(
        db,
        current_user.id,
        payload.name,
        payload.target_amount,
        payload.current_amount,
        payload.target_date,
        notes=payload.notes,
    )


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.update_goal(
        db,
        current_user.id,
        goal_id,
        payload.name,
        payload.target_amount,
        payload.current_amount,
        payload.target_date,
        notes=payload.notes,
    )


@router.post("/{goal_id}/archive", response_model=GoalOut)
def archive_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.set_archived(db, current_user.id, goal_id, True)


@router.post("/{goal_id}/restore", response_model=GoalOut)
def restore_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.set_archived(db, current_user.id, goal_id, False)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal_service.delete_goal(db, current_user.id, goal_id)


@router.get("/{goal_id}/transactions", response_model=GoalTransactions)
def get_goal_transactions(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.get_goal_transactions(db, current_user.id, goal_id)
