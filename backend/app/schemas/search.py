from pydantic import BaseModel


class SearchResult(BaseModel):
    type: str
    id: int
    title: str
    subtitle: str
    path: str


class SearchResponse(BaseModel):
    results: list[SearchResult]
