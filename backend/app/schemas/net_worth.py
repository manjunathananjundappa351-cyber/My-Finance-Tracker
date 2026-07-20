from datetime import date

from pydantic import BaseModel


class NetWorthPoint(BaseModel):
    snapshot_date: date
    net_worth: float


class NetWorthTimeline(BaseModel):
    points: list[NetWorthPoint]
