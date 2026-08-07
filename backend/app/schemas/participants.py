from datetime import datetime

from pydantic import BaseModel, Field


class ParticipantCreate(BaseModel):
    meeting_id: int
    nickname: str = Field(min_length=1, max_length=50)
    is_creator: bool = False
