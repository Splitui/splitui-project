"""Модуль со схемами для работы с участниками встречи."""
from typing import Any

from pydantic import BaseModel, Field, model_validator, field_validator

from app.schemas.utils.validators import Nickname, CardNumber, PhoneNumber


class ParticipantCreate(BaseModel):
    """Схема для создания участника встречи.

    :ivar nickname: никнейм участника встречи.
    """

    nickname: Nickname


class ParticipantUpdate(BaseModel):
    """Схема для обновления данных участника.

    :ivar nickname: новый никнейм участника.
    :ivar bank_id: id банка.
    :ivar card_number: номер карты.
    :ivar phone_number: номер телефона.
    """

    nickname: Nickname | None = None
    bank_id: int | None = Field(default=None, ge=1)
    card_number: CardNumber | None = None
    phone_number: PhoneNumber | None = None

    @field_validator("card_number", "phone_number", mode="before")
    @classmethod
    def empty_string_to_none(cls, value: Any) -> Any:
        if isinstance(value, str) and not value.strip():
            return None

        return value

    @model_validator(mode="after")
    def validate_bank_data(self):
        has_card = self.card_number is not None
        has_phone = self.phone_number is not None

        if (has_card or has_phone) and self.bank_id is None:
            raise ValueError("Не выбран банк")

        return self
