from pydantic import BaseModel, Field


class ParticipantCreate(BaseModel):
    nickname: str = Field(min_length=1, max_length=50)
