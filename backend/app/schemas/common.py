from pydantic import BaseModel


class BulkIdsRequest(BaseModel):
    ids: list[int]
