from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.token import RefreshRequest, TokenPair
from app.schemas.user import PasswordChange, UserLogin, UserOut, UserRegister, UserUpdate
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = auth_service.register_user(
        db, email=payload.email, password=payload.password, full_name=payload.full_name
    )
    return user


@router.post("/login", response_model=TokenPair)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, email=payload.email, password=payload.password)
    return auth_service.issue_tokens(user)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_access_token(db, refresh_token=payload.refresh_token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return auth_service.update_profile(db, current_user, payload.full_name)


@router.post("/change-password", status_code=204)
def change_password(
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.change_password(
        db, current_user, payload.current_password, payload.new_password
    )
