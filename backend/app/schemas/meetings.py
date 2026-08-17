"""Модуль со схемами для работы со встречами."""

from datetime import datetime, timedelta, UTC

from pydantic import BaseModel, Field, field_validator

from app.schemas.utils.validators import NonEmptyStr, Nickname


class MeetingCreate(BaseModel):
    """Схема для создания встречи.

    :ivar title: Название встречи.
    :ivar start_date: Дата и время начала встречи.
    :ivar creator_nickname: Никнейм создателя встречи.
    """

    title: NonEmptyStr = Field(max_length=150)
    start_date: datetime = Field(default_factory=datetime.now)
    creator_nickname: Nickname

    @field_validator("start_date")
    @classmethod
    def check_start_date(cls, value: datetime) -> datetime:
        if value < datetime.now(tz=UTC) - timedelta(days=1):
            raise ValueError("Дата встречи не может быть в прошлом")
        return value


class MeetingUpdate(BaseModel):
    """Схема для обновления встречи.

    :ivar title: Название встречи.
    :ivar start_date: Дата и время начала встречи.
    """
    title: NonEmptyStr | None = Field(default=None, max_length=150)
    start_date: datetime | None = None

    @field_validator("start_date")
    @classmethod
    def check_start_date(cls, value: datetime) -> datetime | None:
        if value is None:
            return None

        if value < datetime.now(tz=UTC) - timedelta(days=1):
            raise ValueError("Дата встречи не может быть в прошлом")
        return value


class MeetingFinish(BaseModel):
    end_date: datetime
