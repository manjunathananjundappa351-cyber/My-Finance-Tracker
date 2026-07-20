from sqlalchemy.orm import Session

from app.auth.jwt_handler import (
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.auth.password import hash_password, verify_password
from app.database.init_db import seed_default_categories_for_user
from app.exceptions import BadRequestError, ConflictError, UnauthorizedError
from app.models.user import User
from app.repositories import user_repo
from app.schemas.token import TokenPair


def register_user(db: Session, email: str, password: str, full_name: str) -> User:
    if user_repo.get_by_email(db, email) is not None:
        raise ConflictError(detail="An account with this email already exists")

    user = user_repo.create(
        db, email=email, hashed_password=hash_password(password), full_name=full_name
    )
    seed_default_categories_for_user(db, user.id)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = user_repo.get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError(detail="Incorrect email or password")
    if not user.is_active:
        raise UnauthorizedError(detail="Account is disabled")
    return user


def issue_tokens(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


def refresh_access_token(db: Session, refresh_token: str) -> TokenPair:
    user_id = decode_token(refresh_token, expected_type=REFRESH_TOKEN_TYPE)
    if user_id is None:
        raise UnauthorizedError(detail="Invalid or expired refresh token")

    user = user_repo.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError(detail="Invalid or expired refresh token")

    return issue_tokens(user)


def update_profile(db: Session, user: User, full_name: str) -> User:
    user.full_name = full_name
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.hashed_password):
        raise BadRequestError(detail="Current password is incorrect")

    user.hashed_password = hash_password(new_password)
    db.commit()
