import os

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.schemas.system import ApplicationHealth

API_VERSION = "0.1.0"


def get_application_health(db: Session) -> ApplicationHealth:
    try:
        db.execute(text("SELECT 1"))
        database_connected = True
    except Exception:
        database_connected = False

    database_size_bytes = None
    if settings.database_url.startswith("sqlite"):
        db_path = settings.database_url.replace("sqlite:///", "", 1)
        if os.path.exists(db_path):
            database_size_bytes = os.path.getsize(db_path)

    return ApplicationHealth(
        status="ok" if database_connected else "degraded",
        database_connected=database_connected,
        api_version=API_VERSION,
        environment=settings.environment,
        database_size_bytes=database_size_bytes,
    )
