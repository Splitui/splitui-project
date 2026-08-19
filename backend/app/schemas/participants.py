"""Модуль со схемами для работы с участниками встречи."""
from datetime import datetime

from pydantic import BaseModel, Field, model_validator

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
    card_number: CardNumber = None
    phone_number: PhoneNumber = None

    @model_validator(mode="after")
    def validate_bank_data(self):
        has_card = self.card_number is not None
        has_phone = self.phone_number is not None

        if (has_card or has_phone) and self.bank_id is None:
            raise ValueError("Не выбран банк")

        return self
