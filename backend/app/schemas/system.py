from typing import Optional

from pydantic import BaseModel


class ApplicationHealth(BaseModel):
    status: str
    database_connected: bool
    api_version: str
    environment: str
    database_size_bytes: Optional[int]
