"""Модуль со схемами для работы с участниками встречи."""

from pydantic import BaseModel, Field


class ParticipantCreate(BaseModel):
    """Схема для создания участника встречи.

    :ivar nickname: никнейм участника встречи.
    """

    nickname: str = Field(min_length=1, max_length=50)
