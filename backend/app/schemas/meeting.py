from datetime import datetime

from pydantic import BaseModel, Field


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    meeting_date: datetime = datetime.now()
    creator_name: str
