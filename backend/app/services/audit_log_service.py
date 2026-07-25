from sqlalchemy.orm import Session

from app.repositories import audit_log_repo
from app.schemas.audit_log import AuditLogOut


def log(db: Session, user_id: int, action: str, entity_type: str, entity_id: int, summary: str) -> None:
    audit_log_repo.create(db, user_id, action, entity_type, entity_id, summary)


def list_activity(db: Session, user_id: int, limit: int = 100) -> list[AuditLogOut]:
    return [AuditLogOut.model_validate(e) for e in audit_log_repo.list_recent(db, user_id, limit)]
