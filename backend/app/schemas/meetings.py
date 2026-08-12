"""Модуль со схемами для работы со встречами."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MeetingCreate(BaseModel):
    """Схема для создания встречи.

    :ivar title: Название встречи.
    :ivar meeting_date: Дата и время начала встречи.
    :ivar creator_nickname: Никнейм создателя встречи.
    """

    title: str = Field(min_length=1, max_length=150)
    meeting_date: datetime = Field(default_factory=datetime.now)
    creator_nickname: str
