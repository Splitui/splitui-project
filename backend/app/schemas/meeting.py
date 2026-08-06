from pydantic import BaseModel, Field


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    is_public: bool = False
