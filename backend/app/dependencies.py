from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt_handler import ACCESS_TOKEN_TYPE, decode_token
from app.database.session import get_db
from app.exceptions import UnauthorizedError
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    user_id = decode_token(token, expected_type=ACCESS_TOKEN_TYPE)
    if user_id is None:
        raise UnauthorizedError()

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError()

    return user
